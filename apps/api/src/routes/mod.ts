import { Router } from 'express';
import { prisma } from '../db/client';
import { requireAuth, requireRole, requireAuthAndCsrf } from '../middleware/auth';
import { writeAuditLog } from '../middleware/audit';
import { logger } from '../index';

const router = Router();

// All mod routes require moderator+ role
router.use(requireAuth);
router.use(requireRole('moderator'));

// ── GET /mod/queue ───────────────────────────────────────
// Get pending items across all queues
router.get('/queue', async (req, res, next) => {
  try {
    const [pendingContributions, pendingTags, newFeedback, flaggedAccounts] = await Promise.all([
      prisma.contribution.findMany({
        where: { status: 'pending' },
        include: {
          user: { select: { id: true, displayName: true } },
          tags: { include: { tag: true } },
        },
        orderBy: { createdAt: 'asc' },
        take: 50,
      }),
      prisma.tag.findMany({
        where: { approved: false },
        orderBy: { createdAt: 'asc' },
        take: 50,
      }),
      prisma.feedback.findMany({
        where: { status: 'new' },
        orderBy: { createdAt: 'asc' },
        take: 50,
      }),
      prisma.moderationFlag.findMany({
        where: { resolved: false },
        include: {
          flaggedUser: { select: { id: true, displayName: true, email: true } },
          flaggedByMod: { select: { id: true, displayName: true } },
        },
        orderBy: { createdAt: 'asc' },
        take: 50,
      }),
    ]);

    res.json({
      success: true,
      data: {
        contributions: pendingContributions,
        tags: pendingTags,
        feedback: newFeedback,
        flags: flaggedAccounts,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ── POST /mod/contributions/:id/decision ─────────────────
router.post(
  '/contributions/:id/decision',
  requireAuthAndCsrf,
  async (req, res, next) => {
    try {
      const user = (req as any).user;
      const { id } = req.params;
      const { decision, reason } = req.body;

      if (!['approved', 'rejected'].includes(decision)) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Decision must be "approved" or "rejected".' },
        });
      }

      const contribution = await prisma.contribution.findUnique({ where: { id } });
      if (!contribution) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Contribution not found.' },
        });
      }

      const before = { status: contribution.status };
      const after = { status: decision };

      await prisma.contribution.update({
        where: { id },
        data: {
          status: decision,
          rejectionReason: decision === 'rejected' ? reason || null : null,
        },
      });

      await writeAuditLog({
        actorId: user.id,
        action: `contribution.${decision}`,
        targetType: 'contribution',
        targetId: id,
        before,
        after,
        req,
      });

      // TODO: Notify contributor of decision

      logger.info({ contributionId: id, decision, modId: user.id }, 'Contribution moderated');

      res.json({
        success: true,
        data: { message: `Contribution ${decision}.` },
      });
    } catch (error) {
      next(error);
    }
  },
);

// ── POST /mod/feedback/:id/status ────────────────────────
router.post(
  '/feedback/:id/status',
  requireAuthAndCsrf,
  async (req, res, next) => {
    try {
      const user = (req as any).user;
      const { id } = req.params;
      const { status, internalNotes } = req.body;

      if (!['in-review', 'resolved', 'wontfix'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid status.' },
        });
      }

      const feedback = await prisma.feedback.findUnique({ where: { id } });
      if (!feedback) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Feedback not found.' },
        });
      }

      await prisma.feedback.update({
        where: { id },
        data: {
          status,
          ...(internalNotes !== undefined && { internalNotes }),
        },
      });

      await writeAuditLog({
        actorId: user.id,
        action: `feedback.${status}`,
        targetType: 'feedback',
        targetId: id,
        before: { status: feedback.status },
        after: { status },
        req,
      });

      res.json({ success: true, data: { message: 'Feedback status updated.' } });
    } catch (error) {
      next(error);
    }
  },
);

// ── POST /mod/tags/:id/approve ───────────────────────────
router.post(
  '/tags/:id/approve',
  requireAuthAndCsrf,
  async (req, res, next) => {
    try {
      const user = (req as any).user;
      const { id } = req.params;

      const tag = await prisma.tag.findUnique({ where: { id } });
      if (!tag) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Tag not found.' },
        });
      }

      await prisma.tag.update({ where: { id }, data: { approved: true } });

      await writeAuditLog({
        actorId: user.id,
        action: 'tag.approve',
        targetType: 'tag',
        targetId: id,
        before: { approved: false },
        after: { approved: true },
        req,
      });

      res.json({ success: true, data: { message: 'Tag approved.' } });
    } catch (error) {
      next(error);
    }
  },
);

// ── POST /mod/flags/:id/resolve ──────────────────────────
router.post(
  '/flags/:id/resolve',
  requireAuthAndCsrf,
  async (req, res, next) => {
    try {
      const user = (req as any).user;
      const { id } = req.params;

      const flag = await prisma.moderationFlag.findUnique({ where: { id } });
      if (!flag) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Flag not found.' },
        });
      }

      await prisma.moderationFlag.update({
        where: { id },
        data: { resolved: true, resolvedAt: new Date() },
      });

      await writeAuditLog({
        actorId: user.id,
        action: 'flag.resolve',
        targetType: 'moderation_flag',
        targetId: id,
        before: { resolved: false },
        after: { resolved: true },
        req,
      });

      res.json({ success: true, data: { message: 'Flag resolved.' } });
    } catch (error) {
      next(error);
    }
  },
);

// ── POST /mod/flags ──────────────────────────────────────
// Flag an account for admin review (mod cannot suspend/delete)
router.post(
  '/flags',
  requireAuthAndCsrf,
  async (req, res, next) => {
    try {
      const user = (req as any).user;
      const { userId, reason } = req.body;

      if (!userId || !reason) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'userId and reason are required.' },
        });
      }

      const flag = await prisma.moderationFlag.create({
        data: {
          flaggedUserId: userId,
          flaggedById: user.id,
          reason,
        },
      });

      await writeAuditLog({
        actorId: user.id,
        action: 'flag.create',
        targetType: 'moderation_flag',
        targetId: flag.id,
        after: { flaggedUserId: userId, reason },
        req,
      });

      res.status(201).json({ success: true, data: { message: 'Account flagged for review.' } });
    } catch (error) {
      next(error);
    }
  },
);

export default router;

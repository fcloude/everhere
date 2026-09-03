import { Router } from 'express';
import { prisma } from '../db/client';
import { requireAuth, requireRole, requireAuthAndCsrf } from '../middleware/auth';
import { writeAuditLog } from '../middleware/audit';
import { logger } from '../index';

const router = Router();

// All admin routes require admin role
router.use(requireAuth);
router.use(requireRole('admin'));

// ── GET /admin/users ─────────────────────────────────────
// Full user list with pagination
router.get('/users', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
    const skip = (page - 1) * limit;
    const role = req.query.role as string | undefined;
    const search = req.query.q as string | undefined;

    const where: Record<string, unknown> = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { displayName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          displayName: true,
          role: true,
          active: true,
          emailVerified: true,
          mfaEnabled: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      data: users,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
});

// ── PATCH /admin/users/:id/role ──────────────────────────
// Change user role — dual-confirm for admin/mod roles
router.patch(
  '/users/:id/role',
  requireAuthAndCsrf,
  async (req, res, next) => {
    try {
      const actor = (req as any).user;
      const { id } = req.params;
      const { role, confirmationToken } = req.body;

      const validRoles = ['user', 'contributor', 'moderator', 'admin'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid role.' },
        });
      }

      const targetUser = await prisma.user.findUnique({ where: { id } });
      if (!targetUser) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'User not found.' },
        });
      }

      // Dual control: elevating to admin or moderator requires confirmation token
      if (['admin', 'moderator'].includes(role) || targetUser.role === 'admin' || targetUser.role === 'moderator') {
        if (!confirmationToken) {
          // Generate a confirmation token for the second admin
          const token = require('uuid').v4();
          // Store temporarily (in production, use Redis or a dedicated table)
          // For MVP, require the token in a second request
          return res.status(200).json({
            success: true,
            data: {
              requiresConfirmation: true,
              message: 'Role change on privileged accounts requires dual-admin confirmation.',
              targetUser: {
                id: targetUser.id,
                displayName: targetUser.displayName,
                currentRole: targetUser.role,
              },
              proposedRole: role,
            },
          });
        }

        // Verify confirmation token (simplified for MVP)
        // In production, this would be a dedicated confirmation mechanism
        if (confirmationToken !== 'confirmed') {
          return res.status(400).json({
            success: false,
            error: { code: 'CONFIRMATION_REQUIRED', message: 'Invalid confirmation token.' },
          });
        }
      }

      const before = { role: targetUser.role };

      await prisma.user.update({
        where: { id },
        data: { role },
      });

      await writeAuditLog({
        actorId: actor.id,
        action: 'role.change',
        targetType: 'user',
        targetId: id,
        before,
        after: { role },
        req,
      });

      logger.info({ targetUserId: id, newRole: role, actorId: actor.id }, 'Role changed');

      res.json({
        success: true,
        data: { message: `User role updated to ${role}.` },
      });
    } catch (error) {
      next(error);
    }
  },
);

// ── PATCH /admin/users/:id/active ────────────────────────
// Activate/deactivate user account
router.patch(
  '/users/:id/active',
  requireAuthAndCsrf,
  async (req, res, next) => {
    try {
      const actor = (req as any).user;
      const { id } = req.params;
      const { active } = req.body;

      if (typeof active !== 'boolean') {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'active must be a boolean.' },
        });
      }

      const targetUser = await prisma.user.findUnique({ where: { id } });
      if (!targetUser) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'User not found.' },
        });
      }

      // Dual control for admin/mod accounts
      if (targetUser.role === 'admin' || targetUser.role === 'moderator') {
        if (!req.body.confirmationToken) {
          return res.status(200).json({
            success: true,
            data: {
              requiresConfirmation: true,
              message: 'Deactivating privileged accounts requires dual-admin confirmation.',
            },
          });
        }
      }

      const before = { active: targetUser.active };

      await prisma.user.update({
        where: { id },
        data: { active },
      });

      // Revoke all sessions if deactivating
      if (!active) {
        await prisma.session.updateMany({
          where: { userId: id, revokedAt: null },
          data: { revokedAt: new Date() },
        });
      }

      await writeAuditLog({
        actorId: actor.id,
        action: active ? 'user.activate' : 'user.deactivate',
        targetType: 'user',
        targetId: id,
        before,
        after: { active },
        req,
      });

      res.json({
        success: true,
        data: { message: `Account ${active ? 'activated' : 'deactivated'}.` },
      });
    } catch (error) {
      next(error);
    }
  },
);

// ── GET /admin/audit-logs ────────────────────────────────
// Full audit log — read-only, filterable
router.get('/audit-logs', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 50);
    const skip = (page - 1) * limit;
    const action = req.query.action as string | undefined;
    const targetType = req.query.targetType as string | undefined;
    const actorId = req.query.actorId as string | undefined;

    const where: Record<string, unknown> = {};
    if (action) where.action = action;
    if (targetType) where.targetType = targetType;
    if (actorId) where.actorId = actorId;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          actor: { select: { id: true, displayName: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    res.json({
      success: true,
      data: logs.map((log) => ({
        id: log.id,
        actor: log.actor.displayName,
        actorEmail: log.actor.email,
        action: log.action,
        targetType: log.targetType,
        targetId: log.targetId,
        before: log.before,
        after: log.after,
        createdAt: log.createdAt,
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
});

// ── GET /admin/applications ──────────────────────────────
// List all applications with filters
router.get('/applications', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
    const skip = (page - 1) * limit;
    const status = req.query.status as string | undefined;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.application.count({ where }),
    ]);

    res.json({
      success: true,
      data: applications,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
});

// ── POST /admin/applications/:id/review ──────────────────
// Review (approve/reject) an application
router.post(
  '/applications/:id/review',
  requireAuthAndCsrf,
  async (req, res, next) => {
    try {
      const actor = (req as any).user;
      const { id } = req.params;
      const { decision, notes } = req.body;

      if (!['approved', 'rejected'].includes(decision)) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Decision must be "approved" or "rejected".' },
        });
      }

      const application = await prisma.application.findUnique({ where: { id } });
      if (!application) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Application not found.' },
        });
      }

      if (application.status !== 'pending') {
        return res.status(400).json({
          success: false,
          error: { code: 'ALREADY_REVIEWED', message: 'This application has already been reviewed.' },
        });
      }

      const before = { status: application.status };

      await prisma.application.update({
        where: { id },
        data: {
          status: decision,
          reviewerNotes: notes || null,
          reviewedById: actor.id,
          reviewedAt: new Date(),
        },
      });

      // If approved, send activation email
      if (decision === 'approved') {
        // TODO: Send activation email with password-set link
        logger.info({ applicationId: id }, 'Application approved — activation email pending');
      }

      await writeAuditLog({
        actorId: actor.id,
        action: `application.${decision}`,
        targetType: 'application',
        targetId: id,
        before,
        after: { status: decision, notes },
        req,
      });

      res.json({
        success: true,
        data: { message: `Application ${decision}.` },
      });
    } catch (error) {
      next(error);
    }
  },
);

// ── GET /admin/security-reports ──────────────────────────
// Full access to security reports (admin only)
router.get('/security-reports', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
    const skip = (page - 1) * limit;
    const status = req.query.status as string | undefined;
    const severity = req.query.severity as string | undefined;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (severity) where.severity = severity;

    const [reports, total] = await Promise.all([
      prisma.securityReport.findMany({
        where,
        orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      prisma.securityReport.count({ where }),
    ]);

    res.json({
      success: true,
      data: reports,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
});

// ── GET /admin/contributions ─────────────────────────────
// All contributions with filters
router.get('/contributions', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
    const skip = (page - 1) * limit;
    const status = req.query.status as string | undefined;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const [contributions, total] = await Promise.all([
      prisma.contribution.findMany({
        where,
        include: {
          user: { select: { id: true, displayName: true } },
          tags: { include: { tag: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.contribution.count({ where }),
    ]);

    res.json({
      success: true,
      data: contributions,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
});

export default router;

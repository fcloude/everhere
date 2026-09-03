import { Router } from 'express';
import { prisma } from '../db/client';
import { requireAuth, requireRole, requireAuthAndCsrf } from '../middleware/auth';
import { writeAuditLog } from '../middleware/audit';

const router = Router();

// ── GET /community-links ─────────────────────────────────
// Public: enabled community links
router.get('/', async (_req, res, next) => {
  try {
    const links = await prisma.communityLink.findMany({
      where: { enabled: true },
      orderBy: { order: 'asc' },
    });

    res.json({
      success: true,
      data: links.map((l) => ({
        id: l.id,
        platform: l.platform,
        url: l.url,
        label: l.label,
      })),
    });
  } catch (error) {
    next(error);
  }
});

// ── PATCH /community-links/:id ───────────────────────────
// Admin only: update a community link
router.patch(
  '/:id',
  requireAuthAndCsrf,
  requireRole('admin'),
  async (req, res, next) => {
    try {
      const user = (req as any).user;
      const { id } = req.params;
      const { url, label, enabled, order } = req.body;

      const before = await prisma.communityLink.findUnique({ where: { id } });
      if (!before) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Link not found.' },
        });
      }

      const after = await prisma.communityLink.update({
        where: { id },
        data: {
          ...(url !== undefined && { url }),
          ...(label !== undefined && { label }),
          ...(enabled !== undefined && { enabled }),
          ...(order !== undefined && { order }),
        },
      });

      await writeAuditLog({
        actorId: user.id,
        action: 'community_link.update',
        targetType: 'community_link',
        targetId: id,
        before: before as any,
        after: after as any,
        req,
      });

      res.json({ success: true, data: after });
    } catch (error) {
      next(error);
    }
  },
);

export default router;

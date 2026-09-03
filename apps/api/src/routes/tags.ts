import { Router } from 'express';
import { prisma } from '../db/client';
import { requireAuth, requireRole, requireAuthAndCsrf } from '../middleware/auth';

const router = Router();

// ── GET /tags ────────────────────────────────────────────
// Public: approved tags only
router.get('/', async (_req, res, next) => {
  try {
    const tags = await prisma.tag.findMany({
      where: { approved: true },
      orderBy: { name: 'asc' },
    });

    res.json({
      success: true,
      data: tags.map((t) => ({ id: t.id, name: t.name })),
    });
  } catch (error) {
    next(error);
  }
});

// ── POST /tags ───────────────────────────────────────────
// Moderator+ only: propose a new tag (auto-approved if created by mod/admin)
router.post(
  '/',
  requireAuthAndCsrf,
  requireRole('moderator'),  // CSRF + auth + role check
  async (req, res, next) => {
    try {
      const { name } = req.body;
      const user = (req as any).user;

      if (!name || typeof name !== 'string' || name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Tag name must be at least 2 characters.' },
        });
      }

      const normalizedName = name.trim().toLowerCase();

      const existing = await prisma.tag.findUnique({ where: { name: normalizedName } });
      if (existing) {
        return res.status(409).json({
          success: false,
          error: { code: 'CONFLICT', message: 'Tag already exists.' },
        });
      }

      const tag = await prisma.tag.create({
        data: {
          name: normalizedName,
          approved: user.role === 'admin', // Auto-approve for admins
        },
      });

      res.status(201).json({
        success: true,
        data: {
          id: tag.id,
          name: tag.name,
          approved: tag.approved,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;

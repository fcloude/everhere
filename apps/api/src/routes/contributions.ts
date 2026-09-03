import { Router } from 'express';
import { prisma } from '../db/client';
import { AppError } from '../middleware/errorHandler';
import { validate } from '../middleware/validate';
import { requireAuth, requireRole, requireAuthAndCsrf } from '../middleware/auth';
import { contributionSchema } from '@everhere/shared';
import { logger } from '../index';

const router = Router();

// ── GET /contributions/public ────────────────────────────
// Public: only approved + public contributions
router.get('/public', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
    const skip = (page - 1) * limit;

    const [contributions, total] = await Promise.all([
      prisma.contribution.findMany({
        where: { status: 'approved' },
        include: {
          user: { select: { id: true, displayName: true } },
          tags: { include: { tag: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.contribution.count({ where: { status: 'approved' } }),
    ]);

    res.json({
      success: true,
      data: contributions.map((c) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        url: c.url,
        author: c.user.displayName,
        tags: c.tags.map((t) => ({ id: t.tag.id, name: t.tag.name })),
        createdAt: c.createdAt,
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
});

// ── POST /contributions ──────────────────────────────────
// Contributor+ only: create a pending contribution
router.post(
  '/',
  requireAuthAndCsrf,
  requireRole('contributor'),
  validate(contributionSchema),
  async (req, res, next) => {
    try {
      const user = (req as any).user;
      const { title, description, url, tagIds } = req.body;

      const contribution = await prisma.contribution.create({
        data: {
          userId: user.id,
          title,
          description: description || null,
          url,
          tags: tagIds?.length
            ? {
                create: tagIds.map((tagId: string) => ({
                  tagId,
                })),
              }
            : undefined,
        },
        include: { tags: { include: { tag: true } } },
      });

      // Create initial revision
      await prisma.contributionRevision.create({
        data: {
          contributionId: contribution.id,
          title,
          description: description || null,
          url,
        },
      });

      logger.info({ contributionId: contribution.id, userId: user.id }, 'Contribution submitted');

      res.status(201).json({
        success: true,
        data: {
          id: contribution.id,
          status: contribution.status,
          message: 'Contribution submitted for review.',
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

// ── GET /contributions/mine ──────────────────────────────
// Contributor+ only: own contribution history
router.get(
  '/mine',
  requireAuth,
  requireRole('contributor'),
  async (req, res, next) => {
    try {
      const user = (req as any).user;

      const contributions = await prisma.contribution.findMany({
        where: { userId: user.id },
        include: {
          tags: { include: { tag: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json({
        success: true,
        data: contributions.map((c) => ({
          id: c.id,
          title: c.title,
          description: c.description,
          url: c.url,
          status: c.status,
          tags: c.tags.map((t) => ({ id: t.tag.id, name: t.tag.name })),
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
        })),
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;

import { Router } from 'express';
import { prisma } from '../db/client';
import { validate } from '../middleware/validate';
import { requireAuth, requireRole, requireAuthAndCsrf } from '../middleware/auth';
import { feedbackSchema } from '@everhere/shared';
import { logger } from '../index';

const router = Router();

// ── POST /feedback ───────────────────────────────────────
// Public: submit general feedback (anonymous allowed)
router.post('/', validate(feedbackSchema), async (req, res, next) => {
  try {
    const { category, title, description, email, website } = req.body;

    // Honeypot check
    if (website) {
      // Silently accept but don't store — bot trap
      return res.status(201).json({
        success: true,
        data: { message: 'Thank you for your feedback!' },
      });
    }

    // Link to user if authenticated
    const sessionId = req.cookies?.session_id;
    let userId: string | null = null;
    if (sessionId) {
      const session = await prisma.session.findUnique({
        where: { id: sessionId },
      });
      if (session && !session.revokedAt) {
        userId = session.userId;
      }
    }

    const feedback = await prisma.feedback.create({
      data: {
        category,
        title,
        description,
        email: email || null,
        userId,
        status: 'new',
      },
    });

    logger.info({ feedbackId: feedback.id }, 'Feedback submitted');

    res.status(201).json({
      success: true,
      data: { message: 'Thank you for your feedback! We appreciate it.' },
    });
  } catch (error) {
    next(error);
  }
});

export default router;

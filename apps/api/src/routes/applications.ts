import { Router } from 'express';
import { prisma } from '../db/client';
import { AppError } from '../middleware/errorHandler';
import { validate } from '../middleware/validate';
import { requireAuth, requireRole, requireAuthAndCsrf } from '../middleware/auth';
import { applicationSchema } from '@everhere/shared';
import { logger } from '../index';

const router = Router();

// ── POST /applications ───────────────────────────────────
// Public endpoint: submit a contribution application
router.post('/', validate(applicationSchema), async (req, res, next) => {
  try {
    const { displayName, email, skills, customSkill, preferredRole, portfolioLinks, message } =
      req.body;

    // Check for duplicate application (same email, pending)
    const existing = await prisma.application.findFirst({
      where: {
        email: email.toLowerCase(),
        status: 'pending',
      },
    });

    if (existing) {
      return res.status(200).json({
        success: true,
        data: {
          message:
            'If you have already applied, you will be notified of the status. Please do not submit duplicate applications.',
          applicationId: existing.id,
        },
      });
    }

    // Combine skills with custom skill
    const allSkills = [...skills];
    if (customSkill && customSkill.trim()) {
      allSkills.push(customSkill.trim());
    }

    const application = await prisma.application.create({
      data: {
        displayName,
        email: email.toLowerCase(),
        skills: allSkills,
        preferredRole,
        portfolioLinks: portfolioLinks || [],
        message: message || null,
        status: 'pending',
      },
    });

    logger.info({ applicationId: application.id }, 'New application submitted');

    // Generic response — no PII leakage
    res.status(201).json({
      success: true,
      data: {
        message: 'Your application has been submitted. We will review it and get back to you.',
      },
    });
  } catch (error) {
    next(error);
  }
});

// ── GET /applications/:id/status ─────────────────────────
// Status check with token — no PII exposure
router.get('/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { token } = req.query;

    if (!token) {
      return next(new AppError('Access token required', 400, 'TOKEN_REQUIRED'));
    }

    const application = await prisma.application.findUnique({ where: { id } });
    if (!application) {
      return next(new AppError('Application not found', 404, 'NOT_FOUND'));
    }

    // Verify token matches (simple: email-based link token)
    const crypto = require('crypto');
    const expectedToken = crypto
      .createHash('sha256')
      .update(application.email)
      .digest('hex')
      .slice(0, 16);

    if (token !== expectedToken) {
      return next(new AppError('Invalid access token', 403, 'FORBIDDEN'));
    }

    res.json({
      success: true,
      data: {
        status: application.status,
        submittedAt: application.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;

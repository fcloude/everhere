import { Router } from 'express';
import { prisma } from '../db/client';
import { validate } from '../middleware/validate';
import { requireAuth, requireRole, requireAuthAndCsrf } from '../middleware/auth';
import { securityReportSchema } from '@everhere/shared';
import { logger } from '../index';

const router = Router();

// ── POST /security-reports ───────────────────────────────
// Public: submit a responsible security disclosure
router.post('/', validate(securityReportSchema), async (req, res, next) => {
  try {
    const { title, description, severity, proofOfConcept, contactEmail, website } = req.body;

    // Honeypot check
    if (website) {
      return res.status(201).json({
        success: true,
        data: { message: 'Thank you for your report.' },
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

    const report = await prisma.securityReport.create({
      data: {
        title,
        description,
        severity,
        proofOfConcept: proofOfConcept || null,
        contactEmail: contactEmail || null,
        userId,
        status: 'new',
      },
    });

    // TODO: Send acknowledgment email

    logger.info(
      { reportId: report.id, severity },
      'Security report submitted',
    );

    res.status(201).json({
      success: true,
      data: {
        reportId: report.id,
        message:
          'Thank you for your responsible disclosure. We will review it and contact you if follow-up is needed.',
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;

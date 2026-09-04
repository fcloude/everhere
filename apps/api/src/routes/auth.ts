import { Router } from 'express';
import argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../db/client';
import { AppError } from '../middleware/errorHandler';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema, passwordResetRequestSchema } from '@everhere/shared';
import { logger } from '../index';

const router = Router();

// ── POST /auth/register ──────────────────────────────────
router.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const { displayName, email, password } = req.body;

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      // Generic response — no account enumeration
      return res.status(200).json({
        success: true,
        data: {
          message: 'If this email is not already registered, you will receive a verification email.',
        },
      });
    }

    const passwordHash = await argon2.hash(password);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        displayName,
        passwordHash,
        role: 'user',
      },
    });

    // Create email verification token
    const token = uuidv4();
    const tokenHash = await argon2.hash(token);
    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    // TODO: Send verification email via transactional email provider

    res.status(201).json({
      success: true,
      data: {
        message: 'Account created. Please check your email to verify your account.',
      },
    });
  } catch (error) {
    next(error);
  }
});

// ── POST /auth/login ─────────────────────────────────────
router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || !user.active) {
      // Generic error — no account enumeration
      return next(new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS'));
    }

    const validPassword = await argon2.verify(user.passwordHash, password);
    if (!validPassword) {
      logger.warn({ userId: user.id }, 'Failed login attempt');
      return next(new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS'));
    }

    // Create session
    const sessionId = uuidv4();
    const maxAge = parseInt(process.env.SESSION_MAX_AGE_HOURS || '12', 10);
    const expiresAt = new Date(Date.now() + maxAge * 60 * 60 * 1000);

    const ipHash = require('crypto')
      .createHash('sha256')
      .update(req.ip || 'unknown')
      .digest('hex')
      .slice(0, 16);

    await prisma.session.create({
      data: {
        id: sessionId,
        userId: user.id,
        expiresAt,
        ipHash,
        userAgent: req.headers['user-agent'] || undefined,
      },
    });

    // Set session cookie
    // Use SameSite=None for cross-origin deployments (Vercel frontend + Render API)
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('session_id', sessionId, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: maxAge * 60 * 60 * 1000,
      path: '/',
    });

    // Set CSRF token (double-submit pattern)
    const csrfToken = uuidv4();
    res.cookie('csrf_token', csrfToken, {
      httpOnly: false, // JS needs to read this
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: maxAge * 60 * 60 * 1000,
      path: '/',
    });

    logger.info({ userId: user.id }, 'User logged in');

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          role: user.role,
        },
        csrfToken,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ── POST /auth/logout ────────────────────────────────────
router.post('/logout', requireAuth, async (req, res, next) => {
  try {
    const sessionId = req.cookies?.session_id;
    if (sessionId) {
      await prisma.session.update({
        where: { id: sessionId },
        data: { revokedAt: new Date() },
      });
    }

    const isProd = process.env.NODE_ENV === 'production';
    res.clearCookie('session_id', { path: '/', sameSite: isProd ? 'none' : 'lax', secure: isProd });
    res.clearCookie('csrf_token', { path: '/', sameSite: isProd ? 'none' : 'lax', secure: isProd });

    res.json({ success: true, data: { message: 'Logged out successfully.' } });
  } catch (error) {
    next(error);
  }
});

// ── POST /auth/password-reset/request ────────────────────
router.post(
  '/password-reset/request',
  validate(passwordResetRequestSchema),
  async (req, res, next) => {
    try {
      const { email } = req.body;

      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      // Always return success — no account enumeration
      const genericResponse = {
        success: true,
        data: {
          message: 'If an account with that email exists, you will receive a password reset link.',
        },
      };

      if (!user) {
        return res.json(genericResponse);
      }

      // Invalidate any existing reset tokens
      await prisma.passwordResetToken.updateMany({
        where: { userId: user.id, usedAt: null },
        data: { usedAt: new Date() },
      });

      // Create new reset token
      const token = uuidv4();
      const tokenHash = await argon2.hash(token);
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        },
      });

      // TODO: Send password reset email

      logger.info({ userId: user.id }, 'Password reset requested');
      res.json(genericResponse);
    } catch (error) {
      next(error);
    }
  },
);

// ── POST /auth/password-reset/confirm ────────────────────
router.post('/password-reset/confirm', async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return next(new AppError('Token and password are required', 400, 'VALIDATION_ERROR'));
    }

    // Find valid token
    const resetTokens = await prisma.passwordResetToken.findMany({
      where: { usedAt: null },
      include: { user: true },
    });

    let validToken = null;
    for (const rt of resetTokens) {
      if (new Date() > rt.expiresAt) continue;
      const valid = await argon2.verify(rt.tokenHash, token);
      if (valid) {
        validToken = rt;
        break;
      }
    }

    if (!validToken) {
      return next(new AppError('Invalid or expired token', 400, 'INVALID_TOKEN'));
    }

    // Update password
    const passwordHash = await argon2.hash(password);
    await prisma.user.update({
      where: { id: validToken.userId },
      data: { passwordHash },
    });

    // Mark token as used
    await prisma.passwordResetToken.update({
      where: { id: validToken.id },
      data: { usedAt: new Date() },
    });

    // Revoke all sessions
    await prisma.session.updateMany({
      where: { userId: validToken.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    logger.info({ userId: validToken.userId }, 'Password reset completed');

    res.json({
      success: true,
      data: { message: 'Password has been reset. Please log in with your new password.' },
    });
  } catch (error) {
    next(error);
  }
});

// ── POST /auth/verify-email ──────────────────────────────
router.post('/verify-email', async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return next(new AppError('Token is required', 400, 'VALIDATION_ERROR'));
    }

    const tokens = await prisma.emailVerificationToken.findMany({
      where: { usedAt: null },
    });

    let validToken = null;
    for (const vt of tokens) {
      if (new Date() > vt.expiresAt) continue;
      const valid = await argon2.verify(vt.tokenHash, token);
      if (valid) {
        validToken = vt;
        break;
      }
    }

    if (!validToken) {
      return next(new AppError('Invalid or expired token', 400, 'INVALID_TOKEN'));
    }

    await prisma.user.update({
      where: { id: validToken.userId },
      data: { emailVerified: true },
    });

    await prisma.emailVerificationToken.update({
      where: { id: validToken.id },
      data: { usedAt: new Date() },
    });

    res.json({
      success: true,
      data: { message: 'Email verified successfully.' },
    });
  } catch (error) {
    next(error);
  }
});

export default router;

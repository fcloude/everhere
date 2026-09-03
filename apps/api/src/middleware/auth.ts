import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../db/client';
import { AppError } from './errorHandler';
import { logger } from '../index';

// ── Auth middleware: require valid session ────────────────

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const sessionId = req.cookies?.session_id;
    if (!sessionId) {
      throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
    }

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: true },
    });

    if (!session || session.revokedAt) {
      throw new AppError('Invalid or expired session', 401, 'UNAUTHORIZED');
    }

    if (new Date() > session.expiresAt) {
      throw new AppError('Session expired', 401, 'SESSION_EXPIRED');
    }

    if (!session.user.active) {
      throw new AppError('Account is deactivated', 403, 'ACCOUNT_DEACTIVATED');
    }

    // Update last active
    await prisma.session.update({
      where: { id: sessionId },
      data: { lastActiveAt: new Date() },
    });

    // Attach user to request
    (req as any).user = session.user;
    (req as any).sessionId = sessionId;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      logger.error({ error }, 'Auth middleware error');
      next(new AppError('Authentication error', 500, 'INTERNAL_ERROR', false));
    }
  }
}

// ── Optional auth: attach user if session exists ─────────

export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const sessionId = req.cookies?.session_id;
    if (!sessionId) {
      return next();
    }

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: true },
    });

    if (session && !session.revokedAt && new Date() <= session.expiresAt && session.user.active) {
      (req as any).user = session.user;
      (req as any).sessionId = sessionId;
    }

    next();
  } catch {
    // Silent — optional auth should not block
    next();
  }
}

// ── RBAC middleware: require specific roles ───────────────

const ROLE_HIERARCHY: Record<string, number> = {
  visitor: 0,
  user: 1,
  contributor: 2,
  moderator: 3,
  admin: 4,
};

export function requireRole(...allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) {
      return next(new AppError('Authentication required', 401, 'UNAUTHORIZED'));
    }

    const userLevel = ROLE_HIERARCHY[user.role] ?? 0;
    const hasPermission = allowedRoles.some((role) => {
      const requiredLevel = ROLE_HIERARCHY[role] ?? 0;
      return userLevel >= requiredLevel;
    });

    if (!hasPermission) {
      return next(new AppError('Insufficient permissions', 403, 'FORBIDDEN'));
    }

    next();
  };
}

// ── CSRF middleware: validate double-submit token ─────────

export function requireCsrf(req: Request, _res: Response, next: NextFunction) {
  const csrfToken = req.headers['x-csrf-token'] as string;
  const csrfCookie = req.cookies?.csrf_token;

  if (!csrfToken || !csrfCookie || csrfToken !== csrfCookie) {
    return next(new AppError('Invalid CSRF token', 403, 'CSRF_INVALID'));
  }

  next();
}

// ── Middleware chain: auth + CSRF for state-changing routes

export function requireAuthAndCsrf(req: Request, res: Response, next: NextFunction) {
  requireAuth(req, res, (err) => {
    if (err) return next(err);
    requireCsrf(req, res, next);
  });
}

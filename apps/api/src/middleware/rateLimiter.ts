import rateLimit from 'express-rate-limit';
import { RATE_LIMITS } from '@everhere/shared';

function createLimiter(windowMs: number, max: number, message: string) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message,
      },
    },
    keyGenerator: (req) => {
      // Use X-Forwarded-For if behind proxy, otherwise IP
      return (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || 'unknown';
    },
  });
}

export function createRateLimiters() {
  return {
    login: createLimiter(
      RATE_LIMITS.LOGIN.windowMs,
      RATE_LIMITS.LOGIN.max,
      'Too many login attempts. Please try again later.',
    ),
    register: createLimiter(
      RATE_LIMITS.REGISTER.windowMs,
      RATE_LIMITS.REGISTER.max,
      'Too many registration attempts. Please try again later.',
    ),
    passwordReset: createLimiter(
      RATE_LIMITS.PASSWORD_RESET.windowMs,
      RATE_LIMITS.PASSWORD_RESET.max,
      'Too many password reset attempts. Please try again later.',
    ),
    application: createLimiter(
      RATE_LIMITS.APPLICATION.windowMs,
      RATE_LIMITS.APPLICATION.max,
      'Too many application submissions. Please try again later.',
    ),
    feedback: createLimiter(
      RATE_LIMITS.FEEDBACK.windowMs,
      RATE_LIMITS.FEEDBACK.max,
      'Too many feedback submissions. Please try again later.',
    ),
    securityReport: createLimiter(
      RATE_LIMITS.SECURITY_REPORT.windowMs,
      RATE_LIMITS.SECURITY_REPORT.max,
      'Too many security report submissions. Please try again later.',
    ),
  };
}

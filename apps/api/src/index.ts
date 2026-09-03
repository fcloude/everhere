import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pino from 'pino';
import { createRateLimiters } from './middleware/rateLimiter';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { requestIdMiddleware } from './middleware/requestId';
import authRoutes from './routes/auth';
import applicationRoutes from './routes/applications';
import contributionRoutes from './routes/contributions';
import feedbackRoutes from './routes/feedback';
import securityReportRoutes from './routes/securityReports';
import profileRoutes from './routes/profile';
import tagRoutes from './routes/tags';
import communityLinkRoutes from './routes/communityLinks';
import modRoutes from './routes/mod';
import adminRoutes from './routes/admin';

// ── Logger ───────────────────────────────────────────────
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport:
    process.env.NODE_ENV !== 'production'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
});

const app = express();

// ── Security Headers ────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"], // Tailwind
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }),
);

// ── CORS ─────────────────────────────────────────────────
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'X-CSRF-Token', 'X-Request-ID'],
  }),
);

// ── Body Parsing ─────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

// ── Request ID & Logging ────────────────────────────────
app.use(requestIdMiddleware);

// ── Rate Limiters ───────────────────────────────────────
const rateLimiters = createRateLimiters();
app.use('/api/v1/auth/login', rateLimiters.login);
app.use('/api/v1/auth/register', rateLimiters.register);
app.use('/api/v1/auth/password-reset', rateLimiters.passwordReset);
app.use('/api/v1/auth/verify-email', rateLimiters.passwordReset); // Reuse limiter
app.use('/api/v1/applications', rateLimiters.application);
app.use('/api/v1/feedback', rateLimiters.feedback);
app.use('/api/v1/security-reports', rateLimiters.securityReport);

// ── Health Check ─────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── API Routes ───────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/applications', applicationRoutes);
app.use('/api/v1/contributions', contributionRoutes);
app.use('/api/v1/feedback', feedbackRoutes);
app.use('/api/v1/security-reports', securityReportRoutes);
app.use('/api/v1/me', profileRoutes);
app.use('/api/v1/tags', tagRoutes);
app.use('/api/v1/community-links', communityLinkRoutes);
app.use('/api/v1/mod', modRoutes);
app.use('/api/v1/admin', adminRoutes);

// ── Error Handling ───────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ── Start Server ─────────────────────────────────────────
const PORT = parseInt(process.env.PORT || '3001', 10);

app.listen(PORT, () => {
  logger.info(`EVERHERE API running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

export default app;

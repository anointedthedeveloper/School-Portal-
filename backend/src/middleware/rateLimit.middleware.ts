import rateLimit from 'express-rate-limit';
import { env } from '../config/environment';

const message = (text: string) => ({ success: false, message: text, code: 'RATE_LIMITED' });

export const apiLimiter = rateLimit({
  windowMs: 60_000,
  limit: env.isProduction ? 300 : 2000,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: message('Too many requests. Please slow down.'),
});

/** Strict limiter for credential endpoints; successful logins do not count against the budget. */
export const authLimiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: env.isProduction ? 10 : 100,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: message('Too many attempts. Try again in a few minutes.'),
});

/** Per-integration limiter; the budget comes from the CBTIntegration record. */
export const cbtLimiter = rateLimit({
  windowMs: 60_000,
  limit: (req) => req.cbtClient?.rateLimitPerMinute ?? 60,
  keyGenerator: (req) => req.cbtClient?.clientId ?? req.ip ?? 'unknown',
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: message('Integration rate limit exceeded.'),
});

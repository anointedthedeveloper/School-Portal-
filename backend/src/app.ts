import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import { env } from './config/environment';
import { logger } from './utils/logger';
import { apiLimiter } from './middleware/rateLimit.middleware';
import { rejectUnsafeKeys } from './middleware/sanitize.middleware';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import routes from './routes';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  // Needed for correct client IPs (rate limiting, audit) behind a reverse proxy.
  if (env.isProduction) app.set('trust proxy', 1);

  app.use(helmet());
  app.use(
    cors({
      origin(origin, cb) {
        // Non-browser clients (CBT Exam Box, curl) send no Origin header.
        if (!origin || env.clientOrigins.includes(origin)) return cb(null, true);
        cb(null, false);
      },
      credentials: true,
    }),
  );
  app.use(pinoHttp({ logger, autoLogging: { ignore: (req) => req.url === '/api/health' } }));
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());
  app.use(rejectUnsafeKeys);
  app.use('/api', apiLimiter, routes);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

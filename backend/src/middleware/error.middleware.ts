import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { Error as MongooseError } from 'mongoose';
import { JsonWebTokenError } from 'jsonwebtoken';
import { AppError } from '../utils/AppError';
import { env } from '../config/environment';
import { logger } from '../utils/logger';

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(AppError.notFound(`Route not found: ${req.method} ${req.originalUrl.split('?')[0]}`));
};

interface Normalised {
  status: number;
  code: string;
  message: string;
  errors?: unknown;
}

function normalise(err: unknown): Normalised {
  if (err instanceof AppError) {
    return { status: err.statusCode, code: err.code, message: err.message, errors: err.details };
  }
  if (err instanceof ZodError) {
    return {
      status: 400,
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      errors: err.issues.map((i) => ({ field: i.path.filter((p) => p !== 'body').join('.'), message: i.message })),
    };
  }
  if (err instanceof MongooseError.ValidationError) {
    return {
      status: 400,
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      errors: Object.values(err.errors).map((e) => ({ field: e.path, message: e.message })),
    };
  }
  if (err instanceof MongooseError.CastError) {
    return { status: 400, code: 'INVALID_ID', message: `Invalid value for ${err.path}` };
  }
  if (err instanceof JsonWebTokenError) {
    return { status: 401, code: 'UNAUTHORIZED', message: 'Invalid or expired token' };
  }
  const e = err as { code?: number; keyPattern?: Record<string, unknown>; type?: string; status?: number; name?: string };
  if (e?.code === 11000) {
    const field = Object.keys(e.keyPattern ?? {})[0];
    return { status: 409, code: 'DUPLICATE', message: field ? `A record with this ${field} already exists` : 'Duplicate record' };
  }
  if (e?.type === 'entity.parse.failed') return { status: 400, code: 'BAD_JSON', message: 'Malformed JSON body' };
  if (e?.type === 'entity.too.large') return { status: 413, code: 'PAYLOAD_TOO_LARGE', message: 'Request body too large' };
  if (e?.name === 'MongoServerSelectionError' || e?.name === 'MongoNetworkError') {
    return { status: 503, code: 'DATABASE_UNAVAILABLE', message: 'Database temporarily unavailable' };
  }
  return { status: 500, code: 'INTERNAL_ERROR', message: 'Something went wrong on our side' };
}

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const n = normalise(err);
  const unexpected = n.status >= 500 && !(err instanceof AppError);
  if (unexpected) logger.error({ err, path: req.path }, 'Unhandled error');
  else logger.debug({ err: String(err), path: req.path }, 'Request error');

  res.status(n.status).json({
    success: false,
    message: n.message,
    code: n.code,
    ...(n.errors ? { errors: n.errors } : {}),
    // Stack traces only ever leave the server in development.
    ...(!env.isProduction && unexpected ? { stack: (err as Error)?.stack } : {}),
  });
};

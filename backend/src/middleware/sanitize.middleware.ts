import type { RequestHandler } from 'express';
import { AppError } from '../utils/AppError';

function hasUnsafeKey(value: unknown, depth = 0): boolean {
  if (depth > 10 || value === null || typeof value !== 'object') return false;
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (key.startsWith('$') || key.includes('.') || key === '__proto__') return true;
    if (hasUnsafeKey(child, depth + 1)) return true;
  }
  return false;
}

/** Rejects NoSQL operator injection ({"$ne": ...}) and prototype-pollution keys in any input. */
export const rejectUnsafeKeys: RequestHandler = (req, _res, next) => {
  if (hasUnsafeKey(req.body) || hasUnsafeKey(req.query) || hasUnsafeKey(req.params)) {
    return next(AppError.badRequest('Request contains disallowed characters in field names'));
  }
  next();
};

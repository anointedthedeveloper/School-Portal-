import type { RequestHandler } from 'express';
import type { ZodTypeAny } from 'zod';

/**
 * Validates `{ body, query, params }` against a zod schema and replaces them with the
 * parsed (coerced, stripped) values so controllers only see validated input.
 */
export const validate =
  (schema: ZodTypeAny): RequestHandler =>
  (req, _res, next) => {
    const result = schema.safeParse({ body: req.body, query: req.query, params: req.params });
    if (!result.success) return next(result.error);
    const data = result.data as { body?: unknown; query?: Record<string, unknown>; params?: Record<string, string> };
    if (data.body !== undefined) req.body = data.body;
    if (data.query !== undefined) req.query = data.query as typeof req.query;
    if (data.params !== undefined) req.params = data.params;
    next();
  };

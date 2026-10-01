import { Router } from 'express';
import type { Permission } from '../config/permissions';
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/role.middleware';
import { AppError } from '../utils/AppError';

/**
 * Namespace reserved for a later phase. Authentication and authorization are already
 * enforced, so a module cannot ship accidentally unprotected; the handler itself
 * answers 501 until the real implementation replaces this router.
 */
export function placeholderRouter(moduleName: string, readPermission: Permission): Router {
  const router = Router();
  router.use(authenticate, requirePermission(readPermission));
  router.use((_req, _res, next) => next(AppError.notImplemented(`${moduleName} is planned for a later phase`)));
  return router;
}

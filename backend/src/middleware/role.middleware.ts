import type { RequestHandler } from 'express';
import type { Role } from '../types/auth';
import type { Permission } from '../config/permissions';
import { AppError } from '../utils/AppError';

export const requireRole =
  (...roles: Role[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) return next(AppError.unauthorized());
    if (!roles.includes(req.user.role)) return next(AppError.forbidden());
    next();
  };

/** All listed permissions are required. Must run after `authenticate`. */
export const requirePermission =
  (...required: Permission[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) return next(AppError.unauthorized());
    const granted = new Set(req.user.permissions);
    if (!required.every((p) => granted.has(p))) return next(AppError.forbidden());
    next();
  };

import type { RequestHandler } from 'express';
import { AppError } from '../utils/AppError';
import { authService } from '../services/auth.service';

/** Verifies the bearer JWT, then reloads the user from MongoDB (status + role come from the DB). */
export const authenticate: RequestHandler = async (req, _res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) throw AppError.unauthorized();
    req.user = await authService.authenticateAccessToken(header.slice(7));
    next();
  } catch (err) {
    next(err);
  }
};

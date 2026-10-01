import type { RequestHandler } from 'express';
import type { CBTOperation } from '../models/CBTIntegration';
import { AppError } from '../utils/AppError';
import { cbtIntegrationService } from '../services/cbtIntegration.service';

/**
 * Authenticates CBT Exam Box via X-CBT-Client-Id / X-CBT-Client-Secret headers.
 * This is deliberately separate from user JWT auth.
 */
export const authenticateCbtClient: RequestHandler = async (req, _res, next) => {
  try {
    const clientId = req.get('x-cbt-client-id');
    const secret = req.get('x-cbt-client-secret');
    if (!clientId || !secret) throw AppError.unauthorized('Integration credentials required');
    req.cbtClient = await cbtIntegrationService.authenticateClient(clientId, secret);
    next();
  } catch (err) {
    next(err);
  }
};

export const requireCbtOperation =
  (operation: CBTOperation): RequestHandler =>
  (req, _res, next) => {
    try {
      if (!req.cbtClient) throw AppError.unauthorized();
      cbtIntegrationService.assertOperation(req.cbtClient.allowedOperations, operation);
      next();
    } catch (err) {
      next(err);
    }
  };

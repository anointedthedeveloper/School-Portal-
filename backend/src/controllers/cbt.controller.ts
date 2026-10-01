import type { Request, Response } from 'express';
import { auditService } from '../services/audit.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';

export const cbtController = {
  /** Confirms credentials and tells the client what it may do. */
  authenticate: asyncHandler(async (req: Request, res: Response) => {
    const client = req.cbtClient!;
    await auditService.record({
      action: 'CBT_AUTHENTICATED', entity: 'CBTIntegration', entityId: client.id as string, req,
      metadata: { clientId: client.clientId },
    });
    sendSuccess(res, {
      name: client.name,
      clientId: client.clientId,
      allowedOperations: client.allowedOperations,
      rateLimitPerMinute: client.rateLimitPerMinute,
    }, 'Integration authenticated');
  }),
};

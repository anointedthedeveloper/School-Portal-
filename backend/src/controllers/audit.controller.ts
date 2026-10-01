import type { Request, Response } from 'express';
import { auditService } from '../services/audit.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';

export const auditController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await auditService.list(req.query as never));
  }),
};

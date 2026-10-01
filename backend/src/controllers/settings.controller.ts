import type { Request, Response } from 'express';
import { schoolConfigService } from '../services/schoolConfig.service';
import { auditService } from '../services/audit.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';

export const settingsController = {
  getPublic: asyncHandler(async (_req: Request, res: Response) => {
    sendSuccess(res, await schoolConfigService.getPublic());
  }),

  get: asyncHandler(async (_req: Request, res: Response) => {
    sendSuccess(res, await schoolConfigService.getFull());
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const updated = await schoolConfigService.update(req.body, req.user!.id);
    await auditService.record({
      action: 'SETTINGS_UPDATED', entity: 'SchoolSettings', req,
      metadata: { fields: Object.keys(req.body) },
    });
    sendSuccess(res, updated, 'Settings updated');
  }),
};

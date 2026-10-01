import type { Request, Response } from 'express';
import { userService } from '../services/user.service';
import { auditService } from '../services/audit.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';

export const usersController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await userService.list(req.query as never));
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await userService.getById(req.params.id as string));
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.create(req.body, req.user!.id);
    await auditService.record({
      action: 'USER_CREATED', entity: 'User', entityId: user.id as string, req,
      metadata: { role: user.role },
    });
    sendSuccess(res, user, 'User created', 201);
  }),
};

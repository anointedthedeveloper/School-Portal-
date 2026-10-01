import type { Request, Response } from 'express';
import { dashboardService } from '../services/dashboard.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';

export const dashboardController = {
  admin: asyncHandler(async (_req: Request, res: Response) => sendSuccess(res, await dashboardService.admin())),
  teacher: asyncHandler(async (req: Request, res: Response) => sendSuccess(res, await dashboardService.teacher(req.user!.id))),
  student: asyncHandler(async (req: Request, res: Response) => sendSuccess(res, await dashboardService.student(req.user!.id))),
};

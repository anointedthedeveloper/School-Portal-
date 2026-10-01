import type { Response } from 'express';

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export function sendSuccess<T>(res: Response, data: T, message = 'Request successful', status = 200) {
  const body: ApiSuccess<T> = { success: true, message, data };
  return res.status(status).json(body);
}

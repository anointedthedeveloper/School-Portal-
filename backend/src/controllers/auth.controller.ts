import type { CookieOptions, Request, Response } from 'express';
import { env } from '../config/environment';
import { authService } from '../services/auth.service';
import { auditService } from '../services/audit.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';

const REFRESH_COOKIE = 'refresh_token';

const cookieOptions = (expires?: Date): CookieOptions => ({
  httpOnly: true,
  secure: env.isProduction || env.COOKIE_SAME_SITE === 'none',
  sameSite: env.COOKIE_SAME_SITE,
  path: '/api/auth',
  ...(expires ? { expires } : {}),
});

const sessionPayload = (s: { accessToken: string; user: unknown }) => ({ accessToken: s.accessToken, user: s.user });
const readRefreshCookie = (req: Request): string | undefined => req.cookies?.[REFRESH_COOKIE];

export const authController = {
  login: asyncHandler(async (req: Request, res: Response) => {
    const session = await authService.login(req.body, req);
    res.cookie(REFRESH_COOKIE, session.refreshToken, cookieOptions(session.refreshExpiresAt));
    sendSuccess(res, sessionPayload(session), 'Login successful');
  }),

  refresh: asyncHandler(async (req: Request, res: Response) => {
    try {
      const session = await authService.refresh(readRefreshCookie(req), req);
      res.cookie(REFRESH_COOKIE, session.refreshToken, cookieOptions(session.refreshExpiresAt));
      sendSuccess(res, sessionPayload(session), 'Session refreshed');
    } catch (err) {
      res.clearCookie(REFRESH_COOKIE, cookieOptions());
      throw err;
    }
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    await authService.logout(readRefreshCookie(req));
    res.clearCookie(REFRESH_COOKIE, cookieOptions());
    void auditService.record({ action: 'LOGOUT', entity: 'User', entityId: req.user?.id, req });
    sendSuccess(res, null, 'Logged out');
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, { user: req.user });
  }),
};

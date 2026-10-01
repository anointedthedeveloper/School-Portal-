import bcrypt from 'bcryptjs';
import type { Request } from 'express';
import { trusted } from 'mongoose';
import { User, type UserDocument } from '../models/User';
import { RefreshToken } from '../models/RefreshToken';
import { permissionsFor } from '../config/permissions';
import type { AuthUser } from '../types/auth';
import { AppError } from '../utils/AppError';
import { clientIp } from '../utils/requestMeta';
import { auditService } from './audit.service';
import { tokenService } from './token.service';
import type { LoginInput } from '../validators/auth.validator';

// Compared against when the email is unknown so response time does not reveal which emails exist.
const DUMMY_HASH = bcrypt.hashSync('timing-equaliser', 12);

export function toAuthUser(user: Pick<UserDocument, 'id' | 'email' | 'role' | 'firstName' | 'lastName' | 'extraPermissions'>): AuthUser {
  return {
    id: user.id as string,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    permissions: permissionsFor(user.role, user.extraPermissions),
  };
}

async function issueSession(user: UserDocument, req: Request) {
  const accessToken = tokenService.signAccess(user.id as string);
  const refresh = tokenService.signRefresh(user.id as string);
  await RefreshToken.create({
    user: user._id,
    tokenHash: tokenService.hash(refresh.token),
    expiresAt: refresh.expiresAt,
    userAgent: req.get('user-agent')?.slice(0, 200),
    ipAddress: clientIp(req),
  });
  return { accessToken, refreshToken: refresh.token, refreshExpiresAt: refresh.expiresAt, user: toAuthUser(user) };
}

export const authService = {
  async login(input: LoginInput, req: Request) {
    const user = await User.findOne({ email: input.email }).select('+passwordHash');
    const valid = await bcrypt.compare(input.password, user?.passwordHash ?? DUMMY_HASH);

    if (!user || !valid) {
      void auditService.record({
        action: 'LOGIN_FAILED', entity: 'User', req,
        metadata: { email: input.email },
      });
      throw AppError.unauthorized('Invalid email or password');
    }
    if (user.status !== 'ACTIVE') throw AppError.forbidden('This account is not active. Contact the school administrator.');

    user.lastLoginAt = new Date();
    await user.save();
    const session = await issueSession(user, req);
    await auditService.record({
      action: 'LOGIN', entity: 'User', entityId: user.id as string,
      userId: user.id as string, userEmail: user.email, req,
    });
    return session;
  },

  /** Rotates the refresh token. Presenting an already-revoked token revokes the whole family. */
  async refresh(rawToken: string | undefined, req: Request) {
    if (!rawToken) throw AppError.unauthorized('No refresh token');
    const claims = tokenService.verifyRefresh(rawToken);
    const stored = await RefreshToken.findOne({ tokenHash: tokenService.hash(rawToken) });
    if (!stored) throw AppError.unauthorized('Refresh token not recognised');

    if (stored.revokedAt) {
      await RefreshToken.updateMany({ user: stored.user, revokedAt: trusted({ $exists: false }) }, { revokedAt: new Date() });
      throw AppError.unauthorized('Refresh token has been revoked');
    }

    const user = await User.findById(claims.sub);
    if (!user || user.status !== 'ACTIVE') throw AppError.unauthorized('Account is no longer active');

    stored.revokedAt = new Date();
    await stored.save();
    return issueSession(user, req);
  },

  async logout(rawToken: string | undefined) {
    if (!rawToken) return;
    await RefreshToken.updateOne(
      { tokenHash: tokenService.hash(rawToken), revokedAt: trusted({ $exists: false }) },
      { revokedAt: new Date() },
    );
  },

  /** Loads the user fresh from the database; role/status are never read from the token. */
  async authenticateAccessToken(token: string): Promise<AuthUser> {
    const claims = tokenService.verifyAccess(token);
    const user = await User.findById(claims.sub);
    if (!user) throw AppError.unauthorized('Account not found');
    if (user.status !== 'ACTIVE') throw AppError.forbidden('This account is not active');
    return toAuthUser(user);
  },
};

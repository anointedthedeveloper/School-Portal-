import crypto from 'node:crypto';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/environment';
import { AppError } from '../utils/AppError';

interface AccessClaims { sub: string; typ: 'access' }
interface RefreshClaims { sub: string; jti: string; typ: 'refresh' }

export const tokenService = {
  signAccess(userId: string): string {
    return jwt.sign({ typ: 'access' }, env.JWT_SECRET, {
      subject: userId,
      expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
    });
  },

  signRefresh(userId: string): { token: string; expiresAt: Date } {
    const token = jwt.sign({ typ: 'refresh', jti: crypto.randomUUID() }, env.JWT_REFRESH_SECRET, {
      subject: userId,
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'],
    });
    const { exp } = jwt.decode(token) as { exp: number };
    return { token, expiresAt: new Date(exp * 1000) };
  },

  verifyAccess(token: string): AccessClaims {
    try {
      const claims = jwt.verify(token, env.JWT_SECRET) as AccessClaims;
      if (claims.typ !== 'access') throw new Error('wrong token type');
      return claims;
    } catch {
      throw AppError.unauthorized('Invalid or expired access token');
    }
  },

  verifyRefresh(token: string): RefreshClaims {
    try {
      const claims = jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshClaims;
      if (claims.typ !== 'refresh') throw new Error('wrong token type');
      return claims;
    } catch {
      throw AppError.unauthorized('Invalid or expired refresh token');
    }
  },

  hash(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  },
};

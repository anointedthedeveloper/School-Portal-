import { Schema, model, type Types } from 'mongoose';

export interface IRefreshToken {
  user: Types.ObjectId;
  /** SHA-256 of the refresh token; the raw token is never stored. */
  tokenHash: string;
  expiresAt: Date;
  revokedAt?: Date;
  userAgent?: string;
  ipAddress?: string;
  createdAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    revokedAt: Date,
    userAgent: String,
    ipAddress: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);
// Mongo removes expired tokens automatically.
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken = model<IRefreshToken>('RefreshToken', refreshTokenSchema);

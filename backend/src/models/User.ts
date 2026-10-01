import { Schema, model, type HydratedDocument, type Types } from 'mongoose';
import { ROLES, USER_STATUSES, type Role, type UserStatus } from '../types/auth';

export interface IUser {
  email: string;
  passwordHash: string;
  role: Role;
  status: UserStatus;
  firstName: string;
  lastName: string;
  phone?: string;
  /** Extra permissions granted on top of the role defaults. */
  extraPermissions: string[];
  mustChangePassword: boolean;
  lastLoginAt?: Date;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, required: true, index: true },
    status: { type: String, enum: USER_STATUSES, default: 'ACTIVE', index: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    extraPermissions: { type: [String], default: [] },
    mustChangePassword: { type: Boolean, default: false },
    lastLoginAt: Date,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

userSchema.index({ role: 1, status: 1 });

export type UserDocument = HydratedDocument<IUser>;
export const User = model<IUser>('User', userSchema);

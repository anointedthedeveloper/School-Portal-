import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { AppError } from '../utils/AppError';
import type { CreateUserInput } from '../validators/user.validator';
import type { Role } from '../types/auth';

const BCRYPT_ROUNDS = 12;

export const userService = {
  async list(params: { page: number; limit: number; role?: Role; search?: string }) {
    const filter: Record<string, unknown> = {};
    if (params.role) filter.role = params.role;
    if (params.search) {
      const rx = new RegExp(params.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ firstName: rx }, { lastName: rx }, { email: rx }];
    }
    const [items, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip((params.page - 1) * params.limit).limit(params.limit),
      User.countDocuments(filter),
    ]);
    return { items, total, page: params.page, limit: params.limit };
  },

  async getById(id: string) {
    const user = await User.findById(id);
    if (!user) throw AppError.notFound('User not found');
    return user;
  },

  async create(input: CreateUserInput, createdBy: string) {
    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
    const { password: _password, ...rest } = input;
    return User.create({ ...rest, passwordHash, createdBy });
  },
};

export { BCRYPT_ROUNDS };

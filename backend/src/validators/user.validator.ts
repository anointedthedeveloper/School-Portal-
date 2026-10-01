import { z } from 'zod';
import { ROLES } from '../types/auth';
import { objectId, paginationQuery } from './common.validator';

export const listUsersSchema = z.object({
  query: paginationQuery.extend({
    role: z.enum(ROLES).optional(),
    search: z.string().trim().max(100).optional(),
  }),
});

export const createUserSchema = z.object({
  body: z.object({
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(8, 'Password must be at least 8 characters').max(200),
    role: z.enum(ROLES),
    firstName: z.string().trim().min(1).max(60),
    lastName: z.string().trim().min(1).max(60),
    phone: z.string().trim().max(30).optional(),
  }),
});
export type CreateUserInput = z.infer<typeof createUserSchema>['body'];

export const userIdSchema = z.object({ params: z.object({ id: objectId }) });

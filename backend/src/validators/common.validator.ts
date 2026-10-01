import { z } from 'zod';
import { Types } from 'mongoose';

export const objectId = z.string().refine((v) => Types.ObjectId.isValid(v) && v.length === 24, 'Invalid id');

export const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

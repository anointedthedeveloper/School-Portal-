import { z } from 'zod';
import { paginationQuery } from './common.validator';

export const listAuditSchema = z.object({
  query: paginationQuery.extend({
    action: z.string().trim().max(50).optional(),
    entity: z.string().trim().max(50).optional(),
  }),
});

import type { Request } from 'express';
import { AuditLog, type IAuditLog } from '../models/AuditLog';
import { logger } from '../utils/logger';
import { clientIp } from '../utils/requestMeta';

export const AUDIT_ACTIONS = [
  'LOGIN', 'LOGIN_FAILED', 'LOGOUT',
  'USER_CREATED', 'USER_UPDATED',
  'EXAM_CREATED', 'EXAM_PUBLISHED',
  'CA_UPDATED', 'RESULT_PUBLISHED',
  'SETTINGS_UPDATED',
  'CBT_AUTHENTICATED', 'CBT_RESULT_RECEIVED',
] as const;
export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export interface AuditInput {
  action: AuditAction;
  entity: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  /** Pass the request to capture the acting user and IP automatically. */
  req?: Request;
  userId?: string;
  userEmail?: string;
  ipAddress?: string;
}

export const auditService = {
  /** Never throws: an audit failure must not break the business operation. */
  async record(input: AuditInput): Promise<void> {
    try {
      await AuditLog.create({
        user: input.userId ?? input.req?.user?.id,
        userEmail: input.userEmail ?? input.req?.user?.email,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        metadata: input.metadata,
        ipAddress: input.ipAddress ?? (input.req ? clientIp(input.req) : undefined),
      });
    } catch (err) {
      logger.error({ err, action: input.action }, 'Failed to write audit log');
    }
  },

  async list(params: { page: number; limit: number; action?: string; entity?: string }) {
    const filter: Record<string, unknown> = {};
    if (params.action) filter.action = params.action;
    if (params.entity) filter.entity = params.entity;
    const [items, total] = await Promise.all([
      AuditLog.find(filter)
        .sort({ createdAt: -1 })
        .skip((params.page - 1) * params.limit)
        .limit(params.limit)
        .lean<IAuditLog[]>(),
      AuditLog.countDocuments(filter),
    ]);
    return { items, total, page: params.page, limit: params.limit };
  },
};

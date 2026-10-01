import { Schema, model, type HydratedDocument } from 'mongoose';

export const CBT_OPERATIONS = [
  'exams.list',
  'exams.read',
  'exams.start',
  'exams.submit',
  'results.read',
] as const;
export type CBTOperation = (typeof CBT_OPERATIONS)[number];

export const INTEGRATION_STATUSES = ['ACTIVE', 'DISABLED', 'REVOKED'] as const;

export interface ICBTIntegration {
  name: string;
  clientId: string;
  /** bcrypt hash of the client secret. The secret itself is shown once at creation. */
  secretHash: string;
  status: (typeof INTEGRATION_STATUSES)[number];
  allowedOperations: CBTOperation[];
  /** Requests per minute allowed for this client. */
  rateLimitPerMinute: number;
  lastUsedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const cbtIntegrationSchema = new Schema<ICBTIntegration>(
  {
    name: { type: String, required: true },
    clientId: { type: String, required: true, unique: true, index: true },
    secretHash: { type: String, required: true, select: false },
    status: { type: String, enum: INTEGRATION_STATUSES, default: 'ACTIVE' },
    allowedOperations: { type: [String], enum: CBT_OPERATIONS, default: [] },
    rateLimitPerMinute: { type: Number, default: 120 },
    lastUsedAt: Date,
  },
  { timestamps: true },
);

export type CBTIntegrationDocument = HydratedDocument<ICBTIntegration>;
export const CBTIntegration = model<ICBTIntegration>('CBTIntegration', cbtIntegrationSchema);

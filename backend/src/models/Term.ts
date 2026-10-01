import { Schema, model, type InferSchemaType } from 'mongoose';

export const TERM_NAMES = ['FIRST', 'SECOND', 'THIRD'] as const;

const termSchema = new Schema(
  {
    session: { type: Schema.Types.ObjectId, ref: 'AcademicSession', required: true },
    name: { type: String, enum: TERM_NAMES, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isCurrent: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);
termSchema.index({ session: 1, name: 1 }, { unique: true });

export type ITerm = InferSchemaType<typeof termSchema>;
export const Term = model('Term', termSchema);

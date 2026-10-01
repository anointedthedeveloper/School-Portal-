import { Schema, model, type InferSchemaType } from 'mongoose';

const caScoreSchema = new Schema(
  {
    assessment: { type: Schema.Types.ObjectId, ref: 'Assessment', required: true },
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    score: { type: Number, required: true, min: 0 },
    enteredBy: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['DRAFT', 'SUBMITTED', 'APPROVED'], default: 'DRAFT' },
  },
  { timestamps: true },
);
caScoreSchema.index({ assessment: 1, student: 1 }, { unique: true });

export type ICAScore = InferSchemaType<typeof caScoreSchema>;
export const CAScore = model('CAScore', caScoreSchema);

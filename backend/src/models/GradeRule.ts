import { Schema, model, type InferSchemaType } from 'mongoose';

/** Per-class-level override of the default grading scale held in SchoolSettings. */
const gradeRuleSchema = new Schema(
  {
    level: { type: String, trim: true, default: '*', index: true }, // "*" = all levels
    grade: { type: String, required: true },
    minScore: { type: Number, required: true },
    maxScore: { type: Number, required: true },
    remark: { type: String, default: '' },
    points: Number,
  },
  { timestamps: true },
);
gradeRuleSchema.index({ level: 1, grade: 1 }, { unique: true });

export type IGradeRule = InferSchemaType<typeof gradeRuleSchema>;
export const GradeRule = model('GradeRule', gradeRuleSchema);

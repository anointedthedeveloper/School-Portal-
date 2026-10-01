import { Schema, model, type InferSchemaType } from 'mongoose';

const examResultSchema = new Schema(
  {
    exam: { type: Schema.Types.ObjectId, ref: 'Exam', required: true },
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    attempt: { type: Schema.Types.ObjectId, ref: 'ExamAttempt' },
    score: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    percentage: { type: Number, required: true },
    published: { type: Boolean, default: false, index: true },
    publishedAt: Date,
  },
  { timestamps: true },
);
examResultSchema.index({ exam: 1, student: 1 }, { unique: true });

export type IExamResult = InferSchemaType<typeof examResultSchema>;
export const ExamResult = model('ExamResult', examResultSchema);

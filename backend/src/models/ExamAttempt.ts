import { Schema, model, type InferSchemaType } from 'mongoose';

const answerSchema = new Schema(
  {
    question: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
    response: { type: [String], default: [] },
    awardedMarks: Number,
  },
  { _id: false },
);

const examAttemptSchema = new Schema(
  {
    exam: { type: Schema.Types.ObjectId, ref: 'Exam', required: true },
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    status: { type: String, enum: ['IN_PROGRESS', 'SUBMITTED', 'GRADED', 'EXPIRED'], default: 'IN_PROGRESS' },
    source: { type: String, enum: ['PORTAL', 'CBT_EXAM_BOX'], default: 'PORTAL' },
    /** Attempt id on the external CBT system, for idempotent result sync. */
    externalAttemptId: { type: String, index: true, sparse: true },
    startedAt: { type: Date, default: Date.now },
    submittedAt: Date,
    answers: { type: [answerSchema], default: [] },
    score: Number,
  },
  { timestamps: true },
);
examAttemptSchema.index({ exam: 1, student: 1 });

export type IExamAttempt = InferSchemaType<typeof examAttemptSchema>;
export const ExamAttempt = model('ExamAttempt', examAttemptSchema);

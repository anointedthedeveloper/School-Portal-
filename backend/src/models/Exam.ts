import { Schema, model, type InferSchemaType } from 'mongoose';

export const EXAM_STATUSES = ['DRAFT', 'PUBLISHED', 'ACTIVE', 'CLOSED', 'ARCHIVED'] as const;
export const EXAM_DELIVERY = ['PORTAL', 'CBT_EXAM_BOX'] as const;

const examSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    class: { type: Schema.Types.ObjectId, ref: 'Class', required: true, index: true },
    subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
    teacher: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true, index: true },
    session: { type: Schema.Types.ObjectId, ref: 'AcademicSession', index: true },
    term: { type: Schema.Types.ObjectId, ref: 'Term', index: true },
    questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
    durationMinutes: { type: Number, min: 1 },
    totalMarks: { type: Number, default: 0 },
    passMark: { type: Number, default: 0 },
    startsAt: Date,
    endsAt: Date,
    delivery: { type: String, enum: EXAM_DELIVERY, default: 'PORTAL' },
    status: { type: String, enum: EXAM_STATUSES, default: 'DRAFT', index: true },
    publishedAt: Date,
  },
  { timestamps: true },
);
examSchema.index({ class: 1, subject: 1, status: 1 });

export type IExam = InferSchemaType<typeof examSchema>;
export const Exam = model('Exam', examSchema);

import { Schema, model, type InferSchemaType } from 'mongoose';

export const QUESTION_TYPES = ['MCQ', 'TRUE_FALSE', 'SHORT_ANSWER', 'ESSAY'] as const;

const optionSchema = new Schema(
  { key: { type: String, required: true }, text: { type: String, required: true } },
  { _id: false },
);

const questionSchema = new Schema(
  {
    bank: { type: Schema.Types.ObjectId, ref: 'QuestionBank', index: true },
    subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
    type: { type: String, enum: QUESTION_TYPES, default: 'MCQ' },
    text: { type: String, required: true },
    options: { type: [optionSchema], default: [] },
    /** Never serialise to students; CBT/student endpoints must strip this. */
    correctAnswer: { type: [String], default: [], select: false },
    marks: { type: Number, default: 1, min: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
  },
  { timestamps: true },
);

export type IQuestion = InferSchemaType<typeof questionSchema>;
export const Question = model('Question', questionSchema);

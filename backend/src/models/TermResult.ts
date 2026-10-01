import { Schema, model, type InferSchemaType } from 'mongoose';

const subjectResultSchema = new Schema(
  {
    subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    caScore: { type: Number, default: 0 },
    examScore: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    grade: String,
    remark: String,
  },
  { _id: false },
);

const termResultSchema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    class: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    session: { type: Schema.Types.ObjectId, ref: 'AcademicSession', required: true },
    term: { type: Schema.Types.ObjectId, ref: 'Term', required: true },
    subjects: { type: [subjectResultSchema], default: [] },
    totalScore: Number,
    average: Number,
    position: Number,
    teacherComment: String,
    principalComment: String,
    status: { type: String, enum: ['DRAFT', 'PUBLISHED'], default: 'DRAFT', index: true },
    publishedAt: Date,
  },
  { timestamps: true },
);
termResultSchema.index({ student: 1, session: 1, term: 1 }, { unique: true });
termResultSchema.index({ class: 1, session: 1, term: 1 });

export type ITermResult = InferSchemaType<typeof termResultSchema>;
export const TermResult = model('TermResult', termResultSchema);

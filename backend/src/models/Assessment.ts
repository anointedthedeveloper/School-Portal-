import { Schema, model, type InferSchemaType } from 'mongoose';

const assessmentSchema = new Schema(
  {
    name: { type: String, required: true, trim: true }, // e.g. "First Test"
    type: { type: String, enum: ['TEST', 'ASSIGNMENT', 'PROJECT', 'PRACTICAL', 'OTHER'], default: 'TEST' },
    class: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    session: { type: Schema.Types.ObjectId, ref: 'AcademicSession', required: true },
    term: { type: Schema.Types.ObjectId, ref: 'Term', required: true },
    maxScore: { type: Number, required: true, min: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'Teacher' },
  },
  { timestamps: true },
);
assessmentSchema.index({ class: 1, subject: 1, session: 1, term: 1 });

export type IAssessment = InferSchemaType<typeof assessmentSchema>;
export const Assessment = model('Assessment', assessmentSchema);

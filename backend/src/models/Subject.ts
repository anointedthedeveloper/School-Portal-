import { Schema, model, type InferSchemaType } from 'mongoose';

const subjectSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    category: { type: String, trim: true, default: '' },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

export type ISubject = InferSchemaType<typeof subjectSchema>;
export const Subject = model('Subject', subjectSchema);

import { Schema, model, type InferSchemaType } from 'mongoose';

const academicSessionSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true }, // e.g. "2025/2026"
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isCurrent: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

export type IAcademicSession = InferSchemaType<typeof academicSessionSchema>;
export const AcademicSession = model('AcademicSession', academicSessionSchema);

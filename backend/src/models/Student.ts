import { Schema, model, type InferSchemaType } from 'mongoose';

const studentSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    admissionNumber: { type: String, required: true, unique: true, trim: true },
    class: { type: Schema.Types.ObjectId, ref: 'Class', index: true },
    gender: { type: String, enum: ['MALE', 'FEMALE'] },
    dateOfBirth: Date,
    guardianName: String,
    guardianPhone: String,
    address: String,
    status: { type: String, enum: ['ACTIVE', 'GRADUATED', 'WITHDRAWN'], default: 'ACTIVE', index: true },
  },
  { timestamps: true },
);

export type IStudent = InferSchemaType<typeof studentSchema>;
export const Student = model('Student', studentSchema);

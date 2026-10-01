import { Schema, model, type InferSchemaType } from 'mongoose';

const teacherSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    staffId: { type: String, required: true, unique: true, trim: true },
    qualification: String,
    status: { type: String, enum: ['ACTIVE', 'ON_LEAVE', 'LEFT'], default: 'ACTIVE', index: true },
  },
  { timestamps: true },
);

export type ITeacher = InferSchemaType<typeof teacherSchema>;
export const Teacher = model('Teacher', teacherSchema);

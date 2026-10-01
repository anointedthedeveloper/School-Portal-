import { Schema, model, type InferSchemaType } from 'mongoose';

const classSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true }, // e.g. "JSS 1 A"
    level: { type: String, required: true, trim: true }, // e.g. "JSS 1"
    arm: { type: String, trim: true, default: '' }, // e.g. "A"
    classTeacher: { type: Schema.Types.ObjectId, ref: 'Teacher' },
    capacity: { type: Number, min: 1 },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);
classSchema.index({ level: 1, arm: 1 });

export type IClass = InferSchemaType<typeof classSchema>;
export const SchoolClass = model('Class', classSchema);

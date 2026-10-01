import { Schema, model, type InferSchemaType } from 'mongoose';

const teacherAssignmentSchema = new Schema(
  {
    teacher: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true, index: true },
    class: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    session: { type: Schema.Types.ObjectId, ref: 'AcademicSession' },
  },
  { timestamps: true },
);
teacherAssignmentSchema.index({ teacher: 1, class: 1, subject: 1, session: 1 }, { unique: true });
teacherAssignmentSchema.index({ class: 1, subject: 1 });

export type ITeacherAssignment = InferSchemaType<typeof teacherAssignmentSchema>;
export const TeacherAssignment = model('TeacherAssignment', teacherAssignmentSchema);

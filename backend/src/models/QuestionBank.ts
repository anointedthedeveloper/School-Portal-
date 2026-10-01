import { Schema, model, type InferSchemaType } from 'mongoose';

const questionBankSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
    class: { type: Schema.Types.ObjectId, ref: 'Class' },
    owner: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true, index: true },
    description: String,
  },
  { timestamps: true },
);

export type IQuestionBank = InferSchemaType<typeof questionBankSchema>;
export const QuestionBank = model('QuestionBank', questionBankSchema);

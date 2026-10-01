import { Schema, model, type HydratedDocument } from 'mongoose';

export interface IGradeBand {
  grade: string;
  minScore: number;
  maxScore: number;
  remark: string;
}

export interface ISchoolSettings {
  /** Singleton key: one settings document per deployment. */
  key: 'default';
  schoolName: string;
  shortName: string;
  logo: string;
  favicon: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  primaryColor: string;
  secondaryColor: string;
  currentSession: string;
  currentTerm: string;
  gradingSystem: { passMark: number; scale: IGradeBand[] };
  reportSettings: {
    showPosition: boolean;
    showClassAverage: boolean;
    principalComment: boolean;
    teacherComment: boolean;
    headerNote: string;
  };
  examSettings: {
    caMaxScore: number;
    examMaxScore: number;
    defaultDurationMinutes: number;
    shuffleQuestions: boolean;
  };
  cbtSettings: { enabled: boolean; allowResultSync: boolean };
  updatedBy?: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const gradeBandSchema = new Schema<IGradeBand>(
  {
    grade: { type: String, required: true },
    minScore: { type: Number, required: true },
    maxScore: { type: Number, required: true },
    remark: { type: String, default: '' },
  },
  { _id: false },
);

const schoolSettingsSchema = new Schema<ISchoolSettings>(
  {
    key: { type: String, enum: ['default'], default: 'default', unique: true },
    schoolName: { type: String, required: true, trim: true },
    shortName: { type: String, required: true, trim: true },
    logo: { type: String, default: '' },
    favicon: { type: String, default: '' },
    address: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    website: { type: String, default: '' },
    primaryColor: { type: String, default: '#1e40af' },
    secondaryColor: { type: String, default: '#0f766e' },
    currentSession: { type: String, default: '' },
    currentTerm: { type: String, default: '' },
    gradingSystem: {
      passMark: { type: Number, default: 50 },
      scale: { type: [gradeBandSchema], default: [] },
    },
    reportSettings: {
      showPosition: { type: Boolean, default: true },
      showClassAverage: { type: Boolean, default: true },
      principalComment: { type: Boolean, default: true },
      teacherComment: { type: Boolean, default: true },
      headerNote: { type: String, default: '' },
    },
    examSettings: {
      caMaxScore: { type: Number, default: 40 },
      examMaxScore: { type: Number, default: 60 },
      defaultDurationMinutes: { type: Number, default: 60 },
      shuffleQuestions: { type: Boolean, default: true },
    },
    cbtSettings: {
      enabled: { type: Boolean, default: false },
      allowResultSync: { type: Boolean, default: true },
    },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

export type SchoolSettingsDocument = HydratedDocument<ISchoolSettings>;
export const SchoolSettings = model<ISchoolSettings>('SchoolSettings', schoolSettingsSchema);

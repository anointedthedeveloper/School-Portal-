export interface PublicSchoolSettings {
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
}

export interface GradeBand {
  grade: string;
  minScore: number;
  maxScore: number;
  remark: string;
}

export interface SchoolSettings extends PublicSchoolSettings {
  gradingSystem: { passMark: number; scale: GradeBand[] };
  reportSettings: {
    showPosition: boolean;
    showClassAverage: boolean;
    principalComment: boolean;
    teacherComment: boolean;
    headerNote: string;
  };
  examSettings: { caMaxScore: number; examMaxScore: number; defaultDurationMinutes: number; shuffleQuestions: boolean };
  cbtSettings: { enabled: boolean; allowResultSync: boolean };
}

/**
 * Default white-label identity used to create the SchoolSettings document the first
 * time the app runs. After that the database document is the source of truth and
 * administrators edit it through the settings API. Nothing here is school-specific.
 */
export const defaultSchoolSettings = {
  schoolName: '[School Name]',
  shortName: '[School]',
  logo: '',
  favicon: '',
  address: '',
  phone: '',
  email: '',
  website: '',
  primaryColor: '#1e40af',
  secondaryColor: '#0f766e',
  currentSession: '',
  currentTerm: '',
  gradingSystem: {
    passMark: 50,
    scale: [
      { grade: 'A', minScore: 70, maxScore: 100, remark: 'Excellent' },
      { grade: 'B', minScore: 60, maxScore: 69, remark: 'Very Good' },
      { grade: 'C', minScore: 50, maxScore: 59, remark: 'Good' },
      { grade: 'D', minScore: 45, maxScore: 49, remark: 'Fair' },
      { grade: 'E', minScore: 40, maxScore: 44, remark: 'Pass' },
      { grade: 'F', minScore: 0, maxScore: 39, remark: 'Fail' },
    ],
  },
  reportSettings: {
    showPosition: true,
    showClassAverage: true,
    principalComment: true,
    teacherComment: true,
    headerNote: '',
  },
  examSettings: {
    caMaxScore: 40,
    examMaxScore: 60,
    defaultDurationMinutes: 60,
    shuffleQuestions: true,
  },
  cbtSettings: {
    enabled: false,
    allowResultSync: true,
  },
} as const;

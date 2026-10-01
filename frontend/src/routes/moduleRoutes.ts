export interface ModuleRoute {
  path: string;
  title: string;
  description: string;
  phase: string;
}

export const adminModules: ModuleRoute[] = [
  { path: 'students', title: 'Students', description: 'Student records and class enrolment.', phase: 'Phase 2' },
  { path: 'teachers', title: 'Teachers', description: 'Teacher records and accounts.', phase: 'Phase 2' },
  { path: 'classes', title: 'Classes', description: 'Class levels and arms.', phase: 'Phase 2' },
  { path: 'subjects', title: 'Subjects', description: 'Subject catalogue.', phase: 'Phase 2' },
  { path: 'assignments', title: 'Teacher Assignments', description: 'Assign teachers to classes and subjects.', phase: 'Phase 2' },
  { path: 'exams', title: 'Exams', description: 'Exam scheduling, publishing and monitoring.', phase: 'Phase 3' },
  { path: 'questions', title: 'Questions', description: 'Question banks and questions.', phase: 'Phase 3' },
  { path: 'ca', title: 'Continuous Assessment', description: 'Assessment definitions and CA scores.', phase: 'Phase 4' },
  { path: 'results', title: 'Results', description: 'Result computation, grading and publishing.', phase: 'Phase 5' },
  { path: 'reports', title: 'Reports', description: 'Termly report cards and PDF generation.', phase: 'Phase 5' },
  { path: 'sessions', title: 'Sessions & Terms', description: 'Academic sessions and terms.', phase: 'Phase 2' },
  { path: 'audit', title: 'Audit Log', description: 'Review of security and data-change activity.', phase: 'Phase 7' },
];

export const teacherModules: ModuleRoute[] = [
  { path: 'exams', title: 'My Exams', description: 'Create and manage your exams.', phase: 'Phase 3' },
  { path: 'questions', title: 'Question Bank', description: 'Your questions and question banks.', phase: 'Phase 3' },
  { path: 'ca', title: 'CA Scores', description: 'Record continuous assessment scores.', phase: 'Phase 4' },
  { path: 'results', title: 'Results', description: 'Results for your classes and subjects.', phase: 'Phase 5' },
];

export const studentModules: ModuleRoute[] = [
  { path: 'exams', title: 'Exams', description: 'Exams available to you.', phase: 'Phase 3' },
  { path: 'results', title: 'Results', description: 'Your published results.', phase: 'Phase 5' },
  { path: 'reports', title: 'Reports', description: 'Your termly report cards.', phase: 'Phase 5' },
  { path: 'profile', title: 'Profile', description: 'Your personal and class information.', phase: 'Phase 2' },
];

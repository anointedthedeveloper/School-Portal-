import type { Role } from '../types/auth';

/**
 * Permission catalogue. Format: `<resource>.<action>`.
 * Roles map to a default permission set; individual users may later receive extra grants
 * through `User.extraPermissions` without changing route code.
 */
export const PERMISSIONS = [
  'users.read', 'users.create', 'users.update',
  'students.read', 'students.create', 'students.update', 'students.delete',
  'teachers.read', 'teachers.create', 'teachers.update', 'teachers.delete',
  'classes.read', 'classes.manage',
  'subjects.read', 'subjects.manage',
  'assignments.read', 'assignments.manage',
  'sessions.read', 'sessions.manage',
  'exams.read', 'exams.create', 'exams.update', 'exams.publish',
  'questions.read', 'questions.create', 'questions.update',
  'assessments.read', 'assessments.manage',
  'ca.read', 'ca.enter', 'ca.approve',
  'results.read', 'results.publish',
  'reports.read', 'reports.generate',
  'settings.read', 'settings.update',
  'audit.read',
  'dashboard.admin', 'dashboard.teacher', 'dashboard.student',
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const teacherPermissions: Permission[] = [
  'students.read', 'classes.read', 'subjects.read', 'assignments.read', 'sessions.read',
  'exams.read', 'exams.create', 'exams.update',
  'questions.read', 'questions.create', 'questions.update',
  'assessments.read', 'ca.read', 'ca.enter',
  'results.read', 'settings.read', 'dashboard.teacher',
];

const studentPermissions: Permission[] = [
  'exams.read', 'results.read', 'reports.read', 'settings.read', 'dashboard.student',
];

export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  ADMIN: PERMISSIONS,
  TEACHER: teacherPermissions,
  STUDENT: studentPermissions,
};

export function permissionsFor(role: Role, extra: readonly string[] = []): string[] {
  return Array.from(new Set<string>([...ROLE_PERMISSIONS[role], ...extra]));
}

import type { ApiSuccess } from '@/types/api';
import type { AdminDashboard, StudentDashboard, TeacherDashboard } from '@/types/dashboard';
import { api, unwrap } from './apiClient';

export const dashboardService = {
  admin: async () => unwrap(await api.get<ApiSuccess<AdminDashboard>>('/dashboard/admin')),
  teacher: async () => unwrap(await api.get<ApiSuccess<TeacherDashboard>>('/dashboard/teacher')),
  student: async () => unwrap(await api.get<ApiSuccess<StudentDashboard>>('/dashboard/student')),
};

import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard.service';

export const useAdminDashboard = () => useQuery({ queryKey: ['dashboard', 'admin'], queryFn: dashboardService.admin });
export const useTeacherDashboard = () => useQuery({ queryKey: ['dashboard', 'teacher'], queryFn: dashboardService.teacher });
export const useStudentDashboard = () => useQuery({ queryKey: ['dashboard', 'student'], queryFn: dashboardService.student });

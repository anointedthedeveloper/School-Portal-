import { BarChart3, FileText, HelpCircle, LayoutDashboard, PenLine } from 'lucide-react';
import { SidebarLayout } from '@/components/layout/SidebarLayout';
import type { NavItem } from '@/components/layout/navigation';

// Teacher navigation is its own list, not the admin list with items hidden.
export const teacherNav: NavItem[] = [
  { to: '/teacher/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/teacher/exams', label: 'My Exams', icon: FileText },
  { to: '/teacher/questions', label: 'Question Bank', icon: HelpCircle },
  { to: '/teacher/ca', label: 'CA Scores', icon: PenLine },
  { to: '/teacher/results', label: 'Results', icon: BarChart3 },
];

export function TeacherLayout() {
  return <SidebarLayout nav={teacherNav} areaLabel="Teaching" />;
}

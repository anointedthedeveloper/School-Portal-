import {
  Award, BookOpen, CalendarDays, ClipboardList, FileText, GraduationCap, HelpCircle, LayoutDashboard,
  PenLine, ScrollText, School, Settings, Users, BarChart3,
} from 'lucide-react';
import { SidebarLayout } from '@/components/layout/SidebarLayout';
import type { NavItem } from '@/components/layout/navigation';

export const adminNav: NavItem[] = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/students', label: 'Students', icon: GraduationCap },
  { to: '/admin/teachers', label: 'Teachers', icon: Users },
  { to: '/admin/classes', label: 'Classes', icon: School },
  { to: '/admin/subjects', label: 'Subjects', icon: BookOpen },
  { to: '/admin/assignments', label: 'Assignments', icon: ClipboardList },
  { to: '/admin/exams', label: 'Exams', icon: FileText },
  { to: '/admin/questions', label: 'Questions', icon: HelpCircle },
  { to: '/admin/ca', label: 'Continuous Assessment', icon: PenLine },
  { to: '/admin/results', label: 'Results', icon: BarChart3 },
  { to: '/admin/reports', label: 'Reports', icon: Award },
  { to: '/admin/sessions', label: 'Sessions & Terms', icon: CalendarDays },
  { to: '/admin/settings', label: 'School Settings', icon: Settings },
  { to: '/admin/audit', label: 'Audit Log', icon: ScrollText },
];

export function AdminLayout() {
  return <SidebarLayout nav={adminNav} areaLabel="Administration" />;
}

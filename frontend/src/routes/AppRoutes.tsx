import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ModulePlaceholder } from '@/components/common/ModulePlaceholder';
import { AdminLayout } from '@/layouts/AdminLayout';
import { TeacherLayout } from '@/layouts/TeacherLayout';
import { StudentLayout } from '@/layouts/StudentLayout';
import LoginPage from '@/pages/auth/LoginPage';
import AdminDashboardPage from '@/pages/admin/DashboardPage';
import SettingsPage from '@/pages/admin/SettingsPage';
import TeacherDashboardPage from '@/pages/teacher/DashboardPage';
import StudentDashboardPage from '@/pages/student/DashboardPage';
import NotFoundPage from '@/pages/NotFoundPage';
import { ProtectedRoute, RoleProtectedRoute } from './ProtectedRoute';
import { adminModules, studentModules, teacherModules, type ModuleRoute } from './moduleRoutes';
import { roleHome } from '@/utils/roles';

function RootRedirect() {
  const { user, status } = useAuth();
  if (status === 'loading') return null;
  return <Navigate to={user ? roleHome[user.role] : '/login'} replace />;
}

const placeholders = (modules: ModuleRoute[]) =>
  modules.map((m) => (
    <Route key={m.path} path={m.path} element={<ModulePlaceholder title={m.title} description={m.description} phase={m.phase} />} />
  ));

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<RoleProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="settings" element={<SettingsPage />} />
            {placeholders(adminModules)}
          </Route>
        </Route>

        <Route element={<RoleProtectedRoute allowedRoles={['TEACHER']} />}>
          <Route path="/teacher" element={<TeacherLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<TeacherDashboardPage />} />
            {placeholders(teacherModules)}
          </Route>
        </Route>

        <Route element={<RoleProtectedRoute allowedRoles={['STUDENT']} />}>
          <Route path="/student" element={<StudentLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboardPage />} />
            {placeholders(studentModules)}
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

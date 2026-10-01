import { BookOpen, FileText, GraduationCap, School, Users } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { Card } from '@/components/common/Card';
import { ErrorState } from '@/components/common/ErrorState';
import { Skeleton } from '@/components/common/Skeleton';
import { BarChart } from '@/components/charts/BarChart';
import { useAdminDashboard } from '@/hooks/useDashboard';
import { useSchoolSettings } from '@/contexts/SchoolSettingsContext';
import { getErrorMessage } from '@/services/apiClient';

export default function AdminDashboardPage() {
  const { schoolName } = useSchoolSettings();
  const { data, isPending, isError, error, refetch } = useAdminDashboard();

  if (isError) return <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />;

  const t = data?.totals;
  return (
    <>
      <PageHeader title="Dashboard" description={`Overview of ${schoolName}`} />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard label="Students" value={t?.students} icon={GraduationCap} loading={isPending} />
        <StatCard label="Teachers" value={t?.teachers} icon={Users} loading={isPending} />
        <StatCard label="Classes" value={t?.classes} icon={School} loading={isPending} />
        <StatCard label="Subjects" value={t?.subjects} icon={BookOpen} loading={isPending} />
        <StatCard label="Active exams" value={t?.activeExams} icon={FileText} loading={isPending} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card title="Academic calendar" description="Set under School Settings">
          {isPending ? (
            <Skeleton className="h-12 w-full" />
          ) : (
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div><dt className="text-slate-500">Session</dt><dd className="mt-0.5 font-medium text-slate-900">{data?.currentSession || 'Not set'}</dd></div>
              <div><dt className="text-slate-500">Term</dt><dd className="mt-0.5 font-medium text-slate-900">{data?.currentTerm || 'Not set'}</dd></div>
            </dl>
          )}
        </Card>
        <Card title="Records overview">
          {isPending || !t ? (
            <Skeleton className="h-24 w-full" />
          ) : (
            <BarChart
              data={[
                { label: 'Students', value: t.students },
                { label: 'Teachers', value: t.teachers },
                { label: 'Classes', value: t.classes },
                { label: 'Subjects', value: t.subjects },
              ]}
            />
          )}
        </Card>
      </div>
    </>
  );
}

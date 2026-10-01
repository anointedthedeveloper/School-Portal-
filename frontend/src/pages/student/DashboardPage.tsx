import { CalendarDays, FileText, School } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { Card } from '@/components/common/Card';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { Skeleton } from '@/components/common/Skeleton';
import { DataTable } from '@/components/tables/DataTable';
import { useStudentDashboard } from '@/hooks/useDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { getErrorMessage } from '@/services/apiClient';

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const { data, isPending, isError, error, refetch } = useStudentDashboard();
  if (isError) return <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />;

  const calendar = [data?.currentSession, data?.currentTerm].filter(Boolean).join(' · ');
  return (
    <>
      <PageHeader title={`Welcome, ${user?.firstName ?? ''}`} description="Your class, available exams and recent results." />
      {data && !data.profileLinked && (
        <div role="status" className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Your account has no student profile yet. Please contact the school office.
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Current class" value={data?.currentClass?.name ?? 'Not assigned'} icon={School} loading={isPending} />
        <StatCard label="Session / term" value={calendar || 'Not set'} icon={CalendarDays} loading={isPending} />
        <StatCard label="Available exams" value={data?.availableExams} icon={FileText} loading={isPending} />
      </div>
      <Card title="Recent results" className="mt-6" padded={false}>
        {isPending ? <div className="p-5"><Skeleton className="h-16 w-full" /></div> : (
          <DataTable
            rows={data?.recentResults ?? []}
            rowKey={(r) => r.id}
            empty={<EmptyState title="No results yet" message="Published results will appear here." />}
            columns={[
              { key: 'exam', header: 'Exam', render: (r) => r.exam },
              { key: 'score', header: 'Score', render: (r) => `${r.score}/${r.totalMarks}` },
              { key: 'pct', header: 'Percentage', render: (r) => `${r.percentage}%` },
            ]}
          />
        )}
      </Card>
    </>
  );
}

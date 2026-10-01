import { BookOpen, FileText, School } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { Card } from '@/components/common/Card';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { Skeleton } from '@/components/common/Skeleton';
import { Badge } from '@/components/common/Badge';
import { DataTable } from '@/components/tables/DataTable';
import { useTeacherDashboard } from '@/hooks/useDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { getErrorMessage } from '@/services/apiClient';
import { formatDateTime, humanizeAction } from '@/utils/format';

export default function TeacherDashboardPage() {
  const { user } = useAuth();
  const { data, isPending, isError, error, refetch } = useTeacherDashboard();
  if (isError) return <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />;

  return (
    <>
      <PageHeader title={`Welcome, ${user?.firstName ?? ''}`} description="Your classes, subjects and recent activity." />
      {data && !data.profileLinked && (
        <div role="status" className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Your account has no teacher profile yet. Ask the administrator to complete it.
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Assigned classes" value={data?.assignedClasses.length} icon={School} loading={isPending} />
        <StatCard label="Assigned subjects" value={data?.assignedSubjects.length} icon={BookOpen} loading={isPending} />
        <StatCard label="Exams" value={data?.examCount} icon={FileText} loading={isPending} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card title="Classes and subjects">
          {isPending ? <Skeleton className="h-16 w-full" /> : data && (data.assignedClasses.length || data.assignedSubjects.length) ? (
            <div className="space-y-4 text-sm">
              <div><p className="mb-1.5 text-slate-500">Classes</p><div className="flex flex-wrap gap-1.5">{data.assignedClasses.map((c) => <Badge key={c.id} tone="brand">{c.name}</Badge>)}</div></div>
              <div><p className="mb-1.5 text-slate-500">Subjects</p><div className="flex flex-wrap gap-1.5">{data.assignedSubjects.map((s) => <Badge key={s.id}>{s.name}</Badge>)}</div></div>
            </div>
          ) : <EmptyState title="No assignments yet" message="Classes and subjects will appear once the administrator assigns them to you." />}
        </Card>
        <Card title="Recent activity" padded={false}>
          {isPending ? <div className="p-5"><Skeleton className="h-16 w-full" /></div> : (
            <DataTable
              rows={data?.recentActivity ?? []}
              rowKey={(r) => `${r.action}-${r.at}`}
              empty={<EmptyState title="No recent activity" />}
              columns={[
                { key: 'action', header: 'Action', render: (r) => humanizeAction(r.action) },
                { key: 'at', header: 'When', render: (r) => formatDateTime(r.at) },
              ]}
            />
          )}
        </Card>
      </div>
    </>
  );
}

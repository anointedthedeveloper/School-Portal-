import { Construction } from 'lucide-react';
import { PageHeader } from './PageHeader';
import { Card } from './Card';
import { EmptyState } from './EmptyState';
import { Badge } from './Badge';

interface Props {
  title: string;
  description: string;
  phase: string;
}

/** Honest "not built yet" state. Deliberately shows no data. */
export function ModulePlaceholder({ title, description, phase }: Props) {
  return (
    <>
      <PageHeader title={title} description={description} actions={<Badge tone="warning">{phase}</Badge>} />
      <Card>
        <EmptyState
          icon={Construction}
          title="Module coming in a later phase"
          message={`${title} is part of ${phase}. The backend route is reserved and already protected, but the feature is not implemented yet.`}
        />
      </Card>
    </>
  );
}

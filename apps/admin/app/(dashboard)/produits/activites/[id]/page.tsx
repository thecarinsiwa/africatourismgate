import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ActivityEditPage } from '../../../../../components/activities/activity-edit-page';

type PageProps = {
  params: { id: string };
};

export const metadata: Metadata = {
  title: 'Modifier l’activité — Africa Tourism Gate Admin',
};

function ActivityEditFallback() {
  return <p className="text-sm text-atg-muted">Chargement…</p>;
}

export default function EditActivitePage({ params }: PageProps) {
  return (
    <Suspense fallback={<ActivityEditFallback />}>
      <ActivityEditPage activityId={params.id} />
    </Suspense>
  );
}

import type { Metadata } from 'next';
import { ActivityEditPage } from '../../../../../components/activities/activity-edit-page';

type PageProps = {
  params: { id: string };
};

export const metadata: Metadata = {
  title: 'Modifier l’activité — Africa Tourism Gate Admin',
};

export default function EditActivitePage({ params }: PageProps) {
  return <ActivityEditPage activityId={params.id} />;
}

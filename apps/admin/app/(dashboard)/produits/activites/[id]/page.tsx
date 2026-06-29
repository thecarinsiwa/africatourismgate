import type { Metadata } from 'next';
import { AdminPageLoading } from '../../../../../components/pages/admin-page-loading';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';
import { Suspense } from 'react';
import { ActivityEditPage } from '../../../../../components/activities/activity-edit-page';

type PageProps = {
  params: { id: string };
};

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('produits/activites/id');
}

function ActivityEditFallback() {
  return <AdminPageLoading />;
}

export default function EditActivitePage({ params }: PageProps) {
  return (
    <Suspense fallback={<ActivityEditFallback />}>
      <ActivityEditPage activityId={params.id} />
    </Suspense>
  );
}

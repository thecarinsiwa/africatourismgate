import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../../../lib/i18n/admin-page-i18n';
import { ActivityViewPage } from '../../../../../../components/activities/activity-view-page';

type PageProps = {
  params: { id: string };
};

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('produits/activites/id/voir');
}

export default function ViewActivitePage({ params }: PageProps) {
  return <ActivityViewPage activityId={params.id} />;
}

import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';
import { TourGuideViewPage } from '../../../../../components/tour-guides/tour-guide-view-page';

type PageProps = {
  params: { id: string };
};

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('guides/id/voir');
}

export default function ViewTourGuidePage({ params }: PageProps) {
  return <TourGuideViewPage guideId={params.id} />;
}

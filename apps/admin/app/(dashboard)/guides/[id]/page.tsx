import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../lib/i18n/admin-page-i18n';
import { TourGuideEditPage } from '../../../../components/tour-guides/tour-guide-edit-page';

type PageProps = {
  params: { id: string };
};

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('guides/id');
}

export default function EditTourGuidePage({ params }: PageProps) {
  return <TourGuideEditPage guideId={params.id} />;
}

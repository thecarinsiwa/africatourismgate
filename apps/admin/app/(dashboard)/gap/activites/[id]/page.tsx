import type { Metadata } from 'next';
import { GapActivitesIdPageContent } from '../../../../../components/pages/gap-activites-id-page-content';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('gap/activites/id');
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <GapActivitesIdPageContent id={id} />;
}

import type { Metadata } from 'next';
import { GapImpactIdPageContent } from '../../../../../components/pages/gap-impact-id-page-content';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('gap/impact/id');
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <GapImpactIdPageContent id={id} />;
}

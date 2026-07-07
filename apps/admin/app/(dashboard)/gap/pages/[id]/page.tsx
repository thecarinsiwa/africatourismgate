import type { Metadata } from 'next';
import { GapPagesIdPageContent } from '../../../../../components/pages/gap-pages-id-page-content';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('gap/pages/id');
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <GapPagesIdPageContent id={id} />;
}

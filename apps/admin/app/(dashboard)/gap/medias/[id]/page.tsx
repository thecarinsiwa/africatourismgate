import type { Metadata } from 'next';
import { GapMediasIdPageContent } from '../../../../../components/pages/gap-medias-id-page-content';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('gap/medias/id');
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <GapMediasIdPageContent id={id} />;
}

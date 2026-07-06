import type { Metadata } from 'next';
import { AboutPageEditPage } from '../../../../../../components/about/about-page-edit-page';
import { getAdminPageMetadata } from '../../../../../../lib/i18n/admin-page-i18n';

type PageProps = {
  params: { id: string };
};

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('contenu/a-propos/pages/id');
}

export default function Page({ params }: PageProps) {
  return <AboutPageEditPage pageId={params.id} />;
}

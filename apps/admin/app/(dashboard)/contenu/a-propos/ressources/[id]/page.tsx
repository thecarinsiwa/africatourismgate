import type { Metadata } from 'next';
import { AboutResourceEditPage } from '../../../../../../components/about/about-resource-edit-page';
import { getAdminPageMetadata } from '../../../../../../lib/i18n/admin-page-i18n';

type PageProps = {
  params: { id: string };
};

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('contenu/a-propos/ressources/id');
}

export default function Page({ params }: PageProps) {
  return <AboutResourceEditPage resourceId={params.id} />;
}

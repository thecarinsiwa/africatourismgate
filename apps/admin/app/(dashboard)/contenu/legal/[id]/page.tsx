import type { Metadata } from 'next';
import { LegalPageEditPage } from '../../../../../components/legal/legal-page-edit-page';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';

type PageProps = {
  params: { id: string };
};

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('contenu/legal/id');
}

export default function Page({ params }: PageProps) {
  return <LegalPageEditPage pageId={params.id} />;
}

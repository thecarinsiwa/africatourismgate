import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../lib/i18n/admin-page-i18n';
import { AvisPageContent } from '../../../../components/pages/contenu-avis-page-content';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('contenu/avis');
}

export default function Page() {
  return <AvisPageContent />;
}

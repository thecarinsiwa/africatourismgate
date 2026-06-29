import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';
import { NouvelleActivitePageContent } from '../../../../../components/pages/produits-activites-nouveau-page-content';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('produits/activites/nouveau');
}

export default function Page() {
  return <NouvelleActivitePageContent />;
}

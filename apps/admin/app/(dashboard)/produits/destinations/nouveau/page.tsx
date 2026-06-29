import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';
import { NouvelleDestinationPageContent } from '../../../../../components/pages/produits-destinations-nouveau-page-content';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('produits/destinations/nouveau');
}

export default function Page() {
  return <NouvelleDestinationPageContent />;
}

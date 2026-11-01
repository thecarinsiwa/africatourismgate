import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';
import { TronconsLocationsPageContent } from '../../../../../components/pages/produits-locations-troncons-page-content';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('produits/locations/troncons');
}

export default function Page() {
  return <TronconsLocationsPageContent />;
}

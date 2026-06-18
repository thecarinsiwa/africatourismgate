import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../lib/i18n/admin-page-i18n';
import { LocationsPageContent } from '../../../../components/pages/produits-locations-page-content';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('produits/locations');
}

export default function Page() {
  return <LocationsPageContent />;
}

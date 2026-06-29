import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';
import { NouveauVehiculePageContent } from '../../../../../components/pages/produits-locations-nouveau-page-content';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('produits/locations/nouveau');
}

export default function Page() {
  return <NouveauVehiculePageContent />;
}

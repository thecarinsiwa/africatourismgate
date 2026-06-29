import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';
import { AgencesLocationPageContent } from '../../../../../components/pages/produits-locations-agences-page-content';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('produits/locations/agences');
}

export default function Page() {
  return <AgencesLocationPageContent />;
}

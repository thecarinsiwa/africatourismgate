import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';
import { AeroportsPageContent } from '../../../../../components/pages/produits-vols-aeroports-page-content';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('produits/vols/aeroports');
}

export default function Page() {
  return <AeroportsPageContent />;
}

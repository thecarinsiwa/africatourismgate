import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';
import { NouveauDepartPageContent } from '../../../../../components/pages/produits-croisieres-nouveau-page-content';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('produits/croisieres/nouveau');
}

export default function Page() {
  return <NouveauDepartPageContent />;
}

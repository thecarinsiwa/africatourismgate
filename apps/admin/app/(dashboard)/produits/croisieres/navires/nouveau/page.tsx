import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../../../lib/i18n/admin-page-i18n';
import { NouveauNavirePageContent } from '../../../../../../components/pages/produits-croisieres-navires-nouveau-page-content';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('produits/croisieres/navires/nouveau');
}

export default function Page() {
  return <NouveauNavirePageContent />;
}

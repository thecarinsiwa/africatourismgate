import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';
import { NouveauVolPageContent } from '../../../../../components/pages/produits-vols-nouveau-page-content';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('produits/vols/nouveau');
}

export default function Page() {
  return <NouveauVolPageContent />;
}

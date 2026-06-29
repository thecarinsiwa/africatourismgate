import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';
import { NouveauForfaitPageContent } from '../../../../../components/pages/produits-forfaits-nouveau-page-content';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('produits/forfaits/nouveau');
}

export default function Page() {
  return <NouveauForfaitPageContent />;
}

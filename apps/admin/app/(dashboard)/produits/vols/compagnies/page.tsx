import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';
import { CompagniesPageContent } from '../../../../../components/pages/produits-vols-compagnies-page-content';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('produits/vols/compagnies');
}

export default function Page() {
  return <CompagniesPageContent />;
}

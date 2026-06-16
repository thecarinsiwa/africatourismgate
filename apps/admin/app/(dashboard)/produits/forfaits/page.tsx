import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../lib/i18n/admin-page-i18n';
import { ForfaitsPageContent } from '../../../../components/pages/produits-forfaits-page-content';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('produits/forfaits');
}

export default function Page() {
  return <ForfaitsPageContent />;
}

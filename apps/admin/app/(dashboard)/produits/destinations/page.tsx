import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../lib/i18n/admin-page-i18n';
import { DestinationsPageContent } from '../../../../components/pages/produits-destinations-page-content';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('produits/destinations');
}

export default function Page() {
  return <DestinationsPageContent />;
}

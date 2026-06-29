import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../lib/i18n/admin-page-i18n';
import { VolsPageContent } from '../../../../components/pages/produits-vols-page-content';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('produits/vols');
}

export default function Page() {
  return <VolsPageContent />;
}

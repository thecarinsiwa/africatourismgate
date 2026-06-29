import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';
import { NaviresPageContent } from '../../../../../components/pages/produits-croisieres-navires-page-content';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('produits/croisieres/navires');
}

export default function Page() {
  return <NaviresPageContent />;
}

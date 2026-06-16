import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../lib/i18n/admin-page-i18n';
import { CroisieresPageContent } from '../../../../components/pages/produits-croisieres-page-content';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('produits/croisieres');
}

export default function Page() {
  return <CroisieresPageContent />;
}

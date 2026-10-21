import type { Metadata } from 'next';
import { TresorerieEntreesNouveauPageContent } from '../../../../../components/pages/tresorerie-entrees-nouveau-page-content';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('tresorerie/entrees/nouveau');
}

export default function TresorerieEntreesNouveauPage() {
  return <TresorerieEntreesNouveauPageContent />;
}

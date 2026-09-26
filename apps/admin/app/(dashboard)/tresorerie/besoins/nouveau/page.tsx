import type { Metadata } from 'next';
import { TresorerieBesoinsNouveauPageContent } from '../../../../../components/pages/tresorerie-besoins-nouveau-page-content';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('tresorerie/besoins/nouveau');
}

export default function TresorerieBesoinsNouveauPage() {
  return <TresorerieBesoinsNouveauPageContent />;
}

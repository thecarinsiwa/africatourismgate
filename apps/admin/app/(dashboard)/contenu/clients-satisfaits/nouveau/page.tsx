import type { Metadata } from 'next';
import { ContenuClientsSatisfaitsNouveauPageContent } from '../../../../../components/pages/contenu-clients-satisfaits-nouveau-page-content';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('contenu/clients-satisfaits/nouveau');
}

export default function Page() {
  return <ContenuClientsSatisfaitsNouveauPageContent />;
}

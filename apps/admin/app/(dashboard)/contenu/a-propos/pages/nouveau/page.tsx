import type { Metadata } from 'next';
import { ContenuAProposPagesNouveauPageContent } from '../../../../../../components/pages/contenu-a-propos-pages-nouveau-page-content';
import { getAdminPageMetadata } from '../../../../../../lib/i18n/admin-page-i18n';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('contenu/a-propos/pages/nouveau');
}

export default function Page() {
  return <ContenuAProposPagesNouveauPageContent />;
}

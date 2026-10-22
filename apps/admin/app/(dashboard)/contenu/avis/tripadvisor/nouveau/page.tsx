import type { Metadata } from 'next';
import { ContenuAvisTripadvisorNouveauPageContent } from '../../../../../../components/pages/contenu-avis-tripadvisor-nouveau-page-content';
import { getAdminPageMetadata } from '../../../../../../lib/i18n/admin-page-i18n';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('contenu/avis/tripadvisor/nouveau');
}

export default function Page() {
  return <ContenuAvisTripadvisorNouveauPageContent />;
}

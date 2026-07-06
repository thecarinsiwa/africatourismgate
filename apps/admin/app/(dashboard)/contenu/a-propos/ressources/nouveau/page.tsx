import type { Metadata } from 'next';
import { ContenuAProposRessourcesNouveauPageContent } from '../../../../../../components/pages/contenu-a-propos-ressources-nouveau-page-content';
import { getAdminPageMetadata } from '../../../../../../lib/i18n/admin-page-i18n';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('contenu/a-propos/ressources/nouveau');
}

export default function Page() {
  return <ContenuAProposRessourcesNouveauPageContent />;
}

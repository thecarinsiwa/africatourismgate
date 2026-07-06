import type { Metadata } from 'next';
import { ContenuAProposRessourcesPageContent } from '../../../../../components/pages/contenu-a-propos-ressources-page-content';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('contenu/a-propos/ressources');
}

export default function Page() {
  return <ContenuAProposRessourcesPageContent />;
}

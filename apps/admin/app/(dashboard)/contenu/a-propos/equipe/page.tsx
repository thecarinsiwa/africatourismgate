import type { Metadata } from 'next';
import { ContenuAProposEquipePageContent } from '../../../../../components/pages/contenu-a-propos-equipe-page-content';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('contenu/a-propos/equipe');
}

export default function Page() {
  return <ContenuAProposEquipePageContent />;
}

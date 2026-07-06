import type { Metadata } from 'next';
import { ContenuAProposPagesPageContent } from '../../../../../components/pages/contenu-a-propos-pages-page-content';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('contenu/a-propos/pages');
}

export default function Page() {
  return <ContenuAProposPagesPageContent />;
}

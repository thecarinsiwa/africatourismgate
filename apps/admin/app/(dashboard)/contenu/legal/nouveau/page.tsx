import type { Metadata } from 'next';
import { ContenuLegalNouveauPageContent } from '../../../../../components/pages/contenu-legal-nouveau-page-content';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('contenu/legal/nouveau');
}

export default function Page() {
  return <ContenuLegalNouveauPageContent />;
}

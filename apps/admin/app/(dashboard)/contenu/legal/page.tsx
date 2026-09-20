import type { Metadata } from 'next';
import { ContenuLegalPageContent } from '../../../../components/pages/contenu-legal-page-content';
import { getAdminPageMetadata } from '../../../../lib/i18n/admin-page-i18n';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('contenu/legal');
}

export default function Page() {
  return <ContenuLegalPageContent />;
}

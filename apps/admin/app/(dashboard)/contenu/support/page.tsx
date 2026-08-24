import type { Metadata } from 'next';
import { ContenuSupportPageContent } from '../../../../components/pages/contenu-support-page-content';
import { getAdminPageMetadata } from '../../../../lib/i18n/admin-page-i18n';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('contenu/support');
}

export default function Page() {
  return <ContenuSupportPageContent />;
}

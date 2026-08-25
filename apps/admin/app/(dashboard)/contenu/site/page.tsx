import type { Metadata } from 'next';
import { ContenuSitePageContent } from '../../../../components/pages/contenu-site-page-content';
import { getAdminPageMetadata } from '../../../../lib/i18n/admin-page-i18n';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('contenu/site');
}

export default function Page() {
  return <ContenuSitePageContent />;
}

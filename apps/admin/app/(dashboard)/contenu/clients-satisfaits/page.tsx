import type { Metadata } from 'next';
import { ContenuClientsSatisfaitsPageContent } from '../../../../components/pages/contenu-clients-satisfaits-page-content';
import { getAdminPageMetadata } from '../../../../lib/i18n/admin-page-i18n';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('contenu/clients-satisfaits');
}

export default function Page() {
  return <ContenuClientsSatisfaitsPageContent />;
}

import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../lib/i18n/admin-page-i18n';
import { ActivitesPageContent } from '../../../../components/pages/produits-activites-page-content';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('produits/activites');
}

export default function Page() {
  return <ActivitesPageContent />;
}

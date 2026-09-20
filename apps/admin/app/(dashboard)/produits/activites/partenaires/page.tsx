import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';
import { PartenairesActivitesPageContent } from '../../../../../components/pages/produits-activites-partenaires-page-content';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('produits/activites/partenaires');
}

export default function Page() {
  return <PartenairesActivitesPageContent />;
}

import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';
import { ActivitesDemandesPageContent } from '../../../../../components/pages/produits-activites-demandes-page-content';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('produits/activites/demandes');
}

export default function Page() {
  return <ActivitesDemandesPageContent />;
}

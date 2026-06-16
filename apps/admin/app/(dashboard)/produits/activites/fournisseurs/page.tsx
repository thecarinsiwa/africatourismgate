import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';
import { FournisseursActivitesPageContent } from '../../../../../components/pages/produits-activites-fournisseurs-page-content';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('produits/activites/fournisseurs');
}

export default function Page() {
  return <FournisseursActivitesPageContent />;
}

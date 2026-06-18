import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../lib/i18n/admin-page-i18n';
import { AdressesPageContent } from '../../../../components/pages/utilisateurs-adresses-page-content';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('utilisateurs/adresses');
}

export default function Page() {
  return <AdressesPageContent />;
}

import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';
import { NouveauEmployePageContent } from '../../../../../components/pages/utilisateurs-employes-nouveau-page-content';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('utilisateurs/employes/nouveau');
}

export default function Page() {
  return <NouveauEmployePageContent />;
}

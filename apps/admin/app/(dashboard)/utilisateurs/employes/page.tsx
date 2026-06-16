import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../lib/i18n/admin-page-i18n';
import { EmployesPageContent } from '../../../../components/pages/utilisateurs-employes-page-content';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('utilisateurs/employes');
}

export default function Page() {
  return <EmployesPageContent />;
}

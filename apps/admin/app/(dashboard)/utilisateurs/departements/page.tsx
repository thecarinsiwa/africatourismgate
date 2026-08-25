import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../lib/i18n/admin-page-i18n';
import { DepartementsPageContent } from '../../../../components/pages/utilisateurs-departements-page-content';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('utilisateurs/departements');
}

export default function Page() {
  return <DepartementsPageContent />;
}

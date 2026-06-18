import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../lib/i18n/admin-page-i18n';
import { UtilisateursPageContent } from '../../../components/pages/utilisateurs-page-content';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('utilisateurs');
}

export default function Page() {
  return <UtilisateursPageContent />;
}

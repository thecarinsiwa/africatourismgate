import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../lib/i18n/admin-page-i18n';
import { SessionsPageContent } from '../../../../components/pages/utilisateurs-sessions-page-content';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('utilisateurs/sessions');
}

export default function Page() {
  return <SessionsPageContent />;
}

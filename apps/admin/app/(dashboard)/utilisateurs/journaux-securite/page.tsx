import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../lib/i18n/admin-page-i18n';
import { JournauxSecuritePageContent } from '../../../../components/pages/utilisateurs-journaux-securite-page-content';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('utilisateurs/journaux-securite');
}

export default function Page() {
  return <JournauxSecuritePageContent />;
}

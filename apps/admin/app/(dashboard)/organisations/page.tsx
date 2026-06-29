import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../lib/i18n/admin-page-i18n';
import { OrganisationsPageContent } from '../../../components/pages/organisations-page-content';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('organisations');
}

export default function Page() {
  return <OrganisationsPageContent />;
}

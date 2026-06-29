import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../lib/i18n/admin-page-i18n';
import { NouvelleOrganisationPageContent } from '../../../../components/pages/organisations-nouveau-page-content';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('organisations/nouveau');
}

export default function Page() {
  return <NouvelleOrganisationPageContent />;
}

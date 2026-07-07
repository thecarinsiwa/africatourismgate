import type { Metadata } from 'next';
import { GapActivitesNouveauPageContent } from '../../../../../components/pages/gap-activites-nouveau-page-content';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('gap/activites/nouveau');
}

export default function Page() {
  return <GapActivitesNouveauPageContent />;
}

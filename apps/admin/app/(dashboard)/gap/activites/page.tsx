import type { Metadata } from 'next';
import { GapActivitesPageContent } from '../../../../components/pages/gap-activites-page-content';
import { getAdminPageMetadata } from '../../../../lib/i18n/admin-page-i18n';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('gap/activites');
}

export default function Page() {
  return <GapActivitesPageContent />;
}

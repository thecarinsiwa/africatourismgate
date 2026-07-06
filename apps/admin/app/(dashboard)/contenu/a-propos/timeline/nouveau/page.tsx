import type { Metadata } from 'next';
import { ContenuAProposTimelineNouveauPageContent } from '../../../../../../components/pages/contenu-a-propos-timeline-nouveau-page-content';
import { getAdminPageMetadata } from '../../../../../../lib/i18n/admin-page-i18n';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('contenu/a-propos/timeline/nouveau');
}

export default function Page() {
  return <ContenuAProposTimelineNouveauPageContent />;
}

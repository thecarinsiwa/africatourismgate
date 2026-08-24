'use client';

import { useSearchParams } from 'next/navigation';
import { TimelineMilestoneForm } from '../about/timeline-milestone-form';
import { AdminIntroPage } from './admin-intro-page';

const CONTENT_LOCALES = new Set(['fr', 'en', 'es']);

export function ContenuAProposTimelineNouveauPageContent() {
  const searchParams = useSearchParams();
  const localeParam = searchParams.get('locale');
  const defaultLocale =
    localeParam && CONTENT_LOCALES.has(localeParam) ? localeParam : 'fr';

  return (
    <AdminIntroPage
      routePath="contenu/a-propos/timeline/nouveau"
      backHref="/contenu/site?tab=about-timeline"
      backLabelKey="backLabel"
    >
      <div className="min-w-0">
        <TimelineMilestoneForm mode="create" defaultLocale={defaultLocale} />
      </div>
    </AdminIntroPage>
  );
}

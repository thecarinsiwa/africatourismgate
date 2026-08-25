'use client';

import { useSearchParams } from 'next/navigation';
import { TeamMemberForm } from '../about/team-member-form';
import { AdminIntroPage } from './admin-intro-page';

const CONTENT_LOCALES = new Set(['fr', 'en', 'es']);

export function ContenuAProposEquipeNouveauPageContent() {
  const searchParams = useSearchParams();
  const localeParam = searchParams.get('locale');
  const defaultLocale =
    localeParam && CONTENT_LOCALES.has(localeParam) ? localeParam : 'fr';

  return (
    <AdminIntroPage
      routePath="contenu/a-propos/equipe/nouveau"
      backHref="/contenu/site?tab=about-team"
      backLabelKey="backLabel"
    >
      <div className="min-w-0">
        <TeamMemberForm mode="create" defaultLocale={defaultLocale} />
      </div>
    </AdminIntroPage>
  );
}

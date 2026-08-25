'use client';

import { useSearchParams } from 'next/navigation';
import { AboutResourceForm } from '../about/about-resource-form';
import { AdminIntroPage } from './admin-intro-page';

const CONTENT_LOCALES = new Set(['fr', 'en', 'es']);

export function ContenuAProposRessourcesNouveauPageContent() {
  const searchParams = useSearchParams();
  const localeParam = searchParams.get('locale');
  const defaultLocale =
    localeParam && CONTENT_LOCALES.has(localeParam) ? localeParam : 'fr';

  return (
    <AdminIntroPage
      routePath="contenu/a-propos/ressources/nouveau"
      backHref="/contenu/site?tab=about-resources"
      backLabelKey="backLabel"
    >
      <div className="min-w-0">
        <AboutResourceForm mode="create" defaultLocale={defaultLocale} />
      </div>
    </AdminIntroPage>
  );
}

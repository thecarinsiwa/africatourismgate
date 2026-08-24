'use client';

import { useSearchParams } from 'next/navigation';
import { HeroSlideForm } from '../hero-slides/hero-slide-form';
import { AdminIntroPage } from './admin-intro-page';

const CONTENT_LOCALES = new Set(['fr', 'en', 'es']);

export function ContenuHeroNouveauPageContent() {
  const searchParams = useSearchParams();
  const localeParam = searchParams.get('locale');
  const defaultLocale =
    localeParam && CONTENT_LOCALES.has(localeParam) ? localeParam : 'fr';

  return (
    <AdminIntroPage
      routePath="contenu/hero/nouveau"
      backHref="/contenu/site?tab=hero"
      backLabelKey="backLabel"
    >
      <div className="min-w-0">
        <HeroSlideForm mode="create" defaultLocale={defaultLocale} />
      </div>
    </AdminIntroPage>
  );
}

'use client';

import { useSearchParams } from 'next/navigation';
import { WhyUsItemForm } from '../why-us/why-us-item-form';
import { AdminIntroPage } from './admin-intro-page';

const CONTENT_LOCALES = new Set(['fr', 'en', 'es']);

export function ContenuPourquoiNousNouveauPageContent() {
  const searchParams = useSearchParams();
  const localeParam = searchParams.get('locale');
  const defaultLocale =
    localeParam && CONTENT_LOCALES.has(localeParam) ? localeParam : 'fr';

  return (
    <AdminIntroPage
      routePath="contenu/pourquoi-nous/nouveau"
      backHref="/contenu/site?tab=why-us"
      backLabelKey="backLabel"
    >
      <div className="min-w-0">
        <WhyUsItemForm mode="create" defaultLocale={defaultLocale} />
      </div>
    </AdminIntroPage>
  );
}

'use client';

import { useSearchParams } from 'next/navigation';
import { HappyCustomersStatForm } from '../happy-customers/happy-customers-stat-form';
import { AdminIntroPage } from './admin-intro-page';

const CONTENT_LOCALES = new Set(['fr', 'en', 'es']);

export function ContenuClientsSatisfaitsNouveauPageContent() {
  const searchParams = useSearchParams();
  const localeParam = searchParams.get('locale');
  const defaultLocale =
    localeParam && CONTENT_LOCALES.has(localeParam) ? localeParam : 'fr';

  return (
    <AdminIntroPage
      routePath="contenu/clients-satisfaits/nouveau"
      backHref="/contenu/site?tab=happy-customers"
      backLabelKey="backLabel"
    >
      <div className="min-w-0">
        <HappyCustomersStatForm mode="create" defaultLocale={defaultLocale} />
      </div>
    </AdminIntroPage>
  );
}

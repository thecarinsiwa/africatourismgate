'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { HeroSlidesList } from '../hero-slides/hero-slides-list';
import { AdminIntroPage } from './admin-intro-page';

export function ContenuHeroPageContent() {
  const t = useTranslations('modules.heroSlides.page');
  const tLocale = useTranslations('modules.heroSlides.locale');
  const localeFilterId = useId();
  const [locale, setLocale] = useState('fr');

  return (
    <AdminIntroPage routePath="contenu/hero">
      <div className="space-y-8">
        <div className="max-w-xs">
          <label htmlFor={localeFilterId} className="mb-1 block text-sm font-medium">
            {t('localeFilter')}
          </label>
          <select
            id={localeFilterId}
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            className="w-full rounded-lg border border-atg-border bg-atg-elevated px-3 py-2 text-sm"
          >
            <option value="fr">{tLocale('fr')}</option>
            <option value="en">{tLocale('en')}</option>
            <option value="es">{tLocale('es')}</option>
          </select>
        </div>

        <HeroSlidesList locale={locale} />
      </div>
    </AdminIntroPage>
  );
}

'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ContentLocaleSelect } from '../content/content-locale-select';
import { HeroSlidesList } from '../hero-slides/hero-slides-list';
import { HeroSlidesStatCards } from '../hero-slides/hero-slides-stat-cards';
import { useContentLocaleOptions } from '../../lib/content/use-content-locale-options';

export function ContenuHeroTabPanel() {
  const t = useTranslations('modules.heroSlides.page');
  const localeOptions = useContentLocaleOptions('modules.heroSlides.locale');
  const localeFilterId = useId();
  const [locale, setLocale] = useState('fr');

  return (
    <div className="space-y-8">
      <HeroSlidesStatCards className="mb-2" locale={locale} />

      <ContentLocaleSelect
        id={localeFilterId}
        label={t('localeFilter')}
        value={locale}
        options={localeOptions}
        onChange={setLocale}
      />

      <HeroSlidesList locale={locale} />
    </div>
  );
}

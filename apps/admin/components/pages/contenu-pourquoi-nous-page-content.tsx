'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AboutStatCards } from '../about/about-stat-cards';
import { ContentLocaleSelect } from '../content/content-locale-select';
import { WhyUsItemsList } from '../why-us/why-us-items-list';
import { WhyUsSectionForm } from '../why-us/why-us-section-form';
import { useContentLocaleOptions } from '../../lib/content/use-content-locale-options';
import { AdminIntroPage } from './admin-intro-page';

export function ContenuPourquoiNousPageContent() {
  const t = useTranslations('modules.about.whyUs.page');
  const localeOptions = useContentLocaleOptions('modules.about.locale');
  const localeFilterId = useId();
  const [locale, setLocale] = useState('fr');

  return (
    <AdminIntroPage routePath="contenu/pourquoi-nous">
      <div className="space-y-8">
        <AboutStatCards className="mb-2" section="whyUs" locale={locale} />

        <ContentLocaleSelect
          id={localeFilterId}
          label={t('localeFilter')}
          value={locale}
          options={localeOptions}
          onChange={setLocale}
        />

        <WhyUsSectionForm locale={locale} />
        <WhyUsItemsList locale={locale} />
      </div>
    </AdminIntroPage>
  );
}

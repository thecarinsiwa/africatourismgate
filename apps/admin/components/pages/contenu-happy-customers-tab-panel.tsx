'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AboutStatCards } from '../about/about-stat-cards';
import { ContentLocaleSelect } from '../content/content-locale-select';
import { HappyCustomersSectionForm } from '../happy-customers/happy-customers-section-form';
import { HappyCustomersStatsList } from '../happy-customers/happy-customers-stats-list';
import { useContentLocaleOptions } from '../../lib/content/use-content-locale-options';

export function ContenuHappyCustomersTabPanel() {
  const t = useTranslations('modules.about.happyCustomers.page');
  const localeOptions = useContentLocaleOptions('modules.about.locale');
  const localeFilterId = useId();
  const [locale, setLocale] = useState('fr');

  return (
    <div className="space-y-8">
      <AboutStatCards className="mb-2" section="happyCustomers" locale={locale} />

      <ContentLocaleSelect
        id={localeFilterId}
        label={t('localeFilter')}
        value={locale}
        options={localeOptions}
        onChange={setLocale}
      />

      <HappyCustomersSectionForm locale={locale} />
      <HappyCustomersStatsList locale={locale} />
    </div>
  );
}

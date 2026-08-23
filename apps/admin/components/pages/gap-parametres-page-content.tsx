'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ContentLocaleSelect } from '../content/content-locale-select';
import { GapAccessShell } from '../gap/gap-access-shell';
import { GapSiteSettingsForm } from '../gap/gap-site-settings-form';
import { useContentLocaleOptions } from '../../lib/content/use-content-locale-options';
import { AdminListPageHeader } from './admin-list-page-header';

export function GapParametresPageContent() {
  const t = useTranslations('modules.gap.parametres');
  const localeOptions = useContentLocaleOptions('modules.about.locale');
  const localeFilterId = useId();
  const [locale, setLocale] = useState('fr');

  return (
    <GapAccessShell>
      <div className="min-w-0">
        <AdminListPageHeader routePath="gap/parametres" />
        <div className="space-y-8">
          <ContentLocaleSelect
            id={localeFilterId}
            label={t('localeFilter')}
            value={locale}
            options={localeOptions}
            onChange={setLocale}
          />
          <GapSiteSettingsForm locale={locale} />
        </div>
      </div>
    </GapAccessShell>
  );
}

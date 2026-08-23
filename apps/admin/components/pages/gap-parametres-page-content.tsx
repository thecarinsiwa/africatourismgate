'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { GapAccessShell } from '../gap/gap-access-shell';
import { GapSiteSettingsForm } from '../gap/gap-site-settings-form';
import { AdminListPageHeader } from './admin-list-page-header';

export function GapParametresPageContent() {
  const t = useTranslations('modules.gap.parametres');
  const tLocale = useTranslations('modules.about.locale');
  const localeFilterId = useId();
  const [locale, setLocale] = useState('fr');

  return (
    <GapAccessShell>
      <div className="min-w-0">
        <AdminListPageHeader routePath="gap/parametres" />
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
          <GapSiteSettingsForm locale={locale} />
        </div>
      </div>
    </GapAccessShell>
  );
}

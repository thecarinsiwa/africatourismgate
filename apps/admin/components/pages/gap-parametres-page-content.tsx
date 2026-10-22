'use client';

import { AlertDialog, DataTableBadge } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { ContentLocaleSelect } from '../content/content-locale-select';
import { GapAccessShell } from '../gap/gap-access-shell';
import { GapSiteSettingsForm } from '../gap/gap-site-settings-form';
import { useUnsavedChangesGuard } from '../rbac/use-unsaved-changes-guard';
import { getApiClient } from '../../lib/auth/api';
import { useContentLocaleOptions } from '../../lib/content/use-content-locale-options';
import { AdminListPageHeader } from './admin-list-page-header';

export function GapParametresPageContent() {
  const t = useTranslations('modules.gap.parametres');
  const localeOptions = useContentLocaleOptions('modules.about.locale');
  const localeFilterId = useId();
  const [locale, setLocale] = useState('fr');
  const [formDirty, setFormDirty] = useState(false);
  const [configuredLocales, setConfiguredLocales] = useState<Set<string>>(() => new Set());
  const { dialogOpen, setDialogOpen, requestAction, confirmDiscard, cancelDiscard } =
    useUnsavedChangesGuard(formDirty);

  const loadConfiguredLocales = useCallback(async () => {
    try {
      const result = await getApiClient().listGapSiteSettings({ limit: 50 });
      const locales = new Set(
        result.data
          .map((row) => row.locale?.trim())
          .filter((value): value is string => Boolean(value)),
      );
      setConfiguredLocales(locales);
    } catch {
      /* keep previous badges */
    }
  }, []);

  useEffect(() => {
    void loadConfiguredLocales();
  }, [loadConfiguredLocales]);

  const handleLocaleChange = useCallback(
    (next: string) => {
      if (next === locale) return;
      requestAction(() => {
        setFormDirty(false);
        setLocale(next);
      });
    },
    [locale, requestAction],
  );

  const localeOptionsWithBadges = useMemo(
    () =>
      localeOptions.map((option) => ({
        ...option,
        label: configuredLocales.has(option.value)
          ? `${option.label} ✓`
          : option.label,
      })),
    [configuredLocales, localeOptions],
  );

  return (
    <GapAccessShell>
      <>
        <div className="min-w-0">
          <AdminListPageHeader routePath="gap/parametres" />
          <div className="space-y-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <ContentLocaleSelect
                id={localeFilterId}
                label={t('localeFilter')}
                value={locale}
                options={localeOptionsWithBadges}
                onChange={handleLocaleChange}
              />
              <div className="flex flex-wrap gap-2">
                {localeOptions.map((option) => {
                  const configured = configuredLocales.has(option.value);
                  return (
                    <DataTableBadge
                      key={option.value}
                      variant={configured ? 'success' : 'muted'}
                    >
                      {configured
                        ? t('localeConfigured', { locale: option.label })
                        : t('localeMissing', { locale: option.label })}
                    </DataTableBadge>
                  );
                })}
              </div>
            </div>

            <GapSiteSettingsForm
              locale={locale}
              onDirtyChange={setFormDirty}
              onSaved={() => void loadConfiguredLocales()}
            />
          </div>
        </div>

        <AlertDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title={t('unsaved.title')}
          description={t('unsaved.description')}
          confirmLabel={t('unsaved.confirm')}
          cancelLabel={t('unsaved.cancel')}
          variant="danger"
          onConfirm={confirmDiscard}
          onCancel={cancelDiscard}
        />
      </>
    </GapAccessShell>
  );
}

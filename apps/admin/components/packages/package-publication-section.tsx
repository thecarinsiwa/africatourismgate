'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { Button, DataTableBadge, Switch } from '@africatourismgate/ui';
import type { Package } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useEffect, useId, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { usePackageStatusLabels } from '../../lib/i18n/use-module-labels';

type PackagePublicationSectionProps = {
  packageId: string;
  initialPackage: Package;
  onSaved?: (nextPackage: Package) => void;
};

export function PackagePublicationSection({
  packageId,
  initialPackage,
  onSaved,
}: PackagePublicationSectionProps) {
  const { packages: getPackagesErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.packages.sections.publication');
  const tForm = useTranslations('modules.packages.form');
  const tActions = useTranslations('common.actions');
  const statusLabels = usePackageStatusLabels();
  const activeId = useId();
  const featuredId = useId();

  const [active, setActive] = useState(initialPackage.active === 1);
  const [isFeatured, setIsFeatured] = useState(initialPackage.isFeatured === 1);
  const [error, setError] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setActive(initialPackage.active === 1);
    setIsFeatured(initialPackage.isFeatured === 1);
  }, [initialPackage.active, initialPackage.isFeatured]);

  const dirty =
    active !== (initialPackage.active === 1) ||
    isFeatured !== (initialPackage.isFeatured === 1);

  async function handleSave() {
    setError(null);
    setSavedNotice(false);
    setSaving(true);
    try {
      const updated = await getApiClient().updatePackage(packageId, {
        active,
        isFeatured,
      });
      onSaved?.(updated);
      setSavedNotice(true);
    } catch (err) {
      setError(getPackagesErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,18rem)] lg:items-start xl:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
      <section className="min-w-0 space-y-5">
        <div>
          <h3 className="text-sm font-semibold text-atg-fg">{t('title')}</h3>
          <p className="mt-1 text-sm text-atg-muted">{t('intro')}</p>
        </div>

        {error ? (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400"
          >
            {error}
          </p>
        ) : null}

        {savedNotice && !dirty ? (
          <p
            role="status"
            className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200"
          >
            {t('saved')}
          </p>
        ) : null}

        <div className="divide-y divide-atg-border overflow-hidden rounded-xl border border-atg-border bg-atg-elevated">
          <div className="flex items-start justify-between gap-4 p-4 sm:p-5">
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-medium text-atg-fg">{tForm('activeLabel')}</p>
              <p className="text-xs leading-relaxed text-atg-muted">{t('activeHint')}</p>
            </div>
            <Switch
              id={activeId}
              checked={active}
              onChange={(e) => {
                setSavedNotice(false);
                setActive(e.target.checked);
              }}
              disabled={saving}
              aria-label={tForm('activeLabel')}
            />
          </div>

          <div className="flex items-start justify-between gap-4 p-4 sm:p-5">
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-medium text-atg-fg">{tForm('featuredLabel')}</p>
              <p className="text-xs leading-relaxed text-atg-muted">{tForm('featuredHint')}</p>
            </div>
            <Switch
              id={featuredId}
              checked={isFeatured}
              onChange={(e) => {
                setSavedNotice(false);
                setIsFeatured(e.target.checked);
              }}
              disabled={saving}
              aria-label={tForm('featuredLabel')}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Button
            type="button"
            onClick={() => void handleSave()}
            loading={saving}
            disabled={!dirty && !saving}
          >
            {tActions('save')}
          </Button>
          <Button
            type="button"
            variant="outline"
            href={`/produits/forfaits/${packageId}/voir`}
          >
            {t('viewPackage')}
          </Button>
        </div>
      </section>

      <aside className="min-w-0 self-start rounded-xl border border-atg-border bg-atg-elevated p-4 lg:sticky lg:top-6">
        <p className="text-xs font-medium uppercase tracking-wide text-atg-muted">
          {t('statusTitle')}
        </p>
        <p className="mt-2 text-base font-semibold text-atg-fg">{initialPackage.name}</p>

        <dl className="mt-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-sm text-atg-muted">{t('statusVisibility')}</dt>
            <dd>
              <DataTableBadge variant={active ? 'success' : 'muted'}>
                {active ? statusLabels.active : statusLabels.inactive}
              </DataTableBadge>
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-sm text-atg-muted">{t('statusFeatured')}</dt>
            <dd>
              <DataTableBadge variant={isFeatured ? 'success' : 'muted'}>
                {isFeatured ? t('featuredOn') : t('featuredOff')}
              </DataTableBadge>
            </dd>
          </div>
        </dl>

        <p className="mt-4 text-xs leading-relaxed text-atg-muted">
          {active ? t('previewActive') : t('previewInactive')}
        </p>
      </aside>
    </div>
  );
}

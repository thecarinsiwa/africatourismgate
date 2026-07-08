'use client';

import type { Package } from '@africatourismgate/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { PackageDescriptionAssetsSection } from './package-description-assets-section';
import { PackageForm } from './package-form';
import { PackageImagesSection } from './package-images-section';
import { PackageItemsSection } from './package-items-section';
import { PackagePublicationSection } from './package-publication-section';

const TAB_VALUES = ['informations', 'prestations', 'medias', 'publication'] as const;
type TabValue = (typeof TAB_VALUES)[number];

function isTabValue(value: string | null): value is TabValue {
  return value !== null && (TAB_VALUES as readonly string[]).includes(value);
}

type PackageEditorTabsProps = {
  packageId: string;
  pkg: Package;
  onPackageUpdated: (pkg: Package) => void;
};

export function PackageEditorTabs({ packageId, pkg, onPackageUpdated }: PackageEditorTabsProps) {
  const t = useTranslations('modules.packages.detail.tabs');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [counts, setCounts] = useState({ items: 0, images: 0, assets: 0 });
  const [countsReady, setCountsReady] = useState(false);

  const tabParam = searchParams.get('tab');
  const requestedTab: TabValue = isTabValue(tabParam) ? tabParam : 'informations';
  const informationComplete = useMemo(() => {
    const discount = Number(pkg.discountPercent);
    return (
      pkg.name.trim().length > 0 &&
      Number.isFinite(discount) &&
      discount >= 0 &&
      discount <= 100 &&
      pkg.durationDays >= 1 &&
      pkg.durationDays <= 365
    );
  }, [pkg.discountPercent, pkg.durationDays, pkg.name]);
  const prestationsComplete = counts.items > 0;
  const mediasComplete = counts.images + counts.assets > 0;
  const isStepEnabled = useCallback(
    (tab: TabValue) => {
      if (tab === 'informations') return true;
      if (tab === 'prestations') return informationComplete;
      if (tab === 'medias') return informationComplete && prestationsComplete;
      return informationComplete && prestationsComplete && mediasComplete;
    },
    [informationComplete, prestationsComplete, mediasComplete],
  );
  const activeTab: TabValue = isStepEnabled(requestedTab) ? requestedTab : 'informations';
  const stepItems: Array<{ value: TabValue; label: string }> = [
    { value: 'informations', label: t('informations') },
    { value: 'prestations', label: t('prestations') },
    { value: 'medias', label: t('medias') },
    { value: 'publication', label: t('publication') },
  ];
  const activeStepIndex = Math.max(
    0,
    stepItems.findIndex((step) => step.value === activeTab),
  );
  const progressPercent = Math.round(((activeStepIndex + 1) / stepItems.length) * 100);
  const activeTabHint =
    activeTab === 'informations'
      ? t('hints.informations')
      : activeTab === 'prestations'
        ? t('hints.prestations')
        : activeTab === 'medias'
          ? t('hints.medias')
          : t('hints.publication');

  const handleTabChange = useCallback(
    (tab: string) => {
      if (!isTabValue(tab) || !isStepEnabled(tab)) return;
      const params = new URLSearchParams(searchParams.toString());
      if (tab === 'informations') {
        params.delete('tab');
      } else {
        params.set('tab', tab);
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [isStepEnabled, pathname, router, searchParams],
  );

  const loadCompletion = useCallback(async () => {
    setCountsReady(false);
    try {
      const client = getApiClient();
      const [itemsResult, imagesResult, assetsResult] = await Promise.all([
        client.listPackageItems({ packageId, page: 1, limit: 100 }),
        client.listPackageImages({ packageId, page: 1, limit: 100 }),
        client.listPackageDescriptionAssets({ packageId, page: 1, limit: 100 }),
      ]);
      setCounts({
        items: itemsResult.data.length,
        images: imagesResult.data.length,
        assets: assetsResult.data.length,
      });
    } finally {
      setCountsReady(true);
    }
  }, [packageId]);

  useEffect(() => {
    void loadCompletion();
  }, [loadCompletion]);

  useEffect(() => {
    if (!countsReady || isStepEnabled(requestedTab)) return;
    const params = new URLSearchParams(searchParams.toString());
    params.delete('tab');
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [countsReady, isStepEnabled, pathname, requestedTab, router, searchParams]);

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
      <div className="rounded-xl border border-atg-border bg-atg-elevated p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-atg-fg">{t('aria')}</p>
          <p className="text-xs font-medium text-atg-muted">
            {activeStepIndex + 1}/{stepItems.length} · {progressPercent}%
          </p>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-atg-border/70">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
            aria-hidden
          />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {stepItems.map((step, index) => {
            const isActive = step.value === activeTab;
            const isDone = index < activeStepIndex;
            const isEnabled = isStepEnabled(step.value);
            return (
              <button
                key={step.value}
                type="button"
                onClick={() => handleTabChange(step.value)}
                disabled={!isEnabled}
                className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-xs transition ${
                  isActive
                    ? 'border-primary bg-primary/10 text-primary'
                    : isDone
                      ? 'border-emerald-500/40 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300'
                      : 'border-atg-border text-atg-muted hover:border-primary/40 hover:text-atg-fg'
                } ${!isEnabled ? 'cursor-not-allowed opacity-45' : ''}`}
              >
                <span
                  className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                    isActive
                      ? 'bg-primary/20'
                      : isDone
                        ? 'bg-emerald-500/20'
                        : 'bg-atg-surface/70'
                  }`}
                >
                  {index + 1}
                </span>
                <span className="truncate">{step.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <TabsList
        aria-label={t('aria')}
        className="rounded-xl border border-atg-border bg-atg-elevated px-1.5 py-1"
      >
        {stepItems.map((step) => (
          <TabsTrigger
            key={step.value}
            value={step.value}
            className="rounded-lg"
            disabled={!isStepEnabled(step.value)}
          >
            {step.label}
          </TabsTrigger>
        ))}
      </TabsList>
      <p className="text-sm text-atg-muted">
        {activeTabHint}
        {!prestationsComplete ? ` ${t('lockedHint.prestations')}` : ''}
        {prestationsComplete && !mediasComplete ? ` ${t('lockedHint.medias')}` : ''}
      </p>

      <TabsContent
        value="informations"
        className="rounded-xl border border-atg-border bg-atg-elevated/60 p-4 sm:p-6"
      >
        <PackageForm mode="edit" packageId={packageId} initialPackage={pkg} />
      </TabsContent>

      <TabsContent
        value="prestations"
        className="rounded-xl border border-atg-border bg-atg-elevated/60 p-4 sm:p-6"
      >
        <PackageItemsSection packageId={packageId} embedded onChanged={() => void loadCompletion()} />
      </TabsContent>

      <TabsContent
        value="medias"
        className="rounded-xl border border-atg-border bg-atg-elevated/60 p-4 sm:p-6"
      >
        <div className="space-y-6">
          <PackageImagesSection
            packageId={packageId}
            embedded
            onChanged={() => void loadCompletion()}
          />
          <PackageDescriptionAssetsSection
            packageId={packageId}
            onChanged={() => void loadCompletion()}
          />
        </div>
      </TabsContent>

      <TabsContent
        value="publication"
        className="rounded-xl border border-atg-border bg-atg-elevated/60 p-4 sm:p-6"
      >
        <PackagePublicationSection
          packageId={packageId}
          initialPackage={pkg}
          onSaved={onPackageUpdated}
        />
      </TabsContent>
    </Tabs>
  );
}

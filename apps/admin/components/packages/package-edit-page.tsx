'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import type { Package, PackageDetail } from '@africatourismgate/types';
import { Button, DataTableBadge, Skeleton } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { AdminPageBackLink } from '../admin-page-back-link';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { getApiClient } from '../../lib/auth/api';
import { usePackageStatusLabels } from '../../lib/i18n/use-module-labels';
import { PackageForm } from './package-form';
import { PackageImagesSection } from './package-images-section';
import { PackageItemsSection } from './package-items-section';

type PackageEditPageProps = {
  packageId: string;
};

function resolvePackageFromDetail(detail: PackageDetail | Package): Package | null {
  if ('package' in detail && detail.package) {
    return detail.package;
  }
  if ('name' in detail && typeof detail.name === 'string') {
    return detail;
  }
  return null;
}

export function PackageEditPage({ packageId }: PackageEditPageProps) {
  const { packages: getPackagesErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.packages.detail');
  const tCommon = useTranslations('modules.common');
  const packageStatusLabels = usePackageStatusLabels();
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; pkg: Package }
  >({ status: 'loading' });

  useAdminEditPageMeta({
    ready: state.status === 'ready',
    title: t('editTitle'),
    entityLabel: state.status === 'ready' ? state.pkg.name : undefined,
  });

  useEffect(() => {
    let cancelled = false;
    void getApiClient()
      .getPackage(packageId)
      .then((detail) => {
        const pkg = resolvePackageFromDetail(detail);
        if (!cancelled) {
          if (!pkg) {
            setState({ status: 'error', message: t('invalidResponse') });
            return;
          }
          setState({ status: 'ready', pkg });
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setState({ status: 'error', message: getPackagesErrorMessage(error) });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [packageId, getPackagesErrorMessage, t]);

  if (state.status === 'loading') {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-40" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-64 w-full max-w-2xl" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="space-y-4">
        <AdminPageBackLink href="/produits/forfaits" label={t('backLink')} />
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
      </div>
    );
  }

  const { pkg } = state;
  const discount = Number(pkg.discountPercent);
  const durationLabel =
    pkg.durationDays > 1
      ? tCommon('daysCountPlural', { count: pkg.durationDays })
      : tCommon('daysCount', { count: pkg.durationDays });

  return (
    <div className="space-y-6">
      <AdminPageBackLink href="/produits/forfaits" label={t('backLink')} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-atg-fg">{pkg.name}</h2>
          <div className="flex flex-wrap items-center gap-2">
            <DataTableBadge variant={discount > 0 ? 'success' : 'muted'}>
              {t('discountBadge', { percent: pkg.discountPercent })}
            </DataTableBadge>
            <DataTableBadge variant={pkg.active === 1 ? 'success' : 'muted'}>
              {pkg.active === 1 ? packageStatusLabels.active : packageStatusLabels.inactive}
            </DataTableBadge>
            <DataTableBadge variant="muted">{durationLabel}</DataTableBadge>
          </div>
        </div>
        <Button href={`/produits/forfaits/${packageId}/voir`} variant="outline">
          {t('viewButton')}
        </Button>
      </div>

      <PackageForm mode="edit" packageId={packageId} initialPackage={pkg} />
      <PackageItemsSection packageId={packageId} />
      <PackageImagesSection packageId={packageId} />
    </div>
  );
}

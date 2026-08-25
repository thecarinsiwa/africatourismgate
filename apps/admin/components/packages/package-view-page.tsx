'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  Button,
  Card,
  DataTable,
  DataTableBadge,
  Skeleton,
  type ColumnDef,
} from '@africatourismgate/ui';
import type {
  PackageDescriptionAsset,
  PackageDetail,
  PackageImage,
  PackageItemEnriched,
} from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AdminPageBackLink } from '../admin-page-back-link';
import { RichTextContent } from '../rich-text-content';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { getApiClient } from '../../lib/auth/api';
import { formatMoney } from '../../lib/format-money';
import { getPackageItemTypeLabel } from '../../lib/package-item-type';
import {
  useFormatDateTime,
  usePackageItemTypeLabels,
  usePackageStatusLabels,
} from '../../lib/i18n/use-module-labels';
import { PackageCompositionBanner } from './package-composition-banner';
import { PackageItemTypeIcon } from './package-item-type-icon';
import { PackagePhotosCarousel } from './package-photos-carousel';
import { PackagePreviewCard } from './package-preview-card';
import { PackagePricingRecap } from './package-pricing-recap';
import { PackageThumbnail } from './package-thumbnail';

type PackageViewPageProps = {
  packageId: string;
};

function ProfileField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-atg-muted">{label}</dt>
      <dd className="mt-0.5 break-words text-sm font-medium text-atg-fg">{value}</dd>
    </div>
  );
}

export function PackageViewPage({ packageId }: PackageViewPageProps) {
  const { packages: getPackagesErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.packages.detail');
  const tView = useTranslations('modules.packages.view');
  const tForm = useTranslations('modules.packages.form');
  const tCommon = useTranslations('modules.common');
  const tColumns = useTranslations('modules.common.columns');
  const tDates = useTranslations('modules.common.dates');
  const tActions = useTranslations('common.actions');
  const tAttachments = useTranslations('modules.packages.form.attachments');
  const itemTypeLabels = usePackageItemTypeLabels();
  const packageStatusLabels = usePackageStatusLabels();
  const formatDateTime = useFormatDateTime('short');
  const emptyDash = tCommon('empty.dash');

  const [detail, setDetail] = useState<PackageDetail | null>(null);
  const [images, setImages] = useState<PackageImage[]>([]);
  const [assets, setAssets] = useState<PackageDescriptionAsset[]>([]);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready' }
  >({ status: 'loading' });

  useAdminEditPageMeta({
    ready: state.status === 'ready' && detail != null,
    title: tView('title'),
    entityLabel: detail?.package.name,
  });

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const client = getApiClient();
      const [packageDetail, imagesResult, assetsResult] = await Promise.all([
        client.getPackage(packageId),
        client.listPackageImages({ packageId, page: 1, limit: 100 }),
        client.listPackageDescriptionAssets({ packageId, page: 1, limit: 100 }),
      ]);
      setDetail(packageDetail);
      setImages([...imagesResult.data].sort((a, b) => a.sortOrder - b.sortOrder));
      setAssets([...assetsResult.data].sort((a, b) => a.sortOrder - b.sortOrder));
      setState({ status: 'ready' });
    } catch (error) {
      setState({ status: 'error', message: getPackagesErrorMessage(error) });
    }
  }, [packageId, getPackagesErrorMessage]);

  useEffect(() => {
    void load();
  }, [load]);

  const itemColumns = useMemo<ColumnDef<PackageItemEnriched, unknown>[]>(
    () => [
      {
        id: 'type',
        header: tColumns('type'),
        cell: ({ row }) => (
          <PackageItemTypeIcon itemType={row.original.itemType} showLabel size="sm" />
        ),
      },
      {
        accessorKey: 'label',
        header: tColumns('product'),
        cell: ({ row }) => (
          <span className="font-medium text-atg-fg">{row.original.label}</span>
        ),
      },
      {
        id: 'itemTypeLabel',
        header: tColumns('category'),
        meta: { hideOnMobile: true },
        cell: ({ row }) => (
          <span className="text-sm text-atg-muted">
            {getPackageItemTypeLabel(row.original.itemType, itemTypeLabels)}
          </span>
        ),
      },
      {
        id: 'price',
        header: tColumns('unitPrice'),
        meta: { align: 'right' },
        cell: ({ row }) => (
          <span className="tabular-nums text-sm">
            {formatMoney(row.original.unitPriceCents, row.original.currency)}
          </span>
        ),
      },
    ],
    [itemTypeLabels, tColumns],
  );

  const editHref = `/produits/forfaits/${packageId}`;

  if (state.status === 'loading') {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-40" />
        <div className="flex items-center gap-4 rounded-xl border border-atg-border bg-atg-elevated p-4">
          <Skeleton className="h-12 w-16 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-64 w-full max-w-3xl" />
      </div>
    );
  }

  if (state.status === 'error' || !detail) {
    return (
      <div className="space-y-4">
        <AdminPageBackLink href="/produits/forfaits" label={t('backLink')} />
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.status === 'error' ? state.message : tView('notFound')}
        </p>
      </div>
    );
  }

  const { package: pkg, items, pricing } = detail;
  const discount = Number(pkg.discountPercent);
  const durationLabel =
    pkg.durationDays > 1
      ? tCommon('daysCountPlural', { count: pkg.durationDays })
      : tCommon('daysCount', { count: pkg.durationDays });
  const thumbUrl = pkg.coverImageUrl?.trim() || images[0]?.url || null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <AdminPageBackLink href="/produits/forfaits" label={t('backLink')} />
        <Button href={editHref} className="w-full sm:w-auto">
          {tView('editButton')}
        </Button>
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-atg-border bg-atg-elevated p-4 sm:flex-row sm:items-start">
        <PackageThumbnail imageUrl={thumbUrl} label={pkg.name} size="md" />
        <div className="min-w-0 flex-1 space-y-2">
          <h2 className="text-xl font-semibold text-atg-fg">{pkg.name}</h2>
          <div className="flex flex-wrap items-center gap-2">
            <DataTableBadge variant={pkg.active === 1 ? 'success' : 'muted'}>
              {pkg.active === 1 ? packageStatusLabels.active : packageStatusLabels.inactive}
            </DataTableBadge>
            {pkg.isFeatured === 1 ? (
              <DataTableBadge variant="success">{tView('featuredBadge')}</DataTableBadge>
            ) : null}
            <DataTableBadge variant={discount > 0 ? 'success' : 'muted'}>
              {t('discountBadge', { percent: pkg.discountPercent })}
            </DataTableBadge>
            <DataTableBadge variant="muted">{durationLabel}</DataTableBadge>
            <DataTableBadge variant="default">
              {formatMoney(pricing.totalCents, pricing.currency)}
            </DataTableBadge>
          </div>
          <p className="text-sm text-atg-muted">{tView('subtitle')}</p>
        </div>
      </div>

      <Card variant="dashboard" padding="sm">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,18rem)] lg:items-start xl:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
          <div className="min-w-0 space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-atg-fg">{tView('infoTitle')}</h3>
              <dl className="mt-3 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
                <ProfileField
                  label={tForm('durationDays')}
                  value={durationLabel}
                />
                <ProfileField
                  label={tForm('discountPercent')}
                  value={`${pkg.discountPercent}%`}
                />
                <ProfileField
                  label={tView('packagePrice')}
                  value={formatMoney(pricing.totalCents, pricing.currency)}
                />
                <ProfileField
                  label={tView('separatePrice')}
                  value={formatMoney(pricing.subtotalCents, pricing.currency)}
                />
                <ProfileField
                  label={tDates('createdAt')}
                  value={formatDateTime(pkg.createdAt)}
                />
                <ProfileField
                  label={tDates('updatedAt')}
                  value={pkg.updatedAt ? formatDateTime(pkg.updatedAt) : emptyDash}
                />
              </dl>
            </div>

            {pkg.description ? (
              <div>
                <h3 className="text-sm font-semibold text-atg-fg">{t('description')}</h3>
                <RichTextContent html={pkg.description} className="mt-2" />
              </div>
            ) : null}

            <PackagePricingRecap
              pricing={pricing}
              itemCount={items.length}
              size="sm"
              className="max-w-none"
            />
          </div>

          <div className="min-w-0 space-y-4 lg:border-l lg:border-atg-border lg:pl-6">
            <div>
              <h3 className="text-sm font-semibold text-atg-fg">{tView('imagesTitle')}</h3>
              <p className="mt-0.5 text-xs text-atg-muted">
                {tView('imagesIntro', { count: images.length })}
              </p>
              <div className="mt-2 max-w-sm lg:max-w-none">
                <PackagePhotosCarousel images={images} altFallback={pkg.name} />
              </div>
            </div>
            <PackagePreviewCard
              pkg={pkg}
              itemCount={items.length}
              pricing={pricing}
              size="sm"
            />
          </div>
        </div>
      </Card>

      <section className="space-y-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-atg-fg">{t('includedProducts')}</h3>
            <DataTableBadge variant="muted">{items.length}</DataTableBadge>
          </div>
          <p className="mt-1 text-sm text-atg-muted">
            {t('includedProductsIntro', { count: items.length })}
          </p>
        </div>
        <PackageCompositionBanner items={items} />
        <Card variant="dashboard" padding="none" className="overflow-hidden">
          <DataTable
            columns={itemColumns}
            data={items}
            emptyMessage={t('noIncludedProducts')}
            getRowId={(row) => row.id}
            aria-label={t('includedProducts')}
          />
        </Card>
      </section>

      {assets.length > 0 ? (
        <section className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-atg-fg">{tAttachments('title')}</h3>
            <DataTableBadge variant="muted">{assets.length}</DataTableBadge>
          </div>
          <p className="text-sm text-atg-muted">{tAttachments('hint')}</p>
          <Card variant="dashboard" className="divide-y divide-atg-border" padding="none">
            {assets.map((asset) => (
              <a
                key={asset.id}
                href={asset.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-3 px-4 py-3 text-sm transition hover:bg-atg-muted/10"
              >
                <span className="min-w-0 truncate font-medium text-atg-fg">
                  {asset.name ?? asset.url}
                </span>
                <span className="shrink-0 text-xs uppercase text-atg-muted">
                  {asset.assetType}
                </span>
              </a>
            ))}
          </Card>
        </section>
      ) : null}

      <div className="flex justify-end">
        <Button href={editHref} variant="outline">
          {tActions('edit')}
        </Button>
      </div>
    </div>
  );
}

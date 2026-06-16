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
  PackageDetail,
  PackageImage,
  PackageItemEnriched,
} from '@africatourismgate/types';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminPageBackLink } from '../admin-page-back-link';
import { RichTextContent } from '../rich-text-content';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { getApiClient } from '../../lib/auth/api';
import { formatMoney } from '../../lib/format-money';
import { getPackageItemTypeLabel } from '../../lib/package-item-type';
import {
  usePackageItemTypeLabels,
  usePackageStatusLabels,
} from '../../lib/i18n/use-module-labels';
import { PackageCompositionBanner } from './package-composition-banner';
import { PackageItemTypeIcon } from './package-item-type-icon';
import { PackagePreviewCard } from './package-preview-card';
import { PackagePricingRecap } from './package-pricing-recap';

type PackageViewPageProps = {
  packageId: string;
};

export function PackageViewPage({ packageId }: PackageViewPageProps) {
  const { packages: getPackagesErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.packages.detail');
  const tCommon = useTranslations('modules.common');
  const itemTypeLabels = usePackageItemTypeLabels();
  const packageStatusLabels = usePackageStatusLabels();
  const [detail, setDetail] = useState<PackageDetail | null>(null);
  const [images, setImages] = useState<PackageImage[]>([]);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready' }
  >({ status: 'loading' });

  useAdminEditPageMeta({
    ready: state.status === 'ready' && detail != null,
    title: t('viewTitle'),
    entityLabel: detail?.package.name,
  });

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const client = getApiClient();
      const [packageDetail, imagesResult] = await Promise.all([
        client.getPackage(packageId),
        client.listPackageImages({ packageId, page: 1, limit: 100 }),
      ]);
      setDetail(packageDetail);
      setImages(imagesResult.data);
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
        header: tCommon('columns.type'),
        cell: ({ row }) => <PackageItemTypeIcon itemType={row.original.itemType} size="sm" />,
      },
      {
        accessorKey: 'label',
        header: tCommon('columns.product'),
        cell: ({ row }) => (
          <span className="font-medium text-atg-fg">{row.original.label}</span>
        ),
      },
      {
        id: 'itemTypeLabel',
        header: tCommon('columns.category'),
        cell: ({ row }) => (
          <span className="text-sm text-atg-muted">
            {getPackageItemTypeLabel(row.original.itemType, itemTypeLabels)}
          </span>
        ),
      },
      {
        id: 'price',
        header: tCommon('columns.unitPrice'),
        meta: { align: 'right' },
        cell: ({ row }) => (
          <span className="tabular-nums text-sm">
            {formatMoney(row.original.unitPriceCents, row.original.currency)}
          </span>
        ),
      },
    ],
    [itemTypeLabels, tCommon],
  );

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

  if (state.status === 'error' || !detail) {
    return (
      <div className="space-y-4">
        <AdminPageBackLink href="/produits/forfaits" label={t('backLink')} />
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.status === 'error' ? state.message : t('notFound')}
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
        <Button href={`/produits/forfaits/${packageId}`}>{t('editButton')}</Button>
      </div>

      {pkg.description ? (
        <Card variant="dashboard" className="max-w-3xl">
          <h3 className="text-sm font-semibold text-atg-fg">{t('description')}</h3>
          <RichTextContent html={pkg.description} className="mt-2" />
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
        <PackagePricingRecap pricing={pricing} itemCount={items.length} className="max-w-none" />
        <PackagePreviewCard
          pkg={pkg}
          itemCount={items.length}
          pricing={pricing}
          className="lg:sticky lg:top-6"
        />
      </div>

      <PackageCompositionBanner items={items} />

      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-atg-fg">{t('includedProducts')}</h3>
          <p className="mt-1 text-sm text-atg-muted">
            {t('includedProductsIntro', { count: items.length })}
          </p>
        </div>
        <Card variant="dashboard" padding="none" className="overflow-hidden">
          <DataTable
            columns={itemColumns}
            data={items}
            emptyMessage={t('noIncludedProducts')}
            getRowId={(row) => row.id}
          />
        </Card>
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-atg-fg">{t('photoGallery')}</h3>
          <p className="mt-1 text-sm text-atg-muted">
            {t('photoGalleryIntro', { count: images.length })}
          </p>
        </div>
        {images.length === 0 ? (
          <Card variant="dashboard">
            <p className="text-sm text-atg-muted">{t('noPhotos')}</p>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {images.map((image) => (
              <figure
                key={image.id}
                className="overflow-hidden rounded-lg border border-atg-border bg-atg-elevated"
              >
                <Image
                  src={image.url}
                  alt={image.caption ?? pkg.name}
                  width={240}
                  height={160}
                  unoptimized
                  className="aspect-[3/2] w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                {image.caption ? (
                  <figcaption className="truncate px-2 py-1.5 text-xs text-atg-muted">
                    {image.caption}
                  </figcaption>
                ) : null}
              </figure>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

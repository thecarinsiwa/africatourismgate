'use client';

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
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminPageBackLink } from '../admin-page-back-link';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { getApiClient } from '../../lib/auth/api';
import { formatMoney } from '../../lib/format-money';
import { getPackageItemTypeLabel } from '../../lib/package-item-type';
import { getPackagesErrorMessage } from '../../lib/packages-errors';
import { PackageCompositionBanner } from './package-composition-banner';
import { PackageItemTypeIcon } from './package-item-type-icon';
import { PackagePreviewCard } from './package-preview-card';
import { PackagePricingRecap } from './package-pricing-recap';

type PackageViewPageProps = {
  packageId: string;
};

export function PackageViewPage({ packageId }: PackageViewPageProps) {
  const [detail, setDetail] = useState<PackageDetail | null>(null);
  const [images, setImages] = useState<PackageImage[]>([]);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready' }
  >({ status: 'loading' });

  useAdminEditPageMeta({
    ready: state.status === 'ready' && detail != null,
    title: 'Voir le forfait',
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
  }, [packageId]);

  useEffect(() => {
    void load();
  }, [load]);

  const itemColumns = useMemo<ColumnDef<PackageItemEnriched, unknown>[]>(
    () => [
      {
        id: 'type',
        header: 'Type',
        cell: ({ row }) => <PackageItemTypeIcon itemType={row.original.itemType} size="sm" />,
      },
      {
        accessorKey: 'label',
        header: 'Produit',
        cell: ({ row }) => (
          <span className="font-medium text-atg-fg">{row.original.label}</span>
        ),
      },
      {
        id: 'itemTypeLabel',
        header: 'Catégorie',
        cell: ({ row }) => (
          <span className="text-sm text-atg-muted">
            {getPackageItemTypeLabel(row.original.itemType)}
          </span>
        ),
      },
      {
        id: 'price',
        header: 'Prix unitaire',
        meta: { align: 'right' },
        cell: ({ row }) => (
          <span className="tabular-nums text-sm">
            {formatMoney(row.original.unitPriceCents, row.original.currency)}
          </span>
        ),
      },
    ],
    [],
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
        <AdminPageBackLink href="/produits/forfaits" label="Retour aux forfaits" />
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.status === 'error' ? state.message : 'Forfait introuvable.'}
        </p>
      </div>
    );
  }

  const { package: pkg, items, pricing } = detail;
  const discount = Number(pkg.discountPercent);

  return (
    <div className="space-y-6">
      <AdminPageBackLink href="/produits/forfaits" label="Retour aux forfaits" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-atg-fg">{pkg.name}</h2>
          <div className="flex flex-wrap items-center gap-2">
            <DataTableBadge variant={discount > 0 ? 'success' : 'muted'}>
              Remise {pkg.discountPercent}%
            </DataTableBadge>
            <DataTableBadge variant={pkg.active === 1 ? 'success' : 'muted'}>
              {pkg.active === 1 ? 'Actif' : 'Inactif'}
            </DataTableBadge>
            <DataTableBadge variant="muted">
              {pkg.durationDays} jour{pkg.durationDays > 1 ? 's' : ''}
            </DataTableBadge>
          </div>
        </div>
        <Button href={`/produits/forfaits/${packageId}`}>Modifier le forfait</Button>
      </div>

      {pkg.description ? (
        <Card variant="dashboard" className="max-w-3xl">
          <h3 className="text-sm font-semibold text-atg-fg">Description</h3>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-atg-muted">
            {pkg.description}
          </p>
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
          <h3 className="text-lg font-semibold text-atg-fg">Produits inclus</h3>
          <p className="mt-1 text-sm text-atg-muted">
            {items.length} produit{items.length !== 1 ? 's' : ''} dans ce forfait.
          </p>
        </div>
        <Card variant="dashboard" padding="none" className="overflow-hidden">
          <DataTable
            columns={itemColumns}
            data={items}
            emptyMessage="Aucun produit inclus."
            getRowId={(row) => row.id}
          />
        </Card>
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-atg-fg">Galerie photos</h3>
          <p className="mt-1 text-sm text-atg-muted">
            {images.length} photo{images.length !== 1 ? 's' : ''} associée
            {images.length !== 1 ? 's' : ''} au forfait.
          </p>
        </div>
        {images.length === 0 ? (
          <Card variant="dashboard">
            <p className="text-sm text-atg-muted">Aucune photo pour ce forfait.</p>
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

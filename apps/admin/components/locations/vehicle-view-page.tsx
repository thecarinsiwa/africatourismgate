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
  RentalAgency,
  Vehicle,
  VehicleAvailability,
  VehicleCategory,
  VehicleImage,
} from '@africatourismgate/types';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminPageBackLink } from '../admin-page-back-link';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { getApiClient } from '../../lib/auth/api';
import { getVehicleStatusLabel } from '../../lib/vehicle-status-labels';
import { useVehicleAvailabilityStatusLabels } from '../../lib/i18n/use-module-labels';
import { VehicleSpecsGrid } from './vehicle-specs-grid';
import { VehicleThumbnail } from './vehicle-thumbnail';

type VehicleViewPageProps = {
  vehicleId: string;
};

function formatPrice(cents: number, currency: string): string {
  return `${(cents / 100).toFixed(2)} ${currency}`;
}

export function VehicleViewPage({ vehicleId }: VehicleViewPageProps) {
  const { locations: getLocationsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.locations.detail');
  const tColumns = useTranslations('modules.locations.columns');
  const tAvailability = useTranslations('modules.locations.sections.availability');
  const tCommon = useTranslations('modules.common');
  const tCommonColumns = useTranslations('modules.common.columns');
  const statusLabels = useVehicleAvailabilityStatusLabels();
  const locale = useLocale();
  const emptyDash = tCommon('empty.dash');

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [agency, setAgency] = useState<RentalAgency | null>(null);
  const [category, setCategory] = useState<VehicleCategory | null>(null);
  const [images, setImages] = useState<VehicleImage[]>([]);
  const [slots, setSlots] = useState<VehicleAvailability[]>([]);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready' }
  >({ status: 'loading' });

  const entityLabel =
    vehicle?.licensePlate ?? category?.name ?? undefined;

  useAdminEditPageMeta({
    ready: state.status === 'ready' && vehicle != null,
    title: t('viewTitle'),
    entityLabel,
  });

  const formatRange = useCallback(
    (start: string, end: string): string => {
      const opts: Intl.DateTimeFormatOptions = {
        dateStyle: 'short',
        timeStyle: 'short',
      };
      try {
        return `${new Date(start).toLocaleString(locale, opts)} → ${new Date(end).toLocaleString(locale, opts)}`;
      } catch {
        return `${start} → ${end}`;
      }
    },
    [locale],
  );

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const client = getApiClient();
      const vehicleData = await client.getVehicle(vehicleId);
      const [agencyData, categoryData, imagesResult, slotsResult] = await Promise.all([
        client.getRentalAgency(vehicleData.agencyId).catch(() => null),
        client.getVehicleCategory(vehicleData.categoryId).catch(() => null),
        client.listVehicleImages({ vehicleId, page: 1, limit: 100 }),
        client.listVehicleAvailability({ vehicleId, page: 1, limit: 100 }),
      ]);

      setVehicle(vehicleData);
      setAgency(agencyData);
      setCategory(categoryData);
      setImages(
        [...imagesResult.data].sort((a, b) => a.sortOrder - b.sortOrder),
      );
      setSlots(slotsResult.data);
      setState({ status: 'ready' });
    } catch (error) {
      setState({ status: 'error', message: getLocationsErrorMessage(error) });
    }
  }, [vehicleId, getLocationsErrorMessage]);

  useEffect(() => {
    void load();
  }, [load]);

  const availabilityColumns = useMemo<ColumnDef<VehicleAvailability, unknown>[]>(
    () => [
      {
        id: 'range',
        header: tCommonColumns('period'),
        cell: ({ row }) => (
          <span className="text-sm">
            {formatRange(row.original.startDatetime, row.original.endDatetime)}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: tAvailability('status'),
        cell: ({ row }) => getVehicleStatusLabel(row.original.status, statusLabels),
      },
    ],
    [formatRange, statusLabels, tAvailability, tCommonColumns],
  );

  const thumbnailLabel =
    vehicle?.licensePlate ?? category?.name ?? vehicle?.id.slice(0, 8) ?? '';

  if (state.status === 'loading') {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-24 w-full max-w-3xl" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (state.status === 'error' || !vehicle) {
    return (
      <div className="space-y-4">
        <AdminPageBackLink href="/produits/locations" label={t('backLink')} />
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.status === 'error' ? state.message : t('notFound')}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <AdminPageBackLink href="/produits/locations" label={t('backLink')} />

      <Card
        variant="dashboard"
        className="flex flex-col gap-4 border border-atg-border/80 bg-atg-elevated/70 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5"
      >
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <VehicleThumbnail
            vehicleId={vehicleId}
            label={thumbnailLabel}
            categoryName={category?.name}
            size="md"
          />
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {vehicle.licensePlate ? (
                <code className="rounded-md bg-atg-surface px-2.5 py-1 font-mono text-sm font-semibold text-atg-fg ring-1 ring-atg-border/60">
                  {vehicle.licensePlate}
                </code>
              ) : (
                <span className="text-sm font-medium text-atg-fg">{t('noLicensePlate')}</span>
              )}
              {agency ? <DataTableBadge variant="muted">{agency.name}</DataTableBadge> : null}
              {category ? <DataTableBadge variant="default">{category.name}</DataTableBadge> : null}
            </div>
            <p className="tabular-nums text-sm font-medium text-atg-fg">
              {formatPrice(vehicle.dailyPriceCents, vehicle.currency)}
            </p>
          </div>
        </div>
        <Button href={`/produits/locations/${vehicleId}`} className="w-full sm:w-auto">
          {t('editButton')}
        </Button>
      </Card>

      {category ? <VehicleSpecsGrid categoryName={category.name} /> : null}

      <Card variant="dashboard" className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-atg-muted">
            {tColumns('agency')}
          </p>
          <p className="mt-1 text-sm font-medium text-atg-fg">{agency?.name ?? emptyDash}</p>
          {agency?.address ? (
            <p className="text-xs text-atg-muted">{agency.address}</p>
          ) : null}
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-atg-muted">
            {tColumns('category')}
          </p>
          <p className="mt-1 text-sm font-medium text-atg-fg">{category?.name ?? emptyDash}</p>
          {category?.exampleModel ? (
            <p className="text-xs text-atg-muted">{category.exampleModel}</p>
          ) : null}
        </div>
      </Card>

      <section className="space-y-4 rounded-xl border border-atg-border/80 bg-atg-elevated/40 p-4 sm:p-5">
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
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {images.map((image) => (
              <figure
                key={image.id}
                className="overflow-hidden rounded-lg border border-atg-border bg-atg-elevated shadow-sm"
              >
                <Image
                  src={image.url}
                  alt={image.caption ?? thumbnailLabel}
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

      <section className="space-y-4 rounded-xl border border-atg-border/80 bg-atg-elevated/40 p-4 sm:p-5">
        <div>
          <h3 className="text-lg font-semibold text-atg-fg">{tAvailability('title')}</h3>
          <p className="mt-1 text-sm text-atg-muted">{tAvailability('intro')}</p>
        </div>
        {slots.length === 0 ? (
          <Card variant="dashboard">
            <p className="text-sm text-atg-muted">{tAvailability('empty')}</p>
          </Card>
        ) : (
          <Card variant="dashboard" padding="none" className="overflow-hidden">
            <DataTable
              columns={availabilityColumns}
              data={slots}
              getRowId={(row) => row.id}
              emptyMessage={tAvailability('empty')}
              aria-label={tAvailability('title')}
            />
          </Card>
        )}
      </section>
    </div>
  );
}

'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';
import { useFormatDateTime } from '../../lib/i18n/use-module-labels';

import {
  Button,
  Card,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  DataTableBadge,
  Input,
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
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminPageBackLink } from '../admin-page-back-link';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { getApiClient } from '../../lib/auth/api';
import { getVehicleStatusLabel } from '../../lib/vehicle-status-labels';
import { useVehicleAvailabilityStatusLabels } from '../../lib/i18n/use-module-labels';
import { VehiclePhotosCarousel } from './vehicle-photos-carousel';
import { VehicleSpecsGrid } from './vehicle-specs-grid';
import { VehicleThumbnail } from './vehicle-thumbnail';

type VehicleViewPageProps = {
  vehicleId: string;
};

function ProfileField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-atg-muted">{label}</dt>
      <dd className="mt-0.5 break-words text-sm font-medium text-atg-fg">{value}</dd>
    </div>
  );
}

function formatPrice(cents: number, currency: string): string {
  return `${(cents / 100).toFixed(2)} ${currency}`;
}

export function VehicleViewPage({ vehicleId }: VehicleViewPageProps) {
  const { locations: getLocationsErrorMessage } = useAdminErrorMessages();
  const tDetail = useTranslations('modules.locations.detail');
  const tView = useTranslations('modules.locations.view');
  const tForm = useTranslations('modules.locations.form');
  const tColumns = useTranslations('modules.locations.columns');
  const tAvailability = useTranslations('modules.locations.sections.availability');
  const tCommon = useTranslations('modules.common');
  const tCommonColumns = useTranslations('modules.common.columns');
  const tDates = useTranslations('modules.common.dates');
  const tActions = useTranslations('common.actions');
  const statusLabels = useVehicleAvailabilityStatusLabels();
  const formatDateTime = useFormatDateTime('short');
  const locale = useLocale();
  const emptyDash = tCommon('empty.dash');

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [agency, setAgency] = useState<RentalAgency | null>(null);
  const [category, setCategory] = useState<VehicleCategory | null>(null);
  const [images, setImages] = useState<VehicleImage[]>([]);
  const [slots, setSlots] = useState<VehicleAvailability[]>([]);
  const [slotSearch, setSlotSearch] = useState('');
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready' }
  >({ status: 'loading' });

  const entityLabel = vehicle?.licensePlate ?? category?.name ?? undefined;

  useAdminEditPageMeta({
    ready: state.status === 'ready' && vehicle != null,
    title: tView('title'),
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
      setImages([...imagesResult.data].sort((a, b) => a.sortOrder - b.sortOrder));
      setSlots(slotsResult.data);
      setState({ status: 'ready' });
    } catch (error) {
      setState({ status: 'error', message: getLocationsErrorMessage(error) });
    }
  }, [vehicleId, getLocationsErrorMessage]);

  useEffect(() => {
    void load();
  }, [load]);

  const editHref = `/produits/locations/${vehicleId}`;
  const availabilityHref = `/produits/locations/${vehicleId}/disponibilites`;

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
        cell: ({ row }) => (
          <DataTableBadge variant="muted">
            {getVehicleStatusLabel(row.original.status, statusLabels)}
          </DataTableBadge>
        ),
      },
      {
        id: 'actions',
        header: tCommonColumns('actions'),
        meta: { align: 'right' },
        cell: () => (
          <DataTableActions className="opacity-90 transition-opacity group-hover:opacity-100">
            <DataTableActionButton action="calendar" href={availabilityHref} />
            <DataTableActionButton
              action="edit"
              href={editHref}
              label={tActions('edit')}
            />
          </DataTableActions>
        ),
      },
    ],
    [
      availabilityHref,
      editHref,
      formatRange,
      statusLabels,
      tActions,
      tAvailability,
      tCommonColumns,
    ],
  );

  const filteredSlots = useMemo(() => {
    const query = slotSearch.trim().toLowerCase();
    const sorted = [...slots].sort(
      (a, b) =>
        new Date(a.startDatetime).getTime() - new Date(b.startDatetime).getTime(),
    );
    if (!query) return sorted;

    return sorted.filter((slot) => {
      const statusLabel = getVehicleStatusLabel(slot.status, statusLabels);
      const haystack = [
        statusLabel,
        slot.status,
        formatRange(slot.startDatetime, slot.endDatetime),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [formatRange, slotSearch, slots, statusLabels]);

  const hasSlotSearch = slotSearch.trim().length > 0;
  const thumbnailLabel =
    vehicle?.licensePlate ?? category?.name ?? vehicle?.id.slice(0, 8) ?? '';

  if (state.status === 'loading') {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-40" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-16 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-64 w-full max-w-3xl" />
      </div>
    );
  }

  if (state.status === 'error' || !vehicle) {
    return (
      <div className="space-y-4">
        <AdminPageBackLink href="/produits/locations" label={tDetail('backLink')} />
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.status === 'error' ? state.message : tView('notFound')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <AdminPageBackLink href="/produits/locations" label={tDetail('backLink')} />
        <div className="flex flex-wrap items-center gap-2">
          <Button href={availabilityHref} variant="outline">
            {tAvailability('title')}
          </Button>
          <Button href={editHref}>{tView('editButton')}</Button>
        </div>
      </div>

      <div className="flex flex-wrap items-start gap-4">
        <VehicleThumbnail
          vehicleId={vehicleId}
          label={thumbnailLabel}
          categoryName={category?.name}
          size="md"
        />
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {vehicle.licensePlate ? (
              <h2 className="font-mono text-xl font-semibold text-atg-fg">
                {vehicle.licensePlate}
              </h2>
            ) : (
              <h2 className="text-xl font-semibold text-atg-fg">
                {tDetail('noLicensePlate')}
              </h2>
            )}
            {agency ? <DataTableBadge variant="muted">{agency.name}</DataTableBadge> : null}
            {category ? (
              <DataTableBadge variant="default">{category.name}</DataTableBadge>
            ) : null}
          </div>
          <p className="tabular-nums text-sm font-semibold text-atg-fg">
            {formatPrice(vehicle.dailyPriceCents, vehicle.currency)}
          </p>
        </div>
      </div>

      <Card variant="dashboard" padding="sm">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)_minmax(0,17rem)]">
          {category ? (
            <div className="flex min-w-0 flex-col justify-center">
              <VehicleSpecsGrid categoryName={category.name} />
            </div>
          ) : null}

          <div
            className={
              category
                ? 'min-w-0 lg:border-l lg:border-atg-border lg:pl-6'
                : 'min-w-0 lg:col-span-1 xl:col-span-1'
            }
          >
            <h3 className="text-sm font-semibold text-atg-fg">{tView('infoTitle')}</h3>
            <dl className="mt-3 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
              <ProfileField
                label={tForm('rentalAgency')}
                value={
                  <span>
                    {agency?.name ?? emptyDash}
                    {agency?.address ? (
                      <span className="mt-0.5 block text-xs font-normal text-atg-muted">
                        {agency.address}
                      </span>
                    ) : null}
                  </span>
                }
              />
              <ProfileField
                label={tForm('category')}
                value={
                  <span>
                    {category?.name ?? emptyDash}
                    {category?.exampleModel ? (
                      <span className="mt-0.5 block text-xs font-normal text-atg-muted">
                        {category.exampleModel}
                      </span>
                    ) : null}
                  </span>
                }
              />
              <ProfileField
                label={tForm('licensePlate')}
                value={vehicle.licensePlate ?? tDetail('noLicensePlate')}
              />
              <ProfileField
                label={tColumns('pricePerDay')}
                value={formatPrice(vehicle.dailyPriceCents, vehicle.currency)}
              />
              <ProfileField
                label={tDates('createdAt')}
                value={formatDateTime(vehicle.createdAt)}
              />
              <ProfileField
                label={tDates('updatedAt')}
                value={
                  vehicle.updatedAt ? formatDateTime(vehicle.updatedAt) : emptyDash
                }
              />
            </dl>
          </div>

          <div className="min-w-0 lg:col-span-2 lg:border-t lg:border-atg-border lg:pt-6 xl:col-span-1 xl:border-l xl:border-t-0 xl:pl-6 xl:pt-0">
            <h3 className="text-sm font-semibold text-atg-fg">{tView('imagesTitle')}</h3>
            <p className="mt-0.5 text-xs text-atg-muted">
              {tView('imagesIntro', { count: images.length })}
            </p>
            <div className="mt-2 max-w-sm xl:max-w-none">
              <VehiclePhotosCarousel images={images} altFallback={thumbnailLabel} />
            </div>
          </div>
        </div>
      </Card>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold text-atg-fg">
                {tAvailability('title')}
              </h3>
              <DataTableBadge variant="muted">
                {hasSlotSearch
                  ? `${filteredSlots.length}/${slots.length}`
                  : slots.length}
              </DataTableBadge>
            </div>
            <p className="mt-1 text-sm text-atg-muted">
              {tView('availabilityIntro', { count: slots.length })}
            </p>
          </div>
          <Button href={`${availabilityHref}?add=1`} variant="outline" size="sm">
            {tAvailability('addSlot')}
          </Button>
        </div>

        {slots.length > 0 ? (
          <div className="max-w-md">
            <Input
              type="search"
              placeholder={tView('availabilitySearchPlaceholder')}
              value={slotSearch}
              onChange={(e) => setSlotSearch(e.target.value)}
              aria-label={tView('availabilitySearchPlaceholder')}
            />
          </div>
        ) : null}

        <Card variant="dashboard" padding="none" className="overflow-hidden">
          <DataTable
            columns={availabilityColumns}
            data={filteredSlots}
            emptyMessage={
              hasSlotSearch
                ? tView('availabilitySearchEmpty')
                : tAvailability('empty')
            }
            emptyVariant={hasSlotSearch ? 'search' : 'default'}
            getRowId={(row) => row.id}
            aria-label={tAvailability('title')}
            loadingMessage={tCommon('dataTable.loading')}
            expandRowLabel={tCommon('dataTable.expandRow')}
            collapseRowLabel={tCommon('dataTable.collapseRow')}
            expandRowAriaLabel={tCommon('dataTable.expandRowAria')}
          />
        </Card>
      </section>

      <div className="flex justify-end">
        <Button href={editHref} variant="outline">
          {tActions('edit')}
        </Button>
      </div>
    </div>
  );
}

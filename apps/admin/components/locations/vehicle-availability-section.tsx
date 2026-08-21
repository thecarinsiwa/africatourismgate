'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  AlertDialog,
  Button,
  Card,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  DataTableBadge,
  Input,
  Modal,
  Select,
  Skeleton,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { VehicleAvailability, VehicleAvailabilityStatus } from '@africatourismgate/types';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import {
  fromDatetimeLocalValue,
  toDatetimeLocalValue,
} from '../../lib/flight-datetime';
import { getVehicleStatusLabel } from '../../lib/vehicle-status-labels';
import {
  useVehicleAvailabilityStatusLabels,
  useVehicleAvailabilityStatusOptions,
} from '../../lib/i18n/use-module-labels';
import { CoordinatePickerMap } from '../maps/coordinate-picker-map';

type FormValues = {
  startDatetime: string;
  endDatetime: string;
  status: VehicleAvailabilityStatus;
  latitude: string;
  longitude: string;
};

const emptyForm: FormValues = {
  startDatetime: '',
  endDatetime: '',
  status: 'available',
  latitude: '',
  longitude: '',
};

const DEFAULT_MAP_CENTER = { latitude: -4.3058, longitude: 15.3 };

type VehicleAvailabilitySectionProps = {
  vehicleId: string;
  autoOpenAdd?: boolean;
  embedded?: boolean;
  variant?: 'default' | 'page';
};

function statusBadgeVariant(
  status: VehicleAvailabilityStatus,
): 'success' | 'warning' | 'danger' | 'muted' {
  switch (status) {
    case 'available':
      return 'success';
    case 'rented':
      return 'warning';
    case 'maintenance':
      return 'danger';
    default:
      return 'muted';
  }
}

function parseCoord(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const num = Number(trimmed);
  return Number.isFinite(num) ? num : undefined;
}

function normalizeCoordInput(value: string): string {
  return value.replace(',', '.').trim();
}

function formatCoord(value: string | null | undefined, emptyDash: string): string {
  if (value == null || value === '') return emptyDash;
  const num = Number(value);
  return Number.isFinite(num) ? num.toFixed(5) : value;
}

export function VehicleAvailabilitySection({
  vehicleId,
  autoOpenAdd = false,
  embedded = false,
  variant = 'default',
}: VehicleAvailabilitySectionProps) {
  const isPageVariant = variant === 'page';
  const locale = useLocale();
  const { locations: getLocationsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.locations.sections.availability');
  const tCommon = useTranslations('modules.common');
  const tActions = useTranslations('common.actions');
  const emptyDash = tCommon('empty.dash');
  const statusLabels = useVehicleAvailabilityStatusLabels();
  const statusOptions = useVehicleAvailabilityStatusOptions();
  const sectionRef = useRef<HTMLElement>(null);
  const [filterStart, setFilterStart] = useState('');
  const [filterEnd, setFilterEnd] = useState('');
  const [slotSearch, setSlotSearch] = useState('');
  const [mapDefaultCenter, setMapDefaultCenter] = useState(DEFAULT_MAP_CENTER);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; slots: VehicleAvailability[] }
  >({ status: 'loading' });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<VehicleAvailability | null>(null);
  const [formValues, setFormValues] = useState<FormValues>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<'latitude' | 'longitude', string>>>(
    {},
  );
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<VehicleAvailability | null>(null);

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
      const result = await getApiClient().listVehicleAvailability({
        vehicleId,
        page: 1,
        limit: 100,
        ...(filterStart
          ? { startFrom: fromDatetimeLocalValue(`${filterStart}T00:00`) }
          : {}),
        ...(filterEnd ? { endTo: fromDatetimeLocalValue(`${filterEnd}T23:59`) } : {}),
      });
      setState({ status: 'ready', slots: result.data });
    } catch (error) {
      setState({ status: 'error', message: getLocationsErrorMessage(error) });
    }
  }, [vehicleId, filterStart, filterEnd, getLocationsErrorMessage]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    let cancelled = false;

    async function loadMapCenter() {
      try {
        const vehicle = await getApiClient().getVehicle(vehicleId);
        const agency = await getApiClient().getRentalAgency(vehicle.agencyId);
        if (!agency.destinationId || cancelled) return;

        const destination = await getApiClient().getDestination(agency.destinationId);
        if (cancelled || !destination.latitude || !destination.longitude) return;

        const latitude = Number(destination.latitude);
        const longitude = Number(destination.longitude);
        if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
          setMapDefaultCenter({ latitude, longitude });
        }
      } catch {
        // Keep Kinshasa default.
      }
    }

    void loadMapCenter();
    return () => {
      cancelled = true;
    };
  }, [vehicleId]);

  function openForm(slot?: VehicleAvailability) {
    if (slot) {
      setEditing(slot);
      setFormValues({
        startDatetime: toDatetimeLocalValue(slot.startDatetime),
        endDatetime: toDatetimeLocalValue(slot.endDatetime),
        status: slot.status,
        latitude: slot.latitude ?? '',
        longitude: slot.longitude ?? '',
      });
    } else {
      setEditing(null);
      setFormValues(emptyForm);
    }
    setFormError(null);
    setFieldErrors({});
    setShowForm(true);
  }

  function resetForm() {
    setFormValues(emptyForm);
    setEditing(null);
    setShowForm(false);
    setFormError(null);
    setFieldErrors({});
  }

  useEffect(() => {
    if (!autoOpenAdd) return;
    setEditing(null);
    setFormValues(emptyForm);
    setFormError(null);
    setFieldErrors({});
    setShowForm(true);
  }, [autoOpenAdd]);

  const handleDeleteRequest = useCallback((slot: VehicleAvailability) => {
    setConfirmTarget(slot);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!confirmTarget) return;
    const slot = confirmTarget;
    setConfirmTarget(null);
    setDeletingId(slot.id);
    try {
      await getApiClient().deleteVehicleAvailability(slot.id);
      await load();
    } catch (error) {
      setFormError(getLocationsErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  }, [confirmTarget, getLocationsErrorMessage, load]);

  function handleCoordinatePick(latitude: string, longitude: string) {
    setFormValues((prev) => ({ ...prev, latitude, longitude }));
    setFieldErrors((prev) => ({ ...prev, latitude: undefined, longitude: undefined }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});

    if (!formValues.startDatetime || !formValues.endDatetime) {
      setFormError(tCommon('validation.datesRequired'));
      return;
    }

    const errors: Partial<Record<'latitude' | 'longitude', string>> = {};
    const hasLat = formValues.latitude.trim() !== '';
    const hasLng = formValues.longitude.trim() !== '';
    const latitude = parseCoord(formValues.latitude);
    const longitude = parseCoord(formValues.longitude);

    if (hasLat) {
      if (latitude === undefined) {
        errors.latitude = tCommon('validation.latitudeInvalid');
      } else if (latitude < -90 || latitude > 90) {
        errors.latitude = tCommon('validation.latitudeOutOfRange');
      }
    }

    if (hasLng) {
      if (longitude === undefined) {
        errors.longitude = tCommon('validation.longitudeInvalid');
      } else if (longitude < -180 || longitude > 180) {
        errors.longitude = tCommon('validation.longitudeOutOfRange');
      }
    }

    if (hasLat !== hasLng) {
      setFormError(tCommon('validation.coordsBothRequired'));
      return;
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const body = {
        startDatetime: fromDatetimeLocalValue(formValues.startDatetime),
        endDatetime: fromDatetimeLocalValue(formValues.endDatetime),
        status: formValues.status,
        latitude: latitude ?? null,
        longitude: longitude ?? null,
      };
      if (editing) {
        await getApiClient().updateVehicleAvailability(editing.id, body);
      } else {
        await getApiClient().createVehicleAvailability({ vehicleId, ...body });
      }
      resetForm();
      await load();
    } catch (error) {
      setFormError(getLocationsErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  const columns = useMemo<ColumnDef<VehicleAvailability, unknown>[]>(
    () => [
      {
        id: 'range',
        header: tCommon('columns.period'),
        cell: ({ row }) => (
          <span className="text-sm tabular-nums text-atg-fg">
            {formatRange(row.original.startDatetime, row.original.endDatetime)}
          </span>
        ),
      },
      {
        id: 'latitude',
        header: tCommon('form.latitude'),
        cell: ({ row }) => (
          <span className="text-sm tabular-nums text-atg-muted">
            {formatCoord(row.original.latitude, emptyDash)}
          </span>
        ),
      },
      {
        id: 'longitude',
        header: tCommon('form.longitude'),
        cell: ({ row }) => (
          <span className="text-sm tabular-nums text-atg-muted">
            {formatCoord(row.original.longitude, emptyDash)}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: t('status'),
        cell: ({ row }) => (
          <DataTableBadge variant={statusBadgeVariant(row.original.status)}>
            {getVehicleStatusLabel(row.original.status, statusLabels)}
          </DataTableBadge>
        ),
      },
      {
        id: 'actions',
        header: tCommon('columns.actions'),
        meta: { align: 'right' },
        cell: ({ row }) => (
          <DataTableActions>
            <DataTableActionButton
              action="edit"
              onClick={() => openForm(row.original)}
            />
            <DataTableActionButton
              action="delete"
              onClick={() => handleDeleteRequest(row.original)}
              disabled={deletingId === row.original.id}
              loading={deletingId === row.original.id}
            />
          </DataTableActions>
        ),
      },
    ],
    [deletingId, emptyDash, formatRange, handleDeleteRequest, statusLabels, t, tCommon],
  );

  const slots = state.status === 'ready' ? state.slots : [];

  const statusCounts = useMemo(() => {
    const counts = { available: 0, rented: 0, maintenance: 0, total: slots.length };
    for (const slot of slots) {
      if (slot.status === 'available') counts.available += 1;
      else if (slot.status === 'rented') counts.rented += 1;
      else if (slot.status === 'maintenance') counts.maintenance += 1;
    }
    return counts;
  }, [slots]);

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
        slot.latitude ?? '',
        slot.longitude ?? '',
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [formatRange, slotSearch, slots, statusLabels]);

  const hasSlotSearch = slotSearch.trim().length > 0;

  const slotFormModal = (
    <Modal
      open={showForm}
      onOpenChange={(open) => {
        if (!open && !submitting) resetForm();
      }}
      title={editing ? t('editSlot') : t('newSlot')}
      description={editing ? t('editFormHint') : t('formHint')}
      showClose
      closeAriaLabel={tActions('close')}
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError ? (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {formError}
          </p>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={t('startDatetime')}
            type="datetime-local"
            value={formValues.startDatetime}
            onChange={(e) =>
              setFormValues((p) => ({ ...p, startDatetime: e.target.value }))
            }
            required
          />
          <Input
            label={t('endDatetime')}
            type="datetime-local"
            value={formValues.endDatetime}
            onChange={(e) =>
              setFormValues((p) => ({ ...p, endDatetime: e.target.value }))
            }
            required
          />
        </div>
        <Select
          label={t('status')}
          value={formValues.status}
          onChange={(e) =>
            setFormValues((p) => ({
              ...p,
              status: e.target.value as VehicleAvailabilityStatus,
            }))
          }
          options={statusOptions}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={tCommon('form.latitude')}
            type="text"
            inputMode="decimal"
            placeholder="-4.30580"
            hint={t('latitudeHint')}
            value={formValues.latitude}
            onChange={(e) =>
              setFormValues((p) => ({
                ...p,
                latitude: normalizeCoordInput(e.target.value),
              }))
            }
            error={fieldErrors.latitude}
          />
          <Input
            label={tCommon('form.longitude')}
            type="text"
            inputMode="decimal"
            placeholder="15.30000"
            hint={t('longitudeHint')}
            value={formValues.longitude}
            onChange={(e) =>
              setFormValues((p) => ({
                ...p,
                longitude: normalizeCoordInput(e.target.value),
              }))
            }
            error={fieldErrors.longitude}
          />
        </div>
        <CoordinatePickerMap
          key={editing?.id ?? 'new-vehicle-slot'}
          latitude={formValues.latitude}
          longitude={formValues.longitude}
          onCoordinateChange={handleCoordinatePick}
          defaultLatitude={mapDefaultCenter.latitude}
          defaultLongitude={mapDefaultCenter.longitude}
          defaultZoom={12}
          title={t('mapPreview')}
          hint={t('mapPickerHint')}
          ariaLabel={t('mapPickerAria')}
          active={showForm}
        />
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={resetForm} disabled={submitting}>
            {tActions('cancel')}
          </Button>
          <Button type="submit" loading={submitting}>
            {editing ? tActions('save') : tActions('create')}
          </Button>
        </div>
      </form>
    </Modal>
  );

  const filterToolbar = (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
      <div className="flex flex-wrap items-end gap-3">
        <Input
          label={t('filterFrom')}
          type="date"
          value={filterStart}
          onChange={(e) => setFilterStart(e.target.value)}
          wrapperClassName="w-full sm:w-auto sm:min-w-[160px]"
        />
        <Input
          label={t('filterTo')}
          type="date"
          value={filterEnd}
          onChange={(e) => setFilterEnd(e.target.value)}
          wrapperClassName="w-full sm:w-auto sm:min-w-[160px]"
        />
        <Button type="button" variant="outline" size="sm" onClick={() => void load()}>
          {tCommon('filters.apply')}
        </Button>
      </div>
      {!isPageVariant ? (
        <Button type="button" onClick={() => openForm()} className="w-full sm:w-auto">
          {t('addSlot')}
        </Button>
      ) : null}
    </div>
  );

  const defaultFilterToolbar = (
    <div className="flex flex-wrap items-end gap-4">
      <Input
        label={t('filterFrom')}
        type="date"
        value={filterStart}
        onChange={(e) => setFilterStart(e.target.value)}
        className="max-w-[180px]"
      />
      <Input
        label={t('filterTo')}
        type="date"
        value={filterEnd}
        onChange={(e) => setFilterEnd(e.target.value)}
        className="max-w-[180px]"
      />
      <Button type="button" variant="outline" size="sm" onClick={() => void load()}>
        {tCommon('filters.apply')}
      </Button>
    </div>
  );

  const slotsTable = state.status === 'error' ? (
    <p role="alert" className="text-sm text-red-600 dark:text-red-400">
      {state.message}
    </p>
  ) : (
    <Card variant="dashboard" padding="none" className="overflow-hidden">
      <DataTable
        columns={columns}
        data={isPageVariant ? filteredSlots : slots}
        isLoading={state.status === 'loading'}
        emptyMessage={
          isPageVariant && hasSlotSearch ? t('searchEmpty') : t('empty')
        }
        emptyVariant={isPageVariant && hasSlotSearch ? 'search' : 'default'}
        getRowId={(r) => r.id}
        aria-label={t('title')}
        loadingMessage={tCommon('dataTable.loading')}
        expandRowLabel={tCommon('dataTable.expandRow')}
        collapseRowLabel={tCommon('dataTable.collapseRow')}
        expandRowAriaLabel={tCommon('dataTable.expandRowAria')}
      />
    </Card>
  );

  const deleteDialog = (
    <AlertDialog
      open={!!confirmTarget}
      onOpenChange={(open) => { if (!open) setConfirmTarget(null); }}
      title={t('deleteTitle')}
      description={t('deleteConfirm')}
      confirmLabel={t('deleteConfirmButton')}
      cancelLabel={t('cancel')}
      variant="danger"
      loading={!!deletingId}
      onConfirm={() => void handleDeleteConfirm()}
    />
  );

  if (isPageVariant) {
    return (
      <section ref={sectionRef} id="vehicle-availability" className="space-y-6">
        {deleteDialog}
        {slotFormModal}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(
            [
              {
                key: 'total',
                label: t('stats.total'),
                value: statusCounts.total,
              },
              {
                key: 'available',
                label: statusLabels.available,
                value: statusCounts.available,
              },
              {
                key: 'rented',
                label: statusLabels.rented,
                value: statusCounts.rented,
              },
              {
                key: 'maintenance',
                label: statusLabels.maintenance,
                value: statusCounts.maintenance,
              },
            ] as const
          ).map((stat) => (
            <Card
              key={stat.key}
              variant="dashboard"
              className="border border-atg-border/80 p-3 sm:p-4"
            >
              <p className="text-[11px] font-medium uppercase tracking-wide text-atg-muted">
                {stat.label}
              </p>
              {state.status === 'loading' ? (
                <Skeleton className="mt-2 h-7 w-10" />
              ) : (
                <p className="mt-2 text-2xl font-semibold tabular-nums text-atg-fg">
                  {stat.value}
                </p>
              )}
            </Card>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-atg-fg">{t('title')}</h2>
              {state.status === 'ready' ? (
                <DataTableBadge variant="muted">
                  {hasSlotSearch
                    ? `${filteredSlots.length}/${slots.length}`
                    : slots.length}
                </DataTableBadge>
              ) : state.status === 'loading' ? (
                <Skeleton className="h-5 w-10" />
              ) : null}
            </div>
            <p className="mt-1 text-sm text-atg-muted">{t('intro')}</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => openForm()}>
            {t('addSlot')}
          </Button>
        </div>

        {filterToolbar}

        {slots.length > 0 || hasSlotSearch ? (
          <div className="max-w-md">
            <Input
              type="search"
              placeholder={t('searchPlaceholder')}
              value={slotSearch}
              onChange={(e) => setSlotSearch(e.target.value)}
              aria-label={t('searchPlaceholder')}
            />
          </div>
        ) : null}

        {slotsTable}
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      id="vehicle-availability"
      className={
        embedded ? 'space-y-6' : 'mt-12 space-y-6 border-t border-atg-border pt-10'
      }
    >
      {deleteDialog}
      {slotFormModal}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-atg-fg">{t('title')}</h2>
          <p className="mt-1 text-sm text-atg-muted">{t('intro')}</p>
        </div>
        <Button type="button" onClick={() => openForm()}>
          {t('addSlot')}
        </Button>
      </div>
      {defaultFilterToolbar}
      {slotsTable}
    </section>
  );
}

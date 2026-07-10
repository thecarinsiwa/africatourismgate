'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  Button,
  Card,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  Input,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { VehicleAvailability, VehicleAvailabilityStatus } from '@africatourismgate/types';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
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

type FormValues = {
  startDatetime: string;
  endDatetime: string;
  status: VehicleAvailabilityStatus;
};

const emptyForm: FormValues = {
  startDatetime: '',
  endDatetime: '',
  status: 'available',
};

type VehicleAvailabilitySectionProps = {
  vehicleId: string;
  autoOpenAdd?: boolean;
  embedded?: boolean;
};

export function VehicleAvailabilitySection({
  vehicleId,
  autoOpenAdd = false,
  embedded = false,
}: VehicleAvailabilitySectionProps) {
  const locale = useLocale();
  const { locations: getLocationsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.locations.sections.availability');
  const tCommon = useTranslations('modules.common');
  const tActions = useTranslations('common.actions');
  const statusLabels = useVehicleAvailabilityStatusLabels();
  const statusOptions = useVehicleAvailabilityStatusOptions();
  const statusId = useId();
  const sectionRef = useRef<HTMLElement>(null);
  const [filterStart, setFilterStart] = useState('');
  const [filterEnd, setFilterEnd] = useState('');
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; slots: VehicleAvailability[] }
  >({ status: 'loading' });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<VehicleAvailability | null>(null);
  const [formValues, setFormValues] = useState<FormValues>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
    if (!autoOpenAdd) return;
    setEditing(null);
    setFormValues(emptyForm);
    setFormError(null);
    setShowForm(true);
    sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [autoOpenAdd]);

  function resetForm() {
    setFormValues(emptyForm);
    setEditing(null);
    setShowForm(false);
    setFormError(null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (!formValues.startDatetime || !formValues.endDatetime) {
      setFormError(tCommon('validation.datesRequired'));
      return;
    }
    setSubmitting(true);
    try {
      const body = {
        startDatetime: fromDatetimeLocalValue(formValues.startDatetime),
        endDatetime: fromDatetimeLocalValue(formValues.endDatetime),
        status: formValues.status,
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
          <span className="text-sm">
            {formatRange(row.original.startDatetime, row.original.endDatetime)}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: t('status'),
        cell: ({ row }) => getVehicleStatusLabel(row.original.status, statusLabels),
      },
      {
        id: 'actions',
        header: tCommon('columns.actions'),
        meta: { align: 'right' },
        cell: ({ row }) => (
          <DataTableActions>
            <DataTableActionButton
              action="edit"
              onClick={() => {
                setEditing(row.original);
                setFormValues({
                  startDatetime: toDatetimeLocalValue(row.original.startDatetime),
                  endDatetime: toDatetimeLocalValue(row.original.endDatetime),
                  status: row.original.status,
                });
                setShowForm(true);
              }}
            />
            <DataTableActionButton
              action="delete"
              onClick={async () => {
                if (!window.confirm(t('deleteConfirm'))) return;
                setDeletingId(row.original.id);
                try {
                  await getApiClient().deleteVehicleAvailability(row.original.id);
                  await load();
                } catch (error) {
                  setFormError(getLocationsErrorMessage(error));
                } finally {
                  setDeletingId(null);
                }
              }}
              disabled={deletingId === row.original.id}
              loading={deletingId === row.original.id}
            />
          </DataTableActions>
        ),
      },
    ],
    [deletingId, formatRange, load, statusLabels, t, tCommon, getLocationsErrorMessage],
  );

  const slots = state.status === 'ready' ? state.slots : [];
  const selectClass =
    'w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg';

  return (
    <section
      ref={sectionRef}
      id="vehicle-availability"
      className={
        embedded ? 'space-y-6' : 'mt-12 space-y-6 border-t border-atg-border pt-10'
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-atg-fg">{t('title')}</h2>
          <p className="mt-1 text-sm text-atg-muted">{t('intro')}</p>
        </div>
        {!showForm ? (
          <Button type="button" onClick={() => setShowForm(true)}>
            {t('addSlot')}
          </Button>
        ) : null}
      </div>

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

      {showForm ? (
        <Card variant="dashboard" className="max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-sm font-medium">
              {editing ? t('editSlot') : t('newSlot')}
            </h3>
            {formError ? (
              <p role="alert" className="text-sm text-red-600">
                {formError}
              </p>
            ) : null}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  {tCommon('columns.start')}
                </label>
                <input
                  type="datetime-local"
                  className={selectClass}
                  value={formValues.startDatetime}
                  onChange={(e) =>
                    setFormValues((p) => ({ ...p, startDatetime: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  {tCommon('columns.end')}
                </label>
                <input
                  type="datetime-local"
                  className={selectClass}
                  value={formValues.endDatetime}
                  onChange={(e) =>
                    setFormValues((p) => ({ ...p, endDatetime: e.target.value }))
                  }
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor={statusId} className="mb-2 block text-sm font-medium">
                {t('status')}
              </label>
              <select
                id={statusId}
                className={selectClass}
                value={formValues.status}
                onChange={(e) =>
                  setFormValues((p) => ({
                    ...p,
                    status: e.target.value as VehicleAvailabilityStatus,
                  }))
                }
              >
                {statusOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <Button type="submit" loading={submitting}>
                {editing ? tActions('save') : tActions('create')}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                {tActions('cancel')}
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      {state.status === 'error' ? (
        <p role="alert" className="text-sm text-red-600">
          {state.message}
        </p>
      ) : (
        <Card variant="dashboard" padding="none">
          <DataTable
            columns={columns}
            data={slots}
            isLoading={state.status === 'loading'}
            emptyMessage={t('empty')}
            getRowId={(r) => r.id}
          />
        </Card>
      )}
    </section>
  );
}

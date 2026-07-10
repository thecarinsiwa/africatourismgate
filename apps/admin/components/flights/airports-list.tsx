'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  Button,
  Card,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  DataTablePagination,
  Input,
  Modal,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { Airport } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ReferentialListToolbar } from '../referential-list-toolbar';
import { getApiClient } from '../../lib/auth/api';
import { parseDestinationCoord } from '../../lib/destination-coords';
import { CountryFlagPlaceholder } from './country-flag-placeholder';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

type FormValues = {
  iataCode: string;
  name: string;
  city: string;
  countryCode: string;
  latitude: string;
  longitude: string;
};

const emptyForm: FormValues = {
  iataCode: '',
  name: '',
  city: '',
  countryCode: 'CD',
  latitude: '',
  longitude: '',
};

function formatCoordInput(value: string | null | undefined): string {
  if (value === null || value === undefined || value === '') {
    return '';
  }
  const num = Number(value);
  return Number.isFinite(num) ? String(num) : '';
}

export function AirportsList() {
  const { vols: getVolsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.flights.referential.airports');
  const tCommon = useTranslations('modules.common');
  const tPagination = useTranslations('modules.common.pagination');
  const tActions = useTranslations('common.actions');
  const tValidation = useTranslations('modules.common.validation');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; airports: Airport[]; total: number; totalPages: number }
  >({ status: 'loading' });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Airport | null>(null);
  const [formValues, setFormValues] = useState<FormValues>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listAirports({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
      });
      setState({
        status: 'ready',
        airports: result.data,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      setState({ status: 'error', message: getVolsErrorMessage(error) });
    }
  }, [page, search, getVolsErrorMessage]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const q = searchInput.trim();
    const timer = window.setTimeout(() => {
      setSearch((prev) => {
        if (prev !== q) setPage(1);
        return q;
      });
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  function openForm(airport?: Airport) {
    if (airport) {
      setEditing(airport);
      setFormValues({
        iataCode: airport.iataCode,
        name: airport.name,
        city: airport.city,
        countryCode: airport.countryCode,
        latitude: formatCoordInput(airport.latitude),
        longitude: formatCoordInput(airport.longitude),
      });
    } else {
      setEditing(null);
      setFormValues(emptyForm);
    }
    setFormError(null);
    setShowForm(true);
  }

  function resetForm() {
    setFormValues(emptyForm);
    setEditing(null);
    setShowForm(false);
    setFormError(null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (
      formValues.iataCode.trim().length !== 3 ||
      !formValues.name.trim() ||
      !formValues.city.trim() ||
      formValues.countryCode.trim().length !== 2
    ) {
      setFormError(t('validation.required'));
      return;
    }

    const hasLat = formValues.latitude.trim().length > 0;
    const hasLng = formValues.longitude.trim().length > 0;
    if (hasLat !== hasLng) {
      setFormError(tValidation('coordsBothRequired'));
      return;
    }
    if (hasLat && hasLng) {
      const lat = parseDestinationCoord(formValues.latitude);
      const lng = parseDestinationCoord(formValues.longitude);
      if (lat === null || lat < -90 || lat > 90) {
        setFormError(tValidation('latitudeInvalid'));
        return;
      }
      if (lng === null || lng < -180 || lng > 180) {
        setFormError(tValidation('longitudeInvalid'));
        return;
      }
    }

    setSubmitting(true);
    try {
      const body = {
        iataCode: formValues.iataCode.trim().toUpperCase(),
        name: formValues.name.trim(),
        city: formValues.city.trim(),
        countryCode: formValues.countryCode.trim().toUpperCase(),
        ...(hasLat && hasLng
          ? {
              latitude: Number(formValues.latitude.trim()),
              longitude: Number(formValues.longitude.trim()),
            }
          : editing
            ? { latitude: null, longitude: null }
            : {}),
      };
      if (editing) {
        await getApiClient().updateAirport(editing.id, body);
      } else {
        await getApiClient().createAirport(body);
      }
      resetForm();
      await load();
    } catch (error) {
      setFormError(getVolsErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  const columns = useMemo<ColumnDef<Airport, unknown>[]>(
    () => [
      {
        id: 'flag',
        header: '',
        meta: { align: 'center' },
        cell: ({ row }) => (
          <CountryFlagPlaceholder countryCode={row.original.countryCode} />
        ),
      },
      {
        accessorKey: 'iataCode',
        header: tCommon('columns.iata'),
        cell: ({ row }) => (
          <code className="font-mono text-sm">{row.original.iataCode}</code>
        ),
      },
      { accessorKey: 'name', header: t('airport') },
      { accessorKey: 'city', header: tCommon('columns.city') },
      {
        accessorKey: 'countryCode',
        header: tCommon('columns.country'),
        meta: { align: 'center' },
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
              onClick={async () => {
                if (!window.confirm(t('deleteConfirm', { name: row.original.name }))) return;
                setDeletingId(row.original.id);
                try {
                  await getApiClient().deleteAirport(row.original.id);
                  await load();
                } catch (error) {
                  setFormError(getVolsErrorMessage(error));
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
    [deletingId, load, t, tCommon, getVolsErrorMessage],
  );

  const airports = state.status === 'ready' ? state.airports : [];
  const emptyMessage = search.trim().length > 0 ? t('emptySearch') : t('emptyDefault');

  return (
    <div className="space-y-6">
      <ReferentialListToolbar
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        placeholder={t('searchPlaceholder')}
        ariaLabel={t('searchAria')}
        action={
          <Button type="button" onClick={() => openForm()}>
            {t('new')}
          </Button>
        }
      />

      <Modal
        open={showForm}
        onOpenChange={(open) => {
          if (!open && !submitting) resetForm();
        }}
        title={editing ? t('edit') : t('new')}
        showClose
        className="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError ? (
            <p role="alert" className="text-sm text-red-600">
              {formError}
            </p>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={tCommon('columns.iata')}
              maxLength={3}
              value={formValues.iataCode}
              onChange={(e) =>
                setFormValues((p) => ({ ...p, iataCode: e.target.value.toUpperCase() }))
              }
            />
            <Input
              label={t('countryCode')}
              maxLength={2}
              value={formValues.countryCode}
              onChange={(e) =>
                setFormValues((p) => ({
                  ...p,
                  countryCode: e.target.value.toUpperCase(),
                }))
              }
            />
          </div>
          <Input
            label={tCommon('columns.name')}
            value={formValues.name}
            onChange={(e) => setFormValues((p) => ({ ...p, name: e.target.value }))}
          />
          <Input
            label={tCommon('columns.city')}
            value={formValues.city}
            onChange={(e) => setFormValues((p) => ({ ...p, city: e.target.value }))}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={tCommon('form.latitude')}
              type="number"
              step="any"
              inputMode="decimal"
              hint={t('latitudeHint')}
              value={formValues.latitude}
              onChange={(e) => setFormValues((p) => ({ ...p, latitude: e.target.value }))}
            />
            <Input
              label={tCommon('form.longitude')}
              type="number"
              step="any"
              inputMode="decimal"
              hint={t('longitudeHint')}
              value={formValues.longitude}
              onChange={(e) => setFormValues((p) => ({ ...p, longitude: e.target.value }))}
            />
          </div>
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

      {state.status === 'error' ? (
        <p role="alert" className="text-sm text-red-600">
          {state.message}
        </p>
      ) : (
        <>
          <Card variant="dashboard" padding="none">
            <DataTable
              columns={columns}
              data={airports}
              isLoading={state.status === 'loading'}
              emptyMessage={emptyMessage}
              emptyVariant={search.trim().length > 0 ? 'search' : 'default'}
              getRowId={(r) => r.id}
            />
          </Card>
          {state.status === 'ready' ? (
            <DataTablePagination
              page={page}
              pageSize={PAGE_SIZE}
              totalPages={state.totalPages}
              totalItems={state.total}
              itemLabel={tPagination('airport')}
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}
    </div>
  );
}

'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  AlertDialog,
  Button,
  Card,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  DataTablePagination,
  Input,
  Modal,
  useToast,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { Airport } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { parseDestinationCoord } from '../../lib/destination-coords';
import { useDataTablePaginationLabels } from '../../lib/i18n/use-pagination-labels';
import { ListViewModeToggle } from '../list-view-mode-toggle';
import { CoordinatePickerMap } from '../maps/coordinate-picker-map';
import { AirportsStatCards } from './airports-stat-cards';
import { CountryFlagPlaceholder } from './country-flag-placeholder';

const PAGE_SIZE = 10;
const DEFAULT_MAP_CENTER = { latitude: -4.3058, longitude: 15.3 };
const DEFAULT_MAP_ZOOM = 5;
const SEARCH_DEBOUNCE_MS = 300;

type FormValues = {
  iataCode: string;
  name: string;
  city: string;
  countryCode: string;
  latitude: string;
  longitude: string;
};

type AirportsViewMode = 'grid' | 'table';

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

function normalizeCoordInput(value: string): string {
  return value.replace(',', '.').trim();
}

export function AirportsList() {
  const { vols: getVolsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.flights.referential.airports');
  const tCommon = useTranslations('modules.common');
  const tPagination = useTranslations('modules.common.pagination');
  const tActions = useTranslations('common.actions');
  const tValidation = useTranslations('modules.common.validation');
  const tToast = useTranslations('modules.common.toast');
  const tDataTable = useTranslations('modules.common.dataTable');
  const { toast } = useToast();
  const paginationLabels = useDataTablePaginationLabels();

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<AirportsViewMode>('grid');
  const [statsKey, setStatsKey] = useState(0);
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
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<Airport | null>(null);

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

  const viewModeOptions = useMemo(
    () => [
      { value: 'grid' as const, label: t('viewGrid') },
      { value: 'table' as const, label: t('viewTable') },
    ],
    [t],
  );

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

  function handleCoordinatePick(latitude: string, longitude: string) {
    setFormValues((prev) => ({ ...prev, latitude, longitude }));
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
        toast({
          variant: 'success',
          title: tToast('saved'),
          message: body.name,
        });
      } else {
        await getApiClient().createAirport(body);
        toast({
          variant: 'success',
          title: tToast('created'),
          message: body.name,
        });
      }
      resetForm();
      setStatsKey((k) => k + 1);
      await load();
    } catch (error) {
      setFormError(getVolsErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  const handleDeleteRequest = useCallback((airport: Airport) => {
    setConfirmTarget(airport);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!confirmTarget) return;
    const airport = confirmTarget;
    setConfirmTarget(null);
    setDeleteError(null);
    setDeletingId(airport.id);
    try {
      await getApiClient().deleteAirport(airport.id);
      toast({
        variant: 'success',
        title: tToast('deleted'),
        message: airport.name,
      });
      setStatsKey((k) => k + 1);
      await load();
    } catch (error) {
      const message = getVolsErrorMessage(error);
      setDeleteError(message);
      toast({ variant: 'error', title: tToast('deleteError'), message });
    } finally {
      setDeletingId(null);
    }
  }, [confirmTarget, getVolsErrorMessage, load, tToast, toast]);

  const renderActions = useCallback(
    (airport: Airport) => (
      <DataTableActions>
        <DataTableActionButton action="edit" onClick={() => openForm(airport)} />
        <DataTableActionButton
          action="delete"
          onClick={() => handleDeleteRequest(airport)}
          disabled={deletingId === airport.id}
          loading={deletingId === airport.id}
        />
      </DataTableActions>
    ),
    [deletingId, handleDeleteRequest],
  );

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
        cell: ({ row }) => renderActions(row.original),
      },
    ],
    [renderActions, t, tCommon],
  );

  const airports = state.status === 'ready' ? state.airports : [];
  const emptyMessage = search.trim().length > 0 ? t('emptySearch') : t('emptyDefault');

  return (
    <>
      <AlertDialog
        open={!!confirmTarget}
        onOpenChange={(open) => {
          if (!open) setConfirmTarget(null);
        }}
        title={t('deleteTitle')}
        description={
          confirmTarget ? t('deleteConfirm', { name: confirmTarget.name }) : ''
        }
        confirmLabel={t('deleteConfirmButton')}
        cancelLabel={t('cancel')}
        variant="danger"
        loading={!!deletingId}
        error={deleteError}
        onConfirm={() => void handleDeleteConfirm()}
      />

      <div className="space-y-6">
        <AirportsStatCards refreshKey={statsKey} />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1 sm:max-w-md">
              <Input
                type="search"
                placeholder={t('searchPlaceholder')}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                aria-label={t('searchAria')}
              />
            </div>
            <ListViewModeToggle
              value={viewMode}
              options={viewModeOptions}
              onChange={setViewMode}
              ariaLabel={t('viewModeAria')}
            />
          </div>
          <Button type="button" onClick={() => openForm()}>
            {t('new')}
          </Button>
        </div>

        <Modal
          open={showForm}
          onOpenChange={(open) => {
            if (!open && !submitting) resetForm();
          }}
          title={editing ? t('edit') : t('new')}
          showClose={!submitting}
          closeAriaLabel={tActions('close')}
          className="max-h-[min(90vh,52rem)] max-w-2xl overflow-y-auto"
        >
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            {formError ? (
              <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                {formError}
              </p>
            ) : null}

            <div className="flex items-center gap-3 rounded-xl border border-atg-border bg-atg-surface/50 px-4 py-3">
              <CountryFlagPlaceholder
                countryCode={formValues.countryCode || '??'}
                className="h-12 w-12"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-atg-fg">
                  {formValues.name.trim() || t('airport')}
                </p>
                <p className="mt-0.5 text-xs text-atg-muted">
                  <code className="font-mono">
                    {formValues.iataCode.trim() || '---'}
                  </code>
                  {formValues.city.trim() ? ` · ${formValues.city.trim()}` : ''}
                  {formValues.countryCode.trim()
                    ? ` · ${formValues.countryCode.trim().toUpperCase()}`
                    : ''}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label={tCommon('columns.iata')}
                maxLength={3}
                value={formValues.iataCode}
                onChange={(e) =>
                  setFormValues((p) => ({
                    ...p,
                    iataCode: e.target.value.toUpperCase(),
                  }))
                }
                disabled={submitting}
                required
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
                disabled={submitting}
                required
              />
            </div>
            <Input
              label={tCommon('columns.name')}
              value={formValues.name}
              onChange={(e) =>
                setFormValues((p) => ({ ...p, name: e.target.value }))
              }
              disabled={submitting}
              required
            />
            <Input
              label={tCommon('columns.city')}
              value={formValues.city}
              onChange={(e) =>
                setFormValues((p) => ({ ...p, city: e.target.value }))
              }
              disabled={submitting}
              required
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label={tCommon('form.latitude')}
                type="text"
                inputMode="decimal"
                placeholder="-4.3858"
                hint={t('latitudeHint')}
                value={formValues.latitude}
                onChange={(e) =>
                  setFormValues((p) => ({
                    ...p,
                    latitude: normalizeCoordInput(e.target.value),
                  }))
                }
                disabled={submitting}
              />
              <Input
                label={tCommon('form.longitude')}
                type="text"
                inputMode="decimal"
                placeholder="15.4446"
                hint={t('longitudeHint')}
                value={formValues.longitude}
                onChange={(e) =>
                  setFormValues((p) => ({
                    ...p,
                    longitude: normalizeCoordInput(e.target.value),
                  }))
                }
                disabled={submitting}
              />
            </div>
            <CoordinatePickerMap
              key={editing?.id ?? 'new-airport'}
              latitude={formValues.latitude}
              longitude={formValues.longitude}
              onCoordinateChange={handleCoordinatePick}
              defaultLatitude={DEFAULT_MAP_CENTER.latitude}
              defaultLongitude={DEFAULT_MAP_CENTER.longitude}
              defaultZoom={DEFAULT_MAP_ZOOM}
              title={t('mapPreview')}
              hint={t('mapPickerHint')}
              ariaLabel={t('mapPickerAria')}
              active={showForm}
              className="pt-1"
            />
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                disabled={submitting}
              >
                {tActions('cancel')}
              </Button>
              <Button type="submit" loading={submitting}>
                {editing ? tActions('save') : tActions('create')}
              </Button>
            </div>
          </form>
        </Modal>

        {state.status === 'error' ? (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {state.message}
          </p>
        ) : viewMode === 'table' ? (
          <>
            <Card variant="dashboard" padding="none" className="overflow-hidden">
              <DataTable
                columns={columns}
                data={airports}
                isLoading={state.status === 'loading'}
                loadingMessage={tDataTable('loading')}
                emptyMessage={emptyMessage}
                emptyVariant={search.trim().length > 0 ? 'search' : 'default'}
                getRowId={(r) => r.id}
                aria-label={t('ariaLabel')}
              />
            </Card>
            {state.status === 'ready' ? (
              <DataTablePagination
                page={page}
                pageSize={PAGE_SIZE}
                totalPages={state.totalPages}
                totalItems={state.total}
                itemLabel={tPagination('airport')}
                labels={paginationLabels}
                onPageChange={setPage}
              />
            ) : null}
          </>
        ) : state.status === 'loading' ? (
          <p className="text-sm text-atg-muted">{tCommon('loading')}</p>
        ) : airports.length === 0 ? (
          <p className="text-sm text-atg-muted">{emptyMessage}</p>
        ) : (
          <>
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {airports.map((airport) => (
                <li key={airport.id}>
                  <Card variant="dashboard" className="flex h-full flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <CountryFlagPlaceholder
                        countryCode={airport.countryCode}
                        className="h-12 w-12"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-atg-fg">
                          {airport.name}
                        </p>
                        <code className="mt-0.5 inline-block rounded-md bg-atg-surface px-2 py-0.5 font-mono text-xs text-atg-muted">
                          {airport.iataCode}
                        </code>
                        <p className="mt-1 truncate text-xs text-atg-muted">
                          {airport.city} · {airport.countryCode}
                        </p>
                      </div>
                    </div>
                    <div className="mt-auto flex justify-end border-t border-atg-border pt-3">
                      {renderActions(airport)}
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
            {state.status === 'ready' ? (
              <DataTablePagination
                page={page}
                pageSize={PAGE_SIZE}
                totalPages={state.totalPages}
                totalItems={state.total}
                itemLabel={tPagination('airport')}
                labels={paginationLabels}
                onPageChange={setPage}
              />
            ) : null}
          </>
        )}
      </div>
    </>
  );
}

'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  AlertDialog,
  Button,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  DataTablePagination,
  Input,
  Modal,
  Select,
  useToast,
  type ColumnDef,
} from '@africatourismgate/ui';
import type {
  Vehicle,
  VehicleCategory,
  VehicleRoute,
} from '@africatourismgate/types';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { useDataTablePaginationLabels } from '../../lib/i18n/use-pagination-labels';
import { FALLBACK_TREASURY_CURRENCY } from '../../lib/treasury/currency-options';
import { useActiveCurrencies } from '../../lib/treasury/use-active-currencies';
import { useFormatMoney } from '../../lib/use-format-money';

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

function vehicleDesignation(
  vehicle: Vehicle | undefined,
  categoryById: Map<string, VehicleCategory>,
  fallback: string,
): string {
  if (!vehicle) return fallback;
  const category = categoryById.get(vehicle.categoryId);
  return (
    category?.exampleModel?.trim() ||
    category?.name?.trim() ||
    vehicle.licensePlate?.trim() ||
    fallback
  );
}

type FormValues = {
  vehicleId: string;
  departureCity: string;
  arrivalCity: string;
  priceCents: string;
  currency: string;
};

const emptyForm: FormValues = {
  vehicleId: '',
  departureCity: '',
  arrivalCity: '',
  priceCents: '',
  currency: FALLBACK_TREASURY_CURRENCY,
};

export function VehicleRoutesList() {
  const { locations: getLocationsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.locations.referential.routes');
  const tRoutes = useTranslations('modules.locations.sections.routes');
  const tCommon = useTranslations('modules.common');
  const tPagination = useTranslations('modules.common.pagination');
  const tActions = useTranslations('common.actions');
  const tLoading = useTranslations('common.loading');
  const tSelect = useTranslations('modules.common.select');
  const tToast = useTranslations('modules.common.toast');
  const tDataTable = useTranslations('modules.common.dataTable');
  const { toast } = useToast();
  const paginationLabels = useDataTablePaginationLabels();
  const formatPrice = useFormatMoney();
  const emptyDash = tCommon('empty.dash');
  const chooseDash = tSelect('chooseDash');

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [categories, setCategories] = useState<VehicleCategory[]>([]);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; routes: VehicleRoute[]; total: number; totalPages: number }
  >({ status: 'loading' });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<VehicleRoute | null>(null);
  const [formValues, setFormValues] = useState<FormValues>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof FormValues, string>>
  >({});
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<VehicleRoute | null>(null);

  const { options: currencyOptions } = useActiveCurrencies({
    extraCodes: [formValues.currency],
  });

  const vehicleById = useMemo(
    () => new Map(vehicles.map((v) => [v.id, v])),
    [vehicles],
  );

  const categoryById = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories],
  );

  const vehicleOptions = useMemo(
    () => [
      { value: '', label: t('allVehicles') },
      ...vehicles.map((v) => ({
        value: v.id,
        label: vehicleDesignation(
          v,
          categoryById,
          t('vehicleFallback', { id: v.id.slice(0, 8) }),
        ),
      })),
    ],
    [vehicles, categoryById, t],
  );

  const formVehicleOptions = useMemo(
    () => [
      { value: '', label: chooseDash },
      ...vehicles.map((v) => {
        const designation = vehicleDesignation(
          v,
          categoryById,
          t('vehicleFallback', { id: v.id.slice(0, 8) }),
        );
        const plate = v.licensePlate?.trim();
        return {
          value: v.id,
          label:
            plate && plate !== designation ? `${designation} · ${plate}` : designation,
        };
      }),
    ],
    [vehicles, categoryById, t, chooseDash],
  );

  useEffect(() => {
    void Promise.all([
      getApiClient().listVehicles({ page: 1, limit: 100 }),
      getApiClient().listVehicleCategories({ page: 1, limit: 100 }),
    ])
      .then(([vehiclesResult, categoriesResult]) => {
        setVehicles(vehiclesResult.data);
        setCategories(categoriesResult.data);
      })
      .catch(() => {
        setVehicles([]);
        setCategories([]);
      });
  }, []);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listVehicleRoutes({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        vehicleId: vehicleFilter || undefined,
      });
      setState({
        status: 'ready',
        routes: result.data,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      setState({ status: 'error', message: getLocationsErrorMessage(error) });
    }
  }, [page, search, vehicleFilter, getLocationsErrorMessage]);

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

  function vehicleLabel(vehicleId: string): string {
    return vehicleDesignation(
      vehicleById.get(vehicleId),
      categoryById,
      t('vehicleFallback', { id: vehicleId.slice(0, 8) }),
    );
  }

  function vehiclePlate(vehicleId: string): string | null {
    return vehicleById.get(vehicleId)?.licensePlate?.trim() || null;
  }

  function routeLabel(route: VehicleRoute): string {
    return `${route.departureCity} → ${route.arrivalCity}`;
  }

  function resetForm() {
    setFormValues(emptyForm);
    setEditing(null);
    setShowForm(false);
    setFormError(null);
    setFieldErrors({});
  }

  function openCreate() {
    setEditing(null);
    setFormValues({
      ...emptyForm,
      vehicleId: vehicleFilter,
      currency: FALLBACK_TREASURY_CURRENCY,
    });
    setShowForm(true);
    setFormError(null);
    setFieldErrors({});
  }

  function openEdit(route: VehicleRoute) {
    setEditing(route);
    setFormValues({
      vehicleId: route.vehicleId,
      departureCity: route.departureCity,
      arrivalCity: route.arrivalCity,
      priceCents: String(route.priceCents),
      currency: route.currency,
    });
    setShowForm(true);
    setFormError(null);
    setFieldErrors({});
  }

  function validate(): boolean {
    const errors: Partial<Record<keyof FormValues, string>> = {};
    if (!editing && !formValues.vehicleId) {
      errors.vehicleId = t('validation.vehicleRequired');
    }
    if (!formValues.departureCity.trim()) {
      errors.departureCity = tRoutes('validation.departureRequired');
    }
    if (!formValues.arrivalCity.trim()) {
      errors.arrivalCity = tRoutes('validation.arrivalRequired');
    }
    if (
      formValues.departureCity.trim() &&
      formValues.arrivalCity.trim() &&
      formValues.departureCity.trim().toLowerCase() ===
        formValues.arrivalCity.trim().toLowerCase()
    ) {
      errors.arrivalCity = tRoutes('validation.sameDestination');
    }
    const cents = Number(formValues.priceCents);
    if (!Number.isFinite(cents) || cents < 0) {
      errors.priceCents = tCommon('validation.invalidPriceCents');
    }
    if (formValues.currency.trim().length !== 3) {
      errors.currency = tCommon('validation.currencyThreeLettersExample');
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const client = getApiClient();
      const priceCents = Number(formValues.priceCents);
      const currency = formValues.currency.trim().toUpperCase();
      const departureCity = formValues.departureCity.trim();
      const arrivalCity = formValues.arrivalCity.trim();
      if (editing) {
        await client.updateVehicleRoute(editing.id, {
          departureCity,
          arrivalCity,
          priceCents,
          currency,
        });
        toast({
          variant: 'success',
          title: tToast('saved'),
          message: `${departureCity} → ${arrivalCity}`,
        });
      } else {
        await client.createVehicleRoute({
          vehicleId: formValues.vehicleId,
          departureCity,
          arrivalCity,
          priceCents,
          currency,
        });
        toast({
          variant: 'success',
          title: tToast('created'),
          message: `${departureCity} → ${arrivalCity}`,
        });
      }
      resetForm();
      await load();
    } catch (error) {
      setFormError(getLocationsErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!confirmTarget) return;
    setDeletingId(confirmTarget.id);
    try {
      await getApiClient().deleteVehicleRoute(confirmTarget.id);
      toast({
        variant: 'success',
        title: tToast('deleted'),
        message: routeLabel(confirmTarget),
      });
      setConfirmTarget(null);
      await load();
    } catch (error) {
      toast({
        variant: 'error',
        title: tToast('deleteError'),
        message: getLocationsErrorMessage(error),
      });
      setConfirmTarget(null);
    } finally {
      setDeletingId(null);
    }
  }

  const columns = useMemo<ColumnDef<VehicleRoute>[]>(
    () => [
      {
        id: 'vehicle',
        header: t('columns.vehicle'),
        cell: ({ row }) => {
          const designation = vehicleLabel(row.original.vehicleId);
          const plate = vehiclePlate(row.original.vehicleId);
          return (
            <Link
              href={`/produits/locations/${row.original.vehicleId}?tab=troncons`}
              className="block min-w-0"
            >
              <span className="block text-sm font-medium text-primary hover:underline">
                {designation}
              </span>
              {plate && plate !== designation ? (
                <span className="mt-0.5 block text-xs text-atg-muted">
                  {plate}
                </span>
              ) : null}
            </Link>
          );
        },
      },
      {
        id: 'route',
        header: tRoutes('columns.route'),
        cell: ({ row }) => (
          <span className="text-sm font-medium text-atg-fg">
            {routeLabel(row.original)}
          </span>
        ),
      },
      {
        id: 'price',
        header: tRoutes('columns.price'),
        meta: { align: 'right' },
        cell: ({ row }) => (
          <span className="tabular-nums text-sm">
            {formatPrice(row.original.priceCents, row.original.currency)}
          </span>
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
              onClick={() => openEdit(row.original)}
            />
            <DataTableActionButton
              action="delete"
              disabled={deletingId === row.original.id}
              loading={deletingId === row.original.id}
              onClick={() => setConfirmTarget(row.original)}
            />
          </DataTableActions>
        ),
      },
    ],
    [categoryById, deletingId, formatPrice, t, tCommon, tRoutes, vehicleById],
  );

  const routes = state.status === 'ready' ? state.routes : [];
  const total = state.status === 'ready' ? state.total : 0;
  const totalPages = state.status === 'ready' ? state.totalPages : 1;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-wrap gap-3">
          <div className="min-w-[12rem] flex-1 sm:max-w-xs">
            <Input
              label={t('searchLabel')}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t('searchPlaceholder')}
              aria-label={t('searchAria')}
            />
          </div>
          <div className="min-w-[12rem] sm:max-w-xs">
            <Select
              label={t('columns.vehicle')}
              value={vehicleFilter}
              options={vehicleOptions}
              onChange={(e) => {
                setVehicleFilter(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
        <Button type="button" onClick={openCreate}>
          {tRoutes('addRoute')}
        </Button>
      </div>

      {state.status === 'error' ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
      ) : null}

      <DataTable
        columns={columns}
        data={routes}
        isLoading={state.status === 'loading'}
        loadingMessage={tDataTable('loading')}
        emptyMessage={search || vehicleFilter ? t('emptySearch') : t('emptyDefault')}
        getRowId={(row) => row.id}
        aria-label={t('ariaLabel')}
      />

      {state.status === 'ready' && totalPages > 1 ? (
        <DataTablePagination
          page={page}
          totalPages={totalPages}
          totalItems={total}
          pageSize={PAGE_SIZE}
          itemLabel={tPagination('route')}
          onPageChange={setPage}
          labels={paginationLabels}
        />
      ) : null}

      <Modal
        open={showForm}
        onOpenChange={(open) => {
          if (!open) resetForm();
        }}
        title={editing ? tRoutes('editRoute') : tRoutes('newRoute')}
        showClose
        closeAriaLabel={tActions('close')}
        className="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-xs text-atg-muted">
            {editing ? tRoutes('editFormHint') : t('formHint')}
          </p>
          {formError ? (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {formError}
            </p>
          ) : null}
          {!editing ? (
            <Select
              label={t('columns.vehicle')}
              value={formValues.vehicleId}
              options={formVehicleOptions}
              onChange={(e) =>
                setFormValues((prev) => ({ ...prev, vehicleId: e.target.value }))
              }
              error={fieldErrors.vehicleId}
              required
            />
          ) : (
            <p className="text-sm text-atg-muted">
              {t('columns.vehicle')}:{' '}
              <span className="font-medium text-atg-fg">
                {vehicleLabel(formValues.vehicleId)}
              </span>
            </p>
          )}
          <Input
            label={tRoutes('departure')}
            name="departureCity"
            value={formValues.departureCity}
            onChange={(e) =>
              setFormValues((prev) => ({ ...prev, departureCity: e.target.value }))
            }
            error={fieldErrors.departureCity}
            required
          />
          <Input
            label={tRoutes('arrival')}
            name="arrivalCity"
            value={formValues.arrivalCity}
            onChange={(e) =>
              setFormValues((prev) => ({ ...prev, arrivalCity: e.target.value }))
            }
            error={fieldErrors.arrivalCity}
            required
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={tRoutes('priceCents')}
              type="number"
              min={0}
              value={formValues.priceCents}
              onChange={(e) =>
                setFormValues((prev) => ({ ...prev, priceCents: e.target.value }))
              }
              error={fieldErrors.priceCents}
              required
            />
            <Select
              label={tCommon('form.currency')}
              value={formValues.currency}
              options={currencyOptions}
              onChange={(e) =>
                setFormValues((prev) => ({ ...prev, currency: e.target.value }))
              }
              error={fieldErrors.currency}
            />
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button type="submit" loading={submitting} loadingText={tLoading('submit')}>
              {editing ? tActions('save') : tRoutes('addRoute')}
            </Button>
            <Button type="button" variant="outline" onClick={resetForm} disabled={submitting}>
              {tActions('cancel')}
            </Button>
          </div>
        </form>
      </Modal>

      <AlertDialog
        open={Boolean(confirmTarget)}
        onOpenChange={(open) => {
          if (!open) setConfirmTarget(null);
        }}
        title={tRoutes('deleteTitle')}
        description={
          confirmTarget
            ? tRoutes('deleteConfirm', { label: routeLabel(confirmTarget) })
            : emptyDash
        }
        confirmLabel={tActions('delete')}
        cancelLabel={tActions('cancel')}
        variant="danger"
        loading={Boolean(deletingId)}
        onConfirm={() => {
          void handleDelete();
        }}
      />
    </div>
  );
}

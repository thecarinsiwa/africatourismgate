'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  AlertDialog,
  Button,
  Card,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  Input,
  Modal,
  SearchableSelect,
  Select,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { Destination, VehicleRoute } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { FALLBACK_TREASURY_CURRENCY } from '../../lib/treasury/currency-options';
import { useActiveCurrencies } from '../../lib/treasury/use-active-currencies';
import { useFormatMoney } from '../../lib/use-format-money';

type FormValues = {
  departureDestinationId: string;
  arrivalDestinationId: string;
  priceCents: string;
  currency: string;
};

const emptyForm: FormValues = {
  departureDestinationId: '',
  arrivalDestinationId: '',
  priceCents: '',
  currency: FALLBACK_TREASURY_CURRENCY,
};

type VehicleRoutesSectionProps = {
  vehicleId: string;
  defaultCurrency?: string;
  embedded?: boolean;
  onChanged?: () => void;
};

export function VehicleRoutesSection({
  vehicleId,
  defaultCurrency,
  embedded = false,
  onChanged,
}: VehicleRoutesSectionProps) {
  const { locations: getLocationsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.locations.sections.routes');
  const tCommon = useTranslations('modules.common');
  const tActions = useTranslations('common.actions');
  const tSelect = useTranslations('modules.common.select');
  const tLoading = useTranslations('common.loading');
  const formatPrice = useFormatMoney();
  const emptyDash = tCommon('empty.dash');

  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; routes: VehicleRoute[] }
  >({ status: 'loading' });
  const [destinations, setDestinations] = useState<Destination[]>([]);
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
    extraCodes: [formValues.currency, defaultCurrency],
  });

  const destinationById = useMemo(
    () => new Map(destinations.map((d) => [d.id, d])),
    [destinations],
  );

  const destinationOptions = useMemo(
    () => [
      { value: '', label: tSelect('chooseDash') },
      ...destinations.map((d) => ({
        value: d.id,
        label: `${d.name} (${d.countryCode})`,
      })),
    ],
    [destinations, tSelect],
  );

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const client = getApiClient();
      const [routesResult, destinationsResult] = await Promise.all([
        client.listVehicleRoutes({ vehicleId, page: 1, limit: 100 }),
        client.listDestinations({ page: 1, limit: 100 }),
      ]);
      setDestinations(destinationsResult.data);
      setState({ status: 'ready', routes: routesResult.data });
    } catch (error) {
      setState({ status: 'error', message: getLocationsErrorMessage(error) });
    }
  }, [vehicleId, getLocationsErrorMessage]);

  useEffect(() => {
    void load();
  }, [load]);

  function resetForm() {
    setFormValues({
      ...emptyForm,
      currency: (defaultCurrency ?? FALLBACK_TREASURY_CURRENCY).toUpperCase(),
    });
    setEditing(null);
    setShowForm(false);
    setFormError(null);
    setFieldErrors({});
  }

  function openCreate() {
    resetForm();
    setShowForm(true);
  }

  function openEdit(route: VehicleRoute) {
    setEditing(route);
    setFormValues({
      departureDestinationId: route.departureDestinationId,
      arrivalDestinationId: route.arrivalDestinationId,
      priceCents: String(route.priceCents),
      currency: route.currency,
    });
    setShowForm(true);
    setFormError(null);
    setFieldErrors({});
  }

  function validate(): boolean {
    const errors: Partial<Record<keyof FormValues, string>> = {};
    if (!formValues.departureDestinationId) {
      errors.departureDestinationId = t('validation.departureRequired');
    }
    if (!formValues.arrivalDestinationId) {
      errors.arrivalDestinationId = t('validation.arrivalRequired');
    }
    if (
      formValues.departureDestinationId &&
      formValues.arrivalDestinationId &&
      formValues.departureDestinationId === formValues.arrivalDestinationId
    ) {
      errors.arrivalDestinationId = t('validation.sameDestination');
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
      if (editing) {
        await client.updateVehicleRoute(editing.id, {
          departureDestinationId: formValues.departureDestinationId,
          arrivalDestinationId: formValues.arrivalDestinationId,
          priceCents,
          currency,
        });
      } else {
        await client.createVehicleRoute({
          vehicleId,
          departureDestinationId: formValues.departureDestinationId,
          arrivalDestinationId: formValues.arrivalDestinationId,
          priceCents,
          currency,
        });
      }
      resetForm();
      await load();
      onChanged?.();
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
      setConfirmTarget(null);
      await load();
      onChanged?.();
    } catch (error) {
      setFormError(getLocationsErrorMessage(error));
      setConfirmTarget(null);
    } finally {
      setDeletingId(null);
    }
  }

  function routeLabel(route: VehicleRoute): string {
    const dep =
      destinationById.get(route.departureDestinationId)?.name ??
      route.departureDestinationId.slice(0, 8);
    const arr =
      destinationById.get(route.arrivalDestinationId)?.name ??
      route.arrivalDestinationId.slice(0, 8);
    return `${dep} → ${arr}`;
  }

  const columns = useMemo<ColumnDef<VehicleRoute>[]>(
    () => [
      {
        id: 'route',
        header: t('columns.route'),
        cell: ({ row }) => (
          <span className="text-sm font-medium text-atg-fg">{routeLabel(row.original)}</span>
        ),
      },
      {
        id: 'price',
        header: t('columns.price'),
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
    [deletingId, destinationById, formatPrice, t, tCommon],
  );

  const routes = state.status === 'ready' ? state.routes : [];
  const content = (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-atg-fg">{t('title')}</h3>
          <p className="mt-0.5 text-xs text-atg-muted">{t('intro')}</p>
        </div>
        <Button type="button" size="sm" onClick={openCreate}>
          {t('addRoute')}
        </Button>
      </div>

      {state.status === 'error' ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
      ) : null}

      {formError && !showForm ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {formError}
        </p>
      ) : null}

      <DataTable
        columns={columns}
        data={routes}
        isLoading={state.status === 'loading'}
        emptyMessage={t('empty')}
        getRowId={(row) => row.id}
      />

      <Modal
        open={showForm}
        onOpenChange={(open) => {
          if (!open) resetForm();
        }}
        title={editing ? t('editRoute') : t('newRoute')}
        showClose
        closeAriaLabel={tActions('close')}
        className="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-xs text-atg-muted">
            {editing ? t('editFormHint') : t('formHint')}
          </p>
          {formError ? (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {formError}
            </p>
          ) : null}
          <SearchableSelect
            label={t('departure')}
            name="departureDestinationId"
            value={formValues.departureDestinationId}
            options={destinationOptions}
            onChange={(next) =>
              setFormValues((prev) => ({ ...prev, departureDestinationId: next }))
            }
            searchPlaceholder={tSelect('searchPlaceholder')}
            emptyMessage={tSelect('empty')}
            placeholder={tSelect('chooseDash')}
            error={fieldErrors.departureDestinationId}
            required
          />
          <SearchableSelect
            label={t('arrival')}
            name="arrivalDestinationId"
            value={formValues.arrivalDestinationId}
            options={destinationOptions}
            onChange={(next) =>
              setFormValues((prev) => ({ ...prev, arrivalDestinationId: next }))
            }
            searchPlaceholder={tSelect('searchPlaceholder')}
            emptyMessage={tSelect('empty')}
            placeholder={tSelect('chooseDash')}
            error={fieldErrors.arrivalDestinationId}
            required
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={t('priceCents')}
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
              {editing ? tActions('save') : t('addRoute')}
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
        title={t('deleteTitle')}
        description={
          confirmTarget
            ? t('deleteConfirm', { label: routeLabel(confirmTarget) })
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

  if (embedded) {
    return content;
  }

  return (
    <Card variant="dashboard" padding="sm">
      {content}
    </Card>
  );
}

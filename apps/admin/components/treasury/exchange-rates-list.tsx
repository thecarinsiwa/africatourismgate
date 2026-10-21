'use client';

import {
  AlertDialog,
  Button,
  Card,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  DataTablePagination,
  FilterBar,
  Input,
  Modal,
  Select,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { ExchangeRate, OrganizationListItem } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { resolveUnknownApiError } from '../../lib/common-api-errors';
import { useDataTablePaginationLabels } from '../../lib/i18n/use-pagination-labels';
import {
  FALLBACK_TREASURY_CURRENCY,
  treasuryCurrencySelectOptions,
} from '../../lib/treasury/currency-options';
import { useOrganizationCurrency } from '../../lib/treasury/use-organization-currency';
import { PermissionGate } from '../permission-gate';

const PAGE_SIZE = 20;

type FormState = {
  fromCurrency: string;
  toCurrency: string;
  rate: string;
  effectiveOn: string;
  notes: string;
};

const EMPTY_FORM: FormState = {
  fromCurrency: 'EUR',
  toCurrency: FALLBACK_TREASURY_CURRENCY,
  rate: '',
  effectiveOn: '',
  notes: '',
};

export function ExchangeRatesList() {
  const t = useTranslations('modules.treasury.fxRates');
  const tColumns = useTranslations('modules.treasury.fxRates.columns');
  const tFilters = useTranslations('modules.common');
  const tTreasuryCommon = useTranslations('modules.treasury.common');
  const tActions = useTranslations('common.actions');
  const tErrors = useTranslations('modules.treasury.errors');
  const tCommonErrors = useTranslations('common.errors');
  const paginationLabels = useDataTablePaginationLabels();

  const [page, setPage] = useState(1);
  const [fromCurrency, setFromCurrency] = useState('');
  const [toCurrency, setToCurrency] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [organizations, setOrganizations] = useState<OrganizationListItem[]>(
    [],
  );
  const [canRead, setCanRead] = useState(true);
  const [canWrite, setCanWrite] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ExchangeRate | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ExchangeRate | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | {
        status: 'ready';
        items: ExchangeRate[];
        total: number;
        totalPages: number;
      }
  >({ status: 'loading' });
  const toCurrencyTouchedRef = useRef(false);
  const prevOrgIdRef = useRef(organizationId);
  const orgCurrency = useOrganizationCurrency(organizationId || undefined);

  const commonErrorMessages = useMemo(
    () => ({
      network: tCommonErrors('network'),
      forbidden: tErrors('forbidden'),
      generic: tErrors('loadFailed'),
      apiStatus: (code: number) => tCommonErrors('apiStatus', { status: code }),
      accessDenied: t('accessDenied'),
    }),
    [t, tCommonErrors, tErrors],
  );

  const currencySelectOptions = useMemo(
    () =>
      treasuryCurrencySelectOptions({
        includeEmpty: true,
        emptyLabel: tFilters('filters.all'),
        extraCodes: [orgCurrency],
      }),
    [tFilters, orgCurrency],
  );

  const formCurrencyOptions = useMemo(
    () =>
      treasuryCurrencySelectOptions({
        extraCodes: [orgCurrency, form.toCurrency, form.fromCurrency],
      }),
    [orgCurrency, form.toCurrency, form.fromCurrency],
  );

  useEffect(() => {
    if (organizationId !== prevOrgIdRef.current) {
      prevOrgIdRef.current = organizationId;
      toCurrencyTouchedRef.current = false;
    }
  }, [organizationId]);

  useEffect(() => {
    if (
      !orgCurrency ||
      toCurrencyTouchedRef.current ||
      (modalOpen && editing)
    ) {
      return;
    }
    setForm((prev) =>
      prev.toCurrency === orgCurrency
        ? prev
        : { ...prev, toCurrency: orgCurrency },
    );
  }, [orgCurrency, modalOpen, editing]);

  useEffect(() => {
    let cancelled = false;
    void getApiClient()
      .getAuthMe()
      .then(async (me) => {
        if (cancelled) return;
        setCanRead(
          me.isSuperAdmin ||
            me.permissions.includes('treasury.fx_rates.read'),
        );
        setCanWrite(
          me.isSuperAdmin ||
            me.permissions.includes('treasury.fx_rates.write'),
        );
        if (me.user.organizationId) {
          setOrganizationId(me.user.organizationId);
        }
        if (me.isSuperAdmin) {
          const orgs = await getApiClient().listOrganizations({
            page: 1,
            limit: 100,
          });
          if (!cancelled) setOrganizations(orgs.data);
        }
      })
      .catch(() => {
        if (!cancelled) setCanRead(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const load = useCallback(async () => {
    if (!canRead) {
      setState({ status: 'error', message: t('accessDenied') });
      return;
    }
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listExchangeRates({
        page,
        limit: PAGE_SIZE,
        organizationId: organizationId || undefined,
        fromCurrency: fromCurrency || undefined,
        toCurrency: toCurrency || undefined,
      });
      setState({
        status: 'ready',
        items: result.data,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      setState({
        status: 'error',
        message: resolveUnknownApiError(error, commonErrorMessages),
      });
    }
  }, [
    canRead,
    page,
    organizationId,
    fromCurrency,
    toCurrency,
    t,
    commonErrorMessages,
  ]);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    toCurrencyTouchedRef.current = false;
    setForm({
      ...EMPTY_FORM,
      toCurrency: orgCurrency ?? FALLBACK_TREASURY_CURRENCY,
      effectiveOn: new Date().toISOString().slice(0, 10),
    });
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (row: ExchangeRate) => {
    setEditing(row);
    toCurrencyTouchedRef.current = true;
    setForm({
      fromCurrency: row.fromCurrency,
      toCurrency: row.toCurrency,
      rate: String(row.rate),
      effectiveOn: row.effectiveOn.slice(0, 10),
      notes: row.notes ?? '',
    });
    setFormError(null);
    setModalOpen(true);
  };

  const save = async () => {
    if (!organizationId) {
      setFormError(t('validation.organizationRequired'));
      return;
    }
    const rate = Number(form.rate.replace(',', '.'));
    if (
      !form.fromCurrency ||
      !form.toCurrency ||
      !form.effectiveOn ||
      !(rate > 0)
    ) {
      setFormError(t('validation.required'));
      return;
    }
    if (form.fromCurrency === form.toCurrency) {
      setFormError(t('validation.sameCurrency'));
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      if (editing) {
        await getApiClient().updateExchangeRate(editing.id, {
          fromCurrency: form.fromCurrency,
          toCurrency: form.toCurrency,
          rate,
          effectiveOn: form.effectiveOn,
          notes: form.notes.trim() || null,
        });
      } else {
        await getApiClient().createExchangeRate({
          organizationId,
          fromCurrency: form.fromCurrency,
          toCurrency: form.toCurrency,
          rate,
          effectiveOn: form.effectiveOn,
          notes: form.notes.trim() || null,
        });
      }
      setModalOpen(false);
      await load();
    } catch (error) {
      setFormError(resolveUnknownApiError(error, commonErrorMessages));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await getApiClient().deleteExchangeRate(deleteTarget.id);
      setDeleteTarget(null);
      await load();
    } catch (error) {
      setState({
        status: 'error',
        message: resolveUnknownApiError(error, commonErrorMessages),
      });
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const columns = useMemo<ColumnDef<ExchangeRate>[]>(
    () => [
      {
        id: 'pair',
        header: tColumns('pair'),
        cell: ({ row }) =>
          `${row.original.fromCurrency} → ${row.original.toCurrency}`,
      },
      {
        id: 'rate',
        header: tColumns('rate'),
        cell: ({ row }) => row.original.rate,
      },
      {
        id: 'effectiveOn',
        header: tColumns('effectiveOn'),
        cell: ({ row }) => row.original.effectiveOn.slice(0, 10),
      },
      {
        id: 'notes',
        header: tColumns('notes'),
        cell: ({ row }) => row.original.notes ?? tFilters('empty.dash'),
      },
      {
        id: 'actions',
        header: tColumns('actions'),
        cell: ({ row }) =>
          canWrite ? (
            <DataTableActions>
              <DataTableActionButton
                action="edit"
                label={tActions('edit')}
                onClick={() => openEdit(row.original)}
              />
              <DataTableActionButton
                action="delete"
                label={tActions('delete')}
                onClick={() => setDeleteTarget(row.original)}
              />
            </DataTableActions>
          ) : null,
      },
    ],
    [canWrite, tActions, tColumns, tFilters],
  );

  const items = state.status === 'ready' ? state.items : [];
  const total = state.status === 'ready' ? state.total : 0;
  const totalPages = state.status === 'ready' ? state.totalPages : 1;
  const activeFilterCount = [fromCurrency !== '', toCurrency !== ''].filter(
    Boolean,
  ).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-atg-muted">{t('hint')}</p>
        <PermissionGate permission="treasury.fx_rates.write">
          <Button type="button" variant="primary" onClick={openCreate}>
            {t('newButton')}
          </Button>
        </PermissionGate>
      </div>

      {organizations.length > 0 ? (
        <div className="w-full sm:w-72">
          <Select
            label={t('filters.organization')}
            value={organizationId}
            options={organizations.map((o) => ({
              value: o.id,
              label: o.name,
            }))}
            onChange={(e) => {
              setOrganizationId(e.target.value);
              setPage(1);
            }}
          />
        </div>
      ) : null}

      <FilterBar
        mobileVariant="drawer"
        activeCount={activeFilterCount}
        onClear={() => {
          setFromCurrency('');
          setToCurrency('');
          setPage(1);
        }}
        clearLabel={tFilters('filters.clearAll')}
        applyLabel={tFilters('filters.apply')}
        toggleLabel={tFilters('filters.toggle')}
        filters={
          <>
            <div className="w-full sm:w-40">
              <Select
                label={t('filters.fromCurrency')}
                value={fromCurrency}
                options={currencySelectOptions}
                onChange={(e) => {
                  setFromCurrency(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="w-full sm:w-40">
              <Select
                label={t('filters.toCurrency')}
                value={toCurrency}
                options={currencySelectOptions}
                onChange={(e) => {
                  setToCurrency(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </>
        }
      />

      {state.status === 'error' ? (
        <p className="text-sm text-red-600" role="alert">
          {state.message}
        </p>
      ) : null}

      <Card variant="dashboard" padding="none" className="overflow-hidden">
        <DataTable
          columns={columns}
          data={items}
          getRowId={(row) => row.id}
          isLoading={state.status === 'loading'}
          emptyMessage={t('empty')}
          aria-label={t('ariaLabel')}
        />
      </Card>

      {state.status === 'ready' && totalPages > 1 ? (
        <DataTablePagination
          page={page}
          pageSize={PAGE_SIZE}
          totalPages={totalPages}
          totalItems={total}
          itemLabel={t('pagination.item')}
          labels={paginationLabels}
          onPageChange={setPage}
        />
      ) : null}

      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editing ? t('form.editTitle') : t('form.createTitle')}
        description={t('form.description')}
        showClose
      >
        <div className="space-y-4 p-1">
          <div className="grid gap-3 sm:grid-cols-2">
            <Select
              label={t('form.fromCurrency')}
              value={form.fromCurrency}
              options={formCurrencyOptions}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, fromCurrency: e.target.value }))
              }
            />
            <Select
              label={t('form.toCurrency')}
              value={form.toCurrency}
              options={formCurrencyOptions}
              onChange={(e) => {
                toCurrencyTouchedRef.current = true;
                setForm((prev) => ({ ...prev, toCurrency: e.target.value }));
              }}
            />
          </div>
          <Input
            label={t('form.rate')}
            type="text"
            inputMode="decimal"
            value={form.rate}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, rate: e.target.value }))
            }
            hint={t('form.rateHint')}
          />
          <Input
            label={t('form.effectiveOn')}
            type="date"
            value={form.effectiveOn}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, effectiveOn: e.target.value }))
            }
          />
          <Input
            label={t('form.notes')}
            value={form.notes}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, notes: e.target.value }))
            }
          />
          {formError ? (
            <p className="text-sm text-red-600" role="alert">
              {formError}
            </p>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setModalOpen(false)}
            >
              {tTreasuryCommon('cancel')}
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={saving}
              onClick={() => void save()}
            >
              {saving ? t('form.saving') : tTreasuryCommon('save')}
            </Button>
          </div>
        </div>
      </Modal>

      <AlertDialog
        open={deleteTarget != null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title={t('delete.title')}
        description={t('delete.description')}
        confirmLabel={tActions('delete')}
        cancelLabel={tTreasuryCommon('cancel')}
        variant="danger"
        loading={deleting}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}

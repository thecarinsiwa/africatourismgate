'use client';

import {
  Button,
  Card,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  DataTableBadge,
  DataTablePagination,
  Input,
  Modal,
  Select,
  type ColumnDef,
} from '@africatourismgate/ui';
import type {
  AccountingExercise,
  OrganizationListItem,
} from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { resolveUnknownApiError } from '../../lib/common-api-errors';
import { useDataTablePaginationLabels } from '../../lib/i18n/use-pagination-labels';
import { FALLBACK_TREASURY_CURRENCY } from '../../lib/treasury/currency-options';
import { useActiveCurrencies } from '../../lib/treasury/use-active-currencies';
import { useOrganizationCurrency } from '../../lib/treasury/use-organization-currency';
import { PermissionGate } from '../permission-gate';

const PAGE_SIZE = 20;

type FormState = {
  organizationId: string;
  code: string;
  label: string;
  startsOn: string;
  endsOn: string;
  currency: string;
};

function emptyForm(organizationId = ''): FormState {
  const year = new Date().getFullYear();
  return {
    organizationId,
    code: String(year),
    label: '',
    startsOn: `${year}-01-01`,
    endsOn: `${year}-12-31`,
    currency: FALLBACK_TREASURY_CURRENCY,
  };
}

export function AccountingExercisesList() {
  const t = useTranslations('modules.treasury.accounting.exercises');
  const tColumns = useTranslations('modules.treasury.accounting.exercises.columns');
  const tStatuses = useTranslations('modules.treasury.accounting.exerciseStatuses');
  const tActions = useTranslations('common.actions');
  const tErrors = useTranslations('modules.treasury.errors');
  const tCommonErrors = useTranslations('common.errors');
  const paginationLabels = useDataTablePaginationLabels();

  const [page, setPage] = useState(1);
  const [organizationId, setOrganizationId] = useState('');
  const [organizations, setOrganizations] = useState<OrganizationListItem[]>(
    [],
  );
  const [canRead, setCanRead] = useState(true);
  const [canWrite, setCanWrite] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AccountingExercise | null>(null);
  const [form, setForm] = useState<FormState>(() => emptyForm());
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | {
        status: 'ready';
        items: AccountingExercise[];
        total: number;
        totalPages: number;
      }
  >({ status: 'loading' });

  const currencyTouchedRef = useRef(false);
  const formOrgId = editing ? editing.organizationId : form.organizationId;
  const orgCurrency = useOrganizationCurrency(
    modalOpen && !editing ? formOrgId || undefined : undefined,
  );

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

  const { options: currencyOptions } = useActiveCurrencies({
    extraCodes: [orgCurrency, form.currency, editing?.currency],
  });

  useEffect(() => {
    if (!modalOpen || editing || !orgCurrency || currencyTouchedRef.current) {
      return;
    }
    setForm((prev) =>
      prev.currency === orgCurrency
        ? prev
        : { ...prev, currency: orgCurrency },
    );
  }, [modalOpen, editing, orgCurrency]);

  useEffect(() => {
    let cancelled = false;
    void getApiClient()
      .getAuthMe()
      .then(async (me) => {
        if (cancelled) return;
        setCanRead(
          me.isSuperAdmin ||
            me.permissions.includes('accounting.read') ||
            me.permissions.includes('treasury.accounting_link.read'),
        );
        setCanWrite(
          me.isSuperAdmin ||
            me.permissions.includes('accounting.chart.write'),
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
      const result = await getApiClient().listAccountingExercises({
        page,
        limit: PAGE_SIZE,
        organizationId: organizationId || undefined,
        includePeriods: true,
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
  }, [canRead, page, organizationId, t, commonErrorMessages]);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    currencyTouchedRef.current = false;
    setForm(emptyForm(organizationId));
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (row: AccountingExercise) => {
    setEditing(row);
    currencyTouchedRef.current = true;
    setForm({
      organizationId: row.organizationId,
      code: row.code,
      label: row.label,
      startsOn: row.startsOn.slice(0, 10),
      endsOn: row.endsOn.slice(0, 10),
      currency: row.currency,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const save = async () => {
    if (editing) {
      if (!form.label.trim()) {
        setFormError(t('validation.required'));
        return;
      }
      setSaving(true);
      setFormError(null);
      try {
        await getApiClient().updateAccountingExercise(editing.id, {
          label: form.label.trim(),
          currency: form.currency.trim().toUpperCase(),
        });
        setModalOpen(false);
        await load();
      } catch (error) {
        setFormError(resolveUnknownApiError(error, commonErrorMessages));
      } finally {
        setSaving(false);
      }
      return;
    }

    if (
      !form.organizationId ||
      !form.code.trim() ||
      !form.label.trim() ||
      !form.startsOn ||
      !form.endsOn ||
      !form.currency
    ) {
      setFormError(t('validation.required'));
      return;
    }
    if (form.startsOn > form.endsOn) {
      setFormError(t('validation.dateRange'));
      return;
    }

    setSaving(true);
    setFormError(null);
    try {
      await getApiClient().createAccountingExercise({
        organizationId: form.organizationId,
        code: form.code.trim(),
        label: form.label.trim(),
        startsOn: form.startsOn,
        endsOn: form.endsOn,
        currency: form.currency.trim().toUpperCase(),
      });
      setModalOpen(false);
      await load();
    } catch (error) {
      setFormError(resolveUnknownApiError(error, commonErrorMessages));
    } finally {
      setSaving(false);
    }
  };

  const columns = useMemo<ColumnDef<AccountingExercise>[]>(
    () => [
      {
        id: 'code',
        header: tColumns('code'),
        cell: ({ row }) => row.original.code,
      },
      {
        id: 'label',
        header: tColumns('label'),
        cell: ({ row }) => row.original.label,
      },
      {
        id: 'range',
        header: tColumns('range'),
        cell: ({ row }) =>
          `${row.original.startsOn.slice(0, 10)} → ${row.original.endsOn.slice(0, 10)}`,
      },
      {
        id: 'currency',
        header: tColumns('currency'),
        cell: ({ row }) => (
          <span className="font-medium tabular-nums">
            {row.original.currency}
          </span>
        ),
      },
      {
        id: 'periods',
        header: tColumns('periods'),
        cell: ({ row }) => row.original.periods?.length ?? '—',
      },
      {
        id: 'status',
        header: tColumns('status'),
        cell: ({ row }) => (
          <DataTableBadge variant="default">
            {tStatuses(row.original.status)}
          </DataTableBadge>
        ),
      },
      {
        id: 'actions',
        header: tColumns('actions'),
        cell: ({ row }) =>
          canWrite && row.original.status !== 'closed' ? (
            <DataTableActions>
              <DataTableActionButton
                action="edit"
                label={tActions('edit')}
                onClick={() => openEdit(row.original)}
              />
            </DataTableActions>
          ) : null,
      },
    ],
    [canWrite, tActions, tColumns, tStatuses],
  );

  const items = state.status === 'ready' ? state.items : [];
  const total = state.status === 'ready' ? state.total : 0;
  const totalPages = state.status === 'ready' ? state.totalPages : 1;
  const orgOptions = useMemo(
    () =>
      organizations.map((o) => ({
        value: o.id,
        label: `${o.name} (${o.currency})`,
      })),
    [organizations],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-atg-muted">{t('hint')}</p>
        <PermissionGate permission="accounting.chart.write">
          <Button type="button" variant="primary" onClick={openCreate}>
            {t('newButton')}
          </Button>
        </PermissionGate>
      </div>

      {organizations.length > 0 ? (
        <div className="w-full sm:w-80">
          <Select
            label={t('filters.organization')}
            value={organizationId}
            options={[
              { value: '', label: t('filters.organizationAll') },
              ...orgOptions,
            ]}
            onChange={(e) => {
              setOrganizationId(e.target.value);
              setPage(1);
            }}
          />
        </div>
      ) : null}

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
        description={
          editing ? t('form.editDescription') : t('form.createDescription')
        }
        showClose
      >
        <div className="space-y-4 p-1">
          {!editing && organizations.length > 0 ? (
            <Select
              label={t('form.organization')}
              value={form.organizationId}
              options={[{ value: '', label: '—' }, ...orgOptions]}
              onChange={(e) => {
                currencyTouchedRef.current = false;
                setForm((prev) => ({
                  ...prev,
                  organizationId: e.target.value,
                }));
              }}
            />
          ) : null}
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label={t('form.code')}
              value={form.code}
              disabled={Boolean(editing)}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, code: e.target.value }))
              }
            />
            <Select
              label={t('form.currency')}
              value={form.currency}
              options={currencyOptions}
              disabled={Boolean(editing && editing.status !== 'open')}
              onChange={(e) => {
                currencyTouchedRef.current = true;
                setForm((prev) => ({ ...prev, currency: e.target.value }));
              }}
              hint={
                editing ? t('form.currencyHintEdit') : t('form.currencyHint')
              }
            />
          </div>
          <Input
            label={t('form.label')}
            value={form.label}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, label: e.target.value }))
            }
          />
          {!editing ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label={t('form.startsOn')}
                type="date"
                value={form.startsOn}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, startsOn: e.target.value }))
                }
              />
              <Input
                label={t('form.endsOn')}
                type="date"
                value={form.endsOn}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, endsOn: e.target.value }))
                }
              />
            </div>
          ) : (
            <p className="text-sm text-atg-muted">
              {form.startsOn} → {form.endsOn}
            </p>
          )}
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
              disabled={saving}
            >
              {tActions('cancel')}
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={() => void save()}
              disabled={saving}
            >
              {saving ? t('form.saving') : tActions('save')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

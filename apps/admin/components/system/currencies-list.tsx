'use client';

import {
  AlertDialog,
  Button,
  Card,
  Checkbox,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  DataTableBadge,
  DataTablePagination,
  FilterBar,
  Input,
  Modal,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { Currency } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { resolveUnknownApiError } from '../../lib/common-api-errors';
import { useDataTablePaginationLabels } from '../../lib/i18n/use-pagination-labels';
import { PermissionGate } from '../permission-gate';

const PAGE_SIZE = 20;
const CODE_RE = /^[A-Za-z]{3}$/;

type FormState = {
  code: string;
  label: string;
  symbol: string;
  decimalPlaces: string;
  sortOrder: string;
  isActive: boolean;
};

const EMPTY_FORM: FormState = {
  code: '',
  label: '',
  symbol: '',
  decimalPlaces: '2',
  sortOrder: '0',
  isActive: true,
};

export function CurrenciesList() {
  const t = useTranslations('modules.system.currencies');
  const tColumns = useTranslations('modules.system.currencies.columns');
  const tFilters = useTranslations('modules.common');
  const tActions = useTranslations('common.actions');
  const tErrors = useTranslations('modules.system.errors');
  const tCommonErrors = useTranslations('common.errors');
  const paginationLabels = useDataTablePaginationLabels();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchDraft, setSearchDraft] = useState('');
  const [activeOnly, setActiveOnly] = useState(false);
  const [canRead, setCanRead] = useState(true);
  const [canWrite, setCanWrite] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Currency | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Currency | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | {
        status: 'ready';
        items: Currency[];
        total: number;
        totalPages: number;
      }
  >({ status: 'loading' });

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

  useEffect(() => {
    let cancelled = false;
    void getApiClient()
      .getAuthMe()
      .then((me) => {
        if (cancelled) return;
        setCanRead(
          me.isSuperAdmin || me.permissions.includes('currencies.read'),
        );
        setCanWrite(
          me.isSuperAdmin || me.permissions.includes('currencies.write'),
        );
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
      const result = await getApiClient().listCurrencies({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        activeOnly: activeOnly || undefined,
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
  }, [canRead, page, search, activeOnly, t, commonErrorMessages]);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (row: Currency) => {
    setEditing(row);
    setForm({
      code: row.code,
      label: row.label,
      symbol: row.symbol ?? '',
      decimalPlaces: String(row.decimalPlaces),
      sortOrder: String(row.sortOrder),
      isActive: row.isActive,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const save = async () => {
    const code = form.code.trim().toUpperCase();
    const label = form.label.trim();
    if (!code || !label) {
      setFormError(t('validation.required'));
      return;
    }
    if (!CODE_RE.test(code)) {
      setFormError(t('validation.codeFormat'));
      return;
    }
    const decimalPlaces = Number(form.decimalPlaces);
    const sortOrder = Number(form.sortOrder);
    if (
      !Number.isInteger(decimalPlaces) ||
      decimalPlaces < 0 ||
      decimalPlaces > 6 ||
      !Number.isInteger(sortOrder)
    ) {
      setFormError(t('validation.required'));
      return;
    }

    setSaving(true);
    setFormError(null);
    try {
      const payload = {
        label,
        symbol: form.symbol.trim() || null,
        decimalPlaces,
        sortOrder,
        isActive: form.isActive,
      };
      if (editing) {
        await getApiClient().updateCurrency(editing.id, payload);
      } else {
        await getApiClient().createCurrency({ code, ...payload });
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
      await getApiClient().deleteCurrency(deleteTarget.id);
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

  const columns = useMemo<ColumnDef<Currency>[]>(
    () => [
      {
        id: 'code',
        header: tColumns('code'),
        cell: ({ row }) => (
          <span className="font-medium tabular-nums">{row.original.code}</span>
        ),
      },
      {
        id: 'label',
        header: tColumns('label'),
        cell: ({ row }) => row.original.label,
      },
      {
        id: 'symbol',
        header: tColumns('symbol'),
        cell: ({ row }) =>
          row.original.symbol ?? tFilters('empty.dash'),
      },
      {
        id: 'decimalPlaces',
        header: tColumns('decimalPlaces'),
        cell: ({ row }) => row.original.decimalPlaces,
      },
      {
        id: 'sortOrder',
        header: tColumns('sortOrder'),
        cell: ({ row }) => row.original.sortOrder,
      },
      {
        id: 'status',
        header: tColumns('status'),
        cell: ({ row }) => (
          <DataTableBadge
            variant={row.original.isActive ? 'success' : 'muted'}
          >
            {row.original.isActive
              ? t('status.active')
              : t('status.inactive')}
          </DataTableBadge>
        ),
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
    [canWrite, t, tActions, tColumns, tFilters],
  );

  const items = state.status === 'ready' ? state.items : [];
  const total = state.status === 'ready' ? state.total : 0;
  const totalPages = state.status === 'ready' ? state.totalPages : 1;
  const activeFilterCount = [search !== '', activeOnly].filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-atg-muted">{t('hint')}</p>
        <PermissionGate permission="currencies.write">
          <Button type="button" variant="primary" onClick={openCreate}>
            {t('newButton')}
          </Button>
        </PermissionGate>
      </div>

      <FilterBar
        mobileVariant="drawer"
        activeCount={activeFilterCount}
        onClear={() => {
          setSearch('');
          setSearchDraft('');
          setActiveOnly(false);
          setPage(1);
        }}
        onApply={() => {
          setSearch(searchDraft.trim());
          setPage(1);
        }}
        clearLabel={tFilters('filters.clearAll')}
        applyLabel={tFilters('filters.apply')}
        toggleLabel={tFilters('filters.toggle')}
        filters={
          <>
            <div className="w-full sm:w-64">
              <Input
                label={t('filters.search')}
                value={searchDraft}
                placeholder={t('filters.searchPlaceholder')}
                onChange={(e) => setSearchDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setSearch(searchDraft.trim());
                    setPage(1);
                  }
                }}
              />
            </div>
            <div className="flex items-end pb-1">
              <Checkbox
                checked={activeOnly}
                onChange={(e) => {
                  setActiveOnly(e.target.checked);
                  setPage(1);
                }}
                label={t('filters.activeOnly')}
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
          <Input
            label={t('form.code')}
            value={form.code}
            disabled={editing != null}
            maxLength={3}
            hint={t('form.codeHint')}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                code: e.target.value.toUpperCase(),
              }))
            }
          />
          <Input
            label={t('form.label')}
            value={form.label}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, label: e.target.value }))
            }
          />
          <div className="grid gap-3 sm:grid-cols-3">
            <Input
              label={t('form.symbol')}
              value={form.symbol}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, symbol: e.target.value }))
              }
            />
            <Input
              label={t('form.decimalPlaces')}
              type="number"
              min={0}
              max={6}
              value={form.decimalPlaces}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  decimalPlaces: e.target.value,
                }))
              }
            />
            <Input
              label={t('form.sortOrder')}
              type="number"
              value={form.sortOrder}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, sortOrder: e.target.value }))
              }
            />
          </div>
          <Checkbox
            checked={form.isActive}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, isActive: e.target.checked }))
            }
            label={t('form.isActive')}
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
              {t('common.cancel')}
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={saving}
              onClick={() => void save()}
            >
              {saving ? t('form.saving') : t('common.save')}
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
        cancelLabel={t('common.cancel')}
        variant="danger"
        loading={deleting}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}

'use client';

import {
  Button,
  Card,
  DataTable,
  DataTableBadge,
  DataTablePagination,
  Input,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { PromoCode, PromoCodeDiscountType } from '@africatourismgate/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { getPromoCodesErrorMessage } from '../../lib/promo-codes-errors';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

const discountTypeLabels: Record<PromoCodeDiscountType, string> = {
  percent: '%',
  fixed_amount: 'Montant fixe',
};

function formatDiscount(promo: PromoCode): string {
  const value = Number(promo.discountValue);
  if (promo.discountType === 'percent') {
    return `${value} %`;
  }
  return `${value.toFixed(2)}`;
}

function formatUsage(promo: PromoCode): string {
  const max =
    promo.maxRedemptions != null ? String(promo.maxRedemptions) : '∞';
  return `${promo.redemptionCount} / ${max}`;
}

export function PromoCodesList() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [canWrite, setCanWrite] = useState(false);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; promoCodes: PromoCode[]; total: number; totalPages: number }
  >({ status: 'loading' });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getApiClient()
      .getAuthMe()
      .then((me) => {
        if (!cancelled) {
          setCanWrite(me.isSuperAdmin || me.permissions.includes('promo_codes.write'));
        }
      })
      .catch(() => {
        if (!cancelled) setCanWrite(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listPromoCodes({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
      });
      setState({
        status: 'ready',
        promoCodes: result.data,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      setState({ status: 'error', message: getPromoCodesErrorMessage(error) });
    }
  }, [page, search]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const query = searchInput.trim();
    const timer = window.setTimeout(() => {
      setSearch((prev) => {
        if (prev !== query) setPage(1);
        return query;
      });
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const handleDelete = useCallback(
    async (promo: PromoCode) => {
      if (!window.confirm(`Supprimer le code promo « ${promo.code} » ?`)) return;
      setDeleteError(null);
      setDeletingId(promo.id);
      try {
        await getApiClient().deletePromoCode(promo.id);
        await load();
      } catch (error) {
        setDeleteError(getPromoCodesErrorMessage(error));
      } finally {
        setDeletingId(null);
      }
    },
    [load],
  );

  const columns = useMemo<ColumnDef<PromoCode, unknown>[]>(
    () => [
      {
        accessorKey: 'code',
        header: 'Code',
        cell: ({ row }) => (
          <code className="rounded-md bg-atg-surface px-2 py-0.5 font-mono text-sm font-semibold text-atg-fg ring-1 ring-atg-border/60">
            {row.original.code}
          </code>
        ),
      },
      {
        id: 'discount',
        header: 'Réduction',
        cell: ({ row }) => (
          <span className="text-sm text-atg-fg">
            {formatDiscount(row.original)}{' '}
            <span className="text-atg-muted">
              ({discountTypeLabels[row.original.discountType]})
            </span>
          </span>
        ),
      },
      {
        id: 'validity',
        header: 'Validité',
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-atg-muted">
            {row.original.validFrom.slice(0, 10)} → {row.original.validUntil.slice(0, 10)}
          </span>
        ),
      },
      {
        id: 'usage',
        header: 'Utilisations',
        meta: { align: 'center' },
        cell: ({ row }) => (
          <span className="tabular-nums text-sm">{formatUsage(row.original)}</span>
        ),
      },
      {
        id: 'active',
        header: 'Statut',
        meta: { align: 'center' },
        cell: ({ row }) => (
          <DataTableBadge variant={row.original.active === 1 ? 'success' : 'muted'}>
            {row.original.active === 1 ? 'Actif' : 'Inactif'}
          </DataTableBadge>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        meta: { align: 'right' },
        cell: ({ row }) => {
          const promo = row.original;
          return (
            <div className="flex justify-end gap-1.5">
              <Button href={`/paiements/codes-promo/${promo.id}`} variant="ghost" size="sm">
                Modifier
              </Button>
              {canWrite ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => void handleDelete(promo)}
                  disabled={deletingId === promo.id}
                  loading={deletingId === promo.id}
                  loadingText="…"
                  className="!text-red-600 hover:!bg-red-50 hover:!text-red-700 dark:!text-red-400 dark:hover:!bg-red-950/30"
                >
                  Supprimer
                </Button>
              ) : null}
            </div>
          );
        },
      },
    ],
    [canWrite, deletingId, handleDelete],
  );

  const isLoading = state.status === 'loading';
  const isError = state.status === 'error';
  const promoCodes = state.status === 'ready' ? state.promoCodes : [];
  const emptyMessage = search.trim()
    ? 'Aucun code promo ne correspond à votre recherche.'
    : 'Aucun code promo pour le moment.';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 sm:max-w-md">
          <Input
            name="search"
            type="search"
            placeholder="Rechercher par code…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            aria-label="Rechercher un code promo"
          />
        </div>
        {canWrite ? (
          <Button href="/paiements/codes-promo/nouveau">Nouveau code promo</Button>
        ) : null}
      </div>

      {deleteError ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {deleteError}
        </p>
      ) : null}

      {isError ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {state.message}
        </p>
      ) : (
        <>
          <Card variant="dashboard" padding="none" className="overflow-hidden">
            <DataTable
              columns={columns}
              data={promoCodes}
              isLoading={isLoading}
              emptyMessage={emptyMessage}
              emptyVariant={search.trim() ? 'search' : 'default'}
              getRowId={(row) => row.id}
              aria-label="Liste des codes promo"
            />
          </Card>

          {state.status === 'ready' ? (
            <DataTablePagination
              page={page}
              pageSize={PAGE_SIZE}
              totalPages={state.totalPages}
              totalItems={state.total}
              itemLabel="code promo"
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}
    </div>
  );
}

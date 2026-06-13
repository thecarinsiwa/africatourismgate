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
  type ColumnDef,
} from '@africatourismgate/ui';
import type { PromoCodeDiscountType, Promotion } from '@africatourismgate/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { getPromotionsErrorMessage } from '../../lib/promotions-errors';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

const discountTypeLabels: Record<PromoCodeDiscountType, string> = {
  percent: '%',
  fixed_amount: 'Montant fixe',
};

function formatDiscount(promo: Promotion): string {
  if (!promo.discountType || promo.discountValue == null) {
    return '—';
  }
  const value = Number(promo.discountValue);
  if (promo.discountType === 'percent') {
    return `${value} %`;
  }
  return `${value.toFixed(2)}`;
}

function formatValidity(promo: Promotion): string {
  const from = promo.validFrom?.slice(0, 10);
  const until = promo.validUntil?.slice(0, 10);
  if (!from && !until) return 'Sans limite';
  if (from && until) return `${from} → ${until}`;
  if (from) return `À partir du ${from}`;
  return `Jusqu’au ${until}`;
}

function formatUsage(promo: Promotion): string {
  const max = promo.maxRedemptions != null ? String(promo.maxRedemptions) : '∞';
  return `${promo.redemptionCount} / ${max}`;
}

export function PromotionsList() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [canWrite, setCanWrite] = useState(false);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; promotions: Promotion[]; total: number; totalPages: number }
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
      const result = await getApiClient().listPromotions({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
      });
      setState({
        status: 'ready',
        promotions: result.data,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      setState({ status: 'error', message: getPromotionsErrorMessage(error) });
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
    async (promo: Promotion) => {
      if (!window.confirm(`Supprimer la promotion « ${promo.name} » ?`)) return;
      setDeleteError(null);
      setDeletingId(promo.id);
      try {
        await getApiClient().deletePromotion(promo.id);
        await load();
      } catch (error) {
        setDeleteError(getPromotionsErrorMessage(error));
      } finally {
        setDeletingId(null);
      }
    },
    [load],
  );

  const columns = useMemo<ColumnDef<Promotion, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Campagne',
        cell: ({ row }) => (
          <div>
            <span className="font-medium text-atg-fg">{row.original.name}</span>
            {row.original.description ? (
              <p className="mt-0.5 line-clamp-1 text-xs text-atg-muted">
                {row.original.description}
              </p>
            ) : null}
          </div>
        ),
      },
      {
        id: 'discount',
        header: 'Réduction',
        cell: ({ row }) => {
          const label = formatDiscount(row.original);
          if (label === '—') {
            return <span className="text-sm text-atg-muted">Informative</span>;
          }
          return (
            <span className="text-sm text-atg-fg">
              {label}{' '}
              {row.original.discountType ? (
                <span className="text-atg-muted">
                  ({discountTypeLabels[row.original.discountType]})
                </span>
              ) : null}
            </span>
          );
        },
      },
      {
        id: 'validity',
        header: 'Validité',
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-atg-muted">
            {formatValidity(row.original)}
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
            {row.original.active === 1 ? 'Active' : 'Inactive'}
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
            <DataTableActions>
              <DataTableActionButton action="edit" href={`/paiements/promotions/${promo.id}`} />
              {canWrite ? (
                <DataTableActionButton
                  action="delete"
                  onClick={() => void handleDelete(promo)}
                  disabled={deletingId === promo.id}
                  loading={deletingId === promo.id}
                />
              ) : null}
            </DataTableActions>
          );
        },
      },
    ],
    [canWrite, deletingId, handleDelete],
  );

  const isLoading = state.status === 'loading';
  const isError = state.status === 'error';
  const promotions = state.status === 'ready' ? state.promotions : [];
  const emptyMessage = search.trim()
    ? 'Aucune promotion ne correspond à votre recherche.'
    : 'Aucune promotion pour le moment.';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 sm:max-w-md">
          <Input
            name="search"
            type="search"
            placeholder="Rechercher par titre ou description…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            aria-label="Rechercher une promotion"
          />
        </div>
        {canWrite ? (
          <Button href="/paiements/promotions/nouveau">Nouvelle promotion</Button>
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
              data={promotions}
              isLoading={isLoading}
              emptyMessage={emptyMessage}
              emptyVariant={search.trim() ? 'search' : 'default'}
              getRowId={(row) => row.id}
              aria-label="Liste des promotions"
            />
          </Card>

          {state.status === 'ready' ? (
            <DataTablePagination
              page={page}
              pageSize={PAGE_SIZE}
              totalPages={state.totalPages}
              totalItems={state.total}
              itemLabel="promotion"
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}
    </div>
  );
}

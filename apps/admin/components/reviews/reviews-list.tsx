'use client';

import {
  Button,
  Card,
  DataTable,
  DataTableBadge,
  DataTablePagination,
  type ColumnDef,
} from '@africatourismgate/ui';
import type {
  AdminReviewListItem,
  Property,
  ReviewStatus,
} from '@africatourismgate/types';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { getReviewsErrorMessage } from '../../lib/reviews-errors';

const PAGE_SIZE = 20;

const statusLabels: Record<ReviewStatus, string> = {
  pending: 'En attente',
  approved: 'Approuvé',
  hidden: 'Masqué',
};

const statusVariants: Record<ReviewStatus, 'success' | 'warning' | 'muted'> = {
  pending: 'warning',
  approved: 'success',
  hidden: 'muted',
};

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

function formatEntity(row: AdminReviewListItem): string {
  const shortId = row.entityId.slice(0, 8);
  return `${row.entityType} · ${shortId}…`;
}

export function ReviewsList() {
  const ratingFilterId = useId();
  const propertyFilterId = useId();
  const statusFilterId = useId();

  const [page, setPage] = useState(1);
  const [filterTick, setFilterTick] = useState(0);
  const [ratingFilter, setRatingFilter] = useState('');
  const [propertyFilter, setPropertyFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | ReviewStatus>('');
  const [properties, setProperties] = useState<Property[]>([]);
  const [canWrite, setCanWrite] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; reviews: AdminReviewListItem[]; total: number; totalPages: number }
  >({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    void getApiClient()
      .getAuthMe()
      .then((me) => {
        if (!cancelled) {
          setCanWrite(
            me.isSuperAdmin || me.permissions.includes('reviews.write'),
          );
        }
      })
      .catch(() => {
        if (!cancelled) setCanWrite(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadProperties() {
      try {
        const result = await getApiClient().listProperties({ page: 1, limit: 100 });
        if (!cancelled) setProperties(result.data);
      } catch {
        if (!cancelled) setProperties([]);
      }
    }
    void loadProperties();
    return () => {
      cancelled = true;
    };
  }, []);

  const load = useCallback(async () => {
    void filterTick;
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listReviews({
        page,
        limit: PAGE_SIZE,
        rating: ratingFilter ? Number(ratingFilter) : undefined,
        propertyId: propertyFilter || undefined,
        status: statusFilter || undefined,
      });
      setState({
        status: 'ready',
        reviews: result.data,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      setState({ status: 'error', message: getReviewsErrorMessage(error) });
    }
  }, [page, ratingFilter, propertyFilter, statusFilter, filterTick]);

  useEffect(() => {
    void load();
  }, [load]);

  const applyFilters = useCallback(() => {
    setPage(1);
    setFilterTick((t) => t + 1);
  }, []);

  const runAction = useCallback(
    async (
      review: AdminReviewListItem,
      action: 'approve' | 'hide' | 'delete',
    ) => {
      if (action === 'delete') {
        if (!window.confirm('Supprimer cet avis (suppression logique) ?')) return;
      }
      setActionError(null);
      setActingId(review.id);
      try {
        const client = getApiClient();
        if (action === 'approve') {
          await client.updateReviewStatus(review.id, { status: 'approved' });
        } else if (action === 'hide') {
          await client.updateReviewStatus(review.id, { status: 'hidden' });
        } else {
          await client.deleteReview(review.id);
        }
        await load();
      } catch (error) {
        setActionError(getReviewsErrorMessage(error));
      } finally {
        setActingId(null);
      }
    },
    [load],
  );

  const columns = useMemo<ColumnDef<AdminReviewListItem, unknown>[]>(
    () => [
      {
        accessorKey: 'rating',
        header: 'Note',
        meta: { align: 'center' },
        cell: ({ row }) => (
          <span className="tabular-nums text-sm font-semibold text-atg-fg">
            {row.original.rating}/5
          </span>
        ),
      },
      {
        id: 'author',
        header: 'Auteur',
        cell: ({ row }) => (
          <div>
            <span className="font-medium text-atg-fg">
              {row.original.authorFirstName?.trim() || '—'}
            </span>
            {row.original.authorEmail ? (
              <p className="text-xs text-atg-muted">{row.original.authorEmail}</p>
            ) : null}
          </div>
        ),
      },
      {
        id: 'entity',
        header: 'Entité',
        cell: ({ row }) => (
          <span className="font-mono text-xs text-atg-muted">
            {formatEntity(row.original)}
          </span>
        ),
      },
      {
        id: 'property',
        header: 'Propriété',
        cell: ({ row }) => {
          if (!row.original.propertyName) {
            return <span className="text-atg-muted">—</span>;
          }
          return (
            <span className="text-sm text-atg-fg">{row.original.propertyName}</span>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'Date',
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-atg-muted">
            {formatDateTime(row.original.createdAt)}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Statut',
        meta: { align: 'center' },
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <DataTableBadge variant={statusVariants[status]}>
              {statusLabels[status]}
            </DataTableBadge>
          );
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        meta: { align: 'right' },
        cell: ({ row }) => {
          const review = row.original;
          const busy = actingId === review.id;
          return (
            <div className="flex flex-wrap justify-end gap-1.5">
              <Button
                href={`/contenu/avis/${review.id}`}
                variant="ghost"
                size="sm"
              >
                Voir
              </Button>
              {canWrite && review.status !== 'approved' ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={busy}
                  loading={busy}
                  loadingText="…"
                  onClick={() => void runAction(review, 'approve')}
                >
                  Approuver
                </Button>
              ) : null}
              {canWrite && review.status !== 'hidden' ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={busy}
                  onClick={() => void runAction(review, 'hide')}
                >
                  Masquer
                </Button>
              ) : null}
              {canWrite ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={busy}
                  onClick={() => void runAction(review, 'delete')}
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
    [actingId, canWrite, runAction],
  );

  const isLoading = state.status === 'loading';
  const isError = state.status === 'error';
  const reviews = state.status === 'ready' ? state.reviews : [];
  const hasFilters =
    ratingFilter !== '' || propertyFilter !== '' || statusFilter !== '';

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor={ratingFilterId} className="mb-1 block text-xs font-medium text-atg-muted">
              Note
            </label>
            <select
              id={ratingFilterId}
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="w-full rounded-lg border border-atg-border bg-atg-surface px-3 py-2 text-sm text-atg-fg"
            >
              <option value="">Toutes</option>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={String(n)}>
                  {n}/5
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor={propertyFilterId}
              className="mb-1 block text-xs font-medium text-atg-muted"
            >
              Propriété
            </label>
            <select
              id={propertyFilterId}
              value={propertyFilter}
              onChange={(e) => setPropertyFilter(e.target.value)}
              className="w-full rounded-lg border border-atg-border bg-atg-surface px-3 py-2 text-sm text-atg-fg"
            >
              <option value="">Toutes</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={statusFilterId} className="mb-1 block text-xs font-medium text-atg-muted">
              Statut
            </label>
            <select
              id={statusFilterId}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as '' | ReviewStatus)}
              className="w-full rounded-lg border border-atg-border bg-atg-surface px-3 py-2 text-sm text-atg-fg"
            >
              <option value="">Tous</option>
              {(Object.keys(statusLabels) as ReviewStatus[]).map((s) => (
                <option key={s} value={s}>
                  {statusLabels[s]}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <Button type="button" onClick={applyFilters} className="w-full sm:w-auto">
              Appliquer les filtres
            </Button>
          </div>
        </div>
      </Card>

      {actionError ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {actionError}
        </p>
      ) : null}

      {isError ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {state.message}
        </p>
      ) : null}

      <DataTable
        columns={columns}
        data={reviews}
        isLoading={isLoading}
        emptyMessage={
          hasFilters
            ? 'Aucun avis ne correspond aux filtres.'
            : 'Aucun avis pour le moment.'
        }
      />

      {state.status === 'ready' && state.totalPages > 1 ? (
        <DataTablePagination
          page={page}
          totalPages={state.totalPages}
          total={state.total}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      ) : null}
    </div>
  );
}

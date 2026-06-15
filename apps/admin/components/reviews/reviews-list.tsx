'use client';

import {
  AlertDialog,
  Button,
  Card,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  DataTableBadge,
  DataTablePagination,
  EmptyState,
  StarRatingDisplay,
  useToast,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { AdminReviewListItem, Property, ReviewStatus } from '@africatourismgate/types';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import {
  formatReviewDateTime,
  formatReviewPreview,
  reviewStatusLabels,
  reviewStatusVariants,
} from '../../lib/review-display';
import { getReviewsErrorMessage } from '../../lib/reviews-errors';

const PAGE_SIZE = 20;

export function ReviewsList() {
  const { toast } = useToast();
  const ratingFilterId = useId();
  const propertyFilterId = useId();
  const statusFilterId = useId();

  const [page, setPage] = useState(1);
  const [filterTick, setFilterTick] = useState(0);
  const [ratingFilter, setRatingFilter] = useState('');
  const [propertyFilter, setPropertyFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | ReviewStatus>('pending');
  const [properties, setProperties] = useState<Property[]>([]);
  const [canWrite, setCanWrite] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminReviewListItem | null>(null);
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
      setActionError(null);
      setActingId(review.id);
      try {
        const client = getApiClient();
        if (action === 'approve') {
          await client.updateReviewStatus(review.id, { status: 'approved' });
          toast({
            variant: 'success',
            title: 'Avis approuvé',
            message: 'L’avis est visible côté client.',
          });
        } else if (action === 'hide') {
          await client.updateReviewStatus(review.id, { status: 'hidden' });
          toast({
            variant: 'success',
            title: 'Avis masqué',
            message: 'L’avis n’est plus affiché publiquement.',
          });
        } else {
          await client.deleteReview(review.id);
          toast({
            variant: 'success',
            title: 'Avis supprimé',
            message: 'L’avis a été retiré de la modération.',
          });
          setPendingDelete(null);
        }
        await load();
      } catch (error) {
        setActionError(getReviewsErrorMessage(error));
      } finally {
        setActingId(null);
      }
    },
    [load, toast],
  );

  const confirmDelete = useCallback(async () => {
    if (!pendingDelete) return;
    await runAction(pendingDelete, 'delete');
  }, [pendingDelete, runAction]);

  const columns = useMemo<ColumnDef<AdminReviewListItem, unknown>[]>(
    () => [
      {
        accessorKey: 'rating',
        header: 'Note',
        meta: { align: 'center' },
        cell: ({ row }) => (
          <StarRatingDisplay value={row.original.rating} size="sm" showValue />
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
        id: 'preview',
        header: 'Aperçu',
        cell: ({ row }) => {
          const preview = formatReviewPreview(row.original);
          if (!preview) {
            return <span className="text-sm italic text-atg-muted">—</span>;
          }
          return (
            <p className="line-clamp-2 max-w-md text-sm text-atg-muted" title={preview}>
              {preview}
            </p>
          );
        },
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
            {formatReviewDateTime(row.original.createdAt)}
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
            <DataTableBadge variant={reviewStatusVariants[status]}>
              {reviewStatusLabels[status]}
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
            <DataTableActions className="flex-nowrap gap-1">
              <DataTableActionButton action="view" href={`/contenu/avis/${review.id}`} />
              {canWrite && review.status !== 'approved' ? (
                <Button
                  type="button"
                  variant="secondary"
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
                <DataTableActionButton
                  action="delete"
                  onClick={() => setPendingDelete(review)}
                  disabled={busy}
                />
              ) : null}
            </DataTableActions>
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
    ratingFilter !== '' ||
    propertyFilter !== '' ||
    statusFilter !== 'pending';
  const isEmpty = state.status === 'ready' && state.total === 0;

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
              {(Object.keys(reviewStatusLabels) as ReviewStatus[]).map((s) => (
                <option key={s} value={s}>
                  {reviewStatusLabels[s]}
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

      {isEmpty && !isLoading ? (
        <EmptyState
          title={
            hasFilters
              ? 'Aucun avis ne correspond aux filtres'
              : 'Aucun avis en attente'
          }
          description={
            hasFilters
              ? 'Modifiez les filtres ou affichez tous les statuts pour élargir la recherche.'
              : 'La file de modération est vide. Les nouveaux avis clients apparaîtront ici.'
          }
        />
      ) : (
        <Card variant="dashboard" padding="none" className="overflow-hidden">
          <DataTable
            columns={columns}
            data={reviews}
            isLoading={isLoading}
            emptyMessage={
              hasFilters
                ? 'Aucun avis ne correspond aux filtres.'
                : 'Aucun avis pour le moment.'
            }
            aria-label="Liste des avis à modérer"
          />
        </Card>
      )}

      {state.status === 'ready' && state.totalPages > 1 ? (
        <DataTablePagination
          page={page}
          pageSize={PAGE_SIZE}
          totalPages={state.totalPages}
          totalItems={state.total}
          itemLabel="avis"
          onPageChange={setPage}
        />
      ) : null}

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open && !actingId) setPendingDelete(null);
        }}
        title="Supprimer cet avis"
        description={
          pendingDelete
            ? 'Suppression logique : l’avis ne sera plus visible dans la modération.'
            : undefined
        }
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        loading={actingId === pendingDelete?.id}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}

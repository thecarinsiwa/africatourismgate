'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

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
  FilterBar,
  Select,
  StarRatingDisplay,
  useToast,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { AdminReviewListItem, Property, ReviewStatus } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { usePermissions } from '../../lib/auth/use-permissions';
import {
  useFormatDateTime,
  useReviewStatusFilterOptions,
  useReviewStatusLabels,
} from '../../lib/i18n/use-module-labels';
import {
  formatReviewPreview,
  reviewStatusVariants,
} from '../../lib/review-display';

const PAGE_SIZE = 20;
const DEFAULT_STATUS: ReviewStatus = 'pending';

export function ReviewsList() {
  const { reviews: getReviewsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.reviews');
  const tList = useTranslations('modules.reviews.list');
  const tColumns = useTranslations('modules.common.columns');
  const tCommon = useTranslations('modules.common');
  const tActions = useTranslations('common.actions');
  const tPagination = useTranslations('modules.common.pagination');
  const formatDateTime = useFormatDateTime();
  const statusLabels = useReviewStatusLabels();
  const statusOptions = useReviewStatusFilterOptions();
  const { hasPermission, isSuperAdmin } = usePermissions();
  const canWrite = isSuperAdmin || hasPermission('reviews.write');
  const { toast } = useToast();

  const [page, setPage] = useState(1);
  const [ratingFilter, setRatingFilter] = useState('');
  const [propertyFilter, setPropertyFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | ReviewStatus>(DEFAULT_STATUS);
  const [properties, setProperties] = useState<Property[]>([]);
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
  }, [page, ratingFilter, propertyFilter, statusFilter, getReviewsErrorMessage]);

  useEffect(() => {
    void load();
  }, [load]);

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
            title: t('toast.approved.title'),
            message: t('toast.approved.message'),
          });
        } else if (action === 'hide') {
          await client.updateReviewStatus(review.id, { status: 'hidden' });
          toast({
            variant: 'success',
            title: t('toast.hidden.title'),
            message: t('toast.hidden.message'),
          });
        } else {
          await client.deleteReview(review.id);
          toast({
            variant: 'success',
            title: t('toast.deleted.title'),
            message: t('toast.deleted.message'),
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
    [load, toast, t, getReviewsErrorMessage],
  );

  const confirmDelete = useCallback(async () => {
    if (!pendingDelete) return;
    await runAction(pendingDelete, 'delete');
  }, [pendingDelete, runAction]);

  const emptyDash = tCommon('empty.dash');

  const ratingOptions = useMemo(
    () => [
      { value: '', label: tCommon('filters.allFeminine') },
      ...[5, 4, 3, 2, 1].map((n) => ({ value: String(n), label: `${n}/5` })),
    ],
    [tCommon],
  );

  const propertyOptions = useMemo(
    () => [
      { value: '', label: tCommon('filters.allFeminine') },
      ...properties.map((p) => ({ value: p.id, label: p.name })),
    ],
    [properties, tCommon],
  );

  const activeFilterCount = [
    ratingFilter !== '',
    propertyFilter !== '',
    statusFilter !== DEFAULT_STATUS,
  ].filter(Boolean).length;

  const handleClearFilters = useCallback(() => {
    setRatingFilter('');
    setPropertyFilter('');
    setStatusFilter(DEFAULT_STATUS);
    setPage(1);
  }, []);

  const columns = useMemo<ColumnDef<AdminReviewListItem, unknown>[]>(
    () => [
      {
        accessorKey: 'rating',
        header: tColumns('rating'),
        meta: { align: 'center' },
        cell: ({ row }) => (
          <StarRatingDisplay value={row.original.rating} size="sm" showValue />
        ),
      },
      {
        id: 'author',
        header: tList('columns.author'),
        cell: ({ row }) => (
          <div>
            <span className="font-medium text-atg-fg">
              {row.original.authorFirstName?.trim() || emptyDash}
            </span>
            {row.original.authorEmail ? (
              <p className="text-xs text-atg-muted">{row.original.authorEmail}</p>
            ) : null}
          </div>
        ),
      },
      {
        id: 'preview',
        header: tColumns('preview'),
        cell: ({ row }) => {
          const preview = formatReviewPreview(row.original);
          if (!preview) {
            return <span className="text-sm italic text-atg-muted">{emptyDash}</span>;
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
        header: tList('columns.property'),
        cell: ({ row }) => {
          const label = row.original.propertyName ?? row.original.guideName;
          if (!label) {
            return <span className="text-atg-muted">{emptyDash}</span>;
          }
          return <span className="text-sm text-atg-fg">{label}</span>;
        },
      },
      {
        accessorKey: 'createdAt',
        header: tColumns('date'),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-atg-muted">
            {formatDateTime(row.original.createdAt)}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: tColumns('status'),
        meta: { align: 'center' },
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <DataTableBadge variant={reviewStatusVariants[status]}>
              {statusLabels[status]}
            </DataTableBadge>
          );
        },
      },
      {
        id: 'actions',
        header: tColumns('actions'),
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
                  {t('actions.approve')}
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
                  {t('actions.hide')}
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
    [
      actingId,
      canWrite,
      emptyDash,
      formatDateTime,
      runAction,
      statusLabels,
      t,
      tColumns,
      tList,
    ],
  );

  const isLoading = state.status === 'loading';
  const isError = state.status === 'error';
  const reviews = state.status === 'ready' ? state.reviews : [];
  const hasFilters = activeFilterCount > 0;
  const isEmpty = state.status === 'ready' && state.total === 0;

  return (
    <div className="space-y-6">
      <FilterBar
        mobileVariant="drawer"
        activeCount={activeFilterCount}
        onClear={handleClearFilters}
        clearLabel={tCommon('filters.clearAll')}
        applyLabel={tCommon('filters.apply')}
        toggleLabel={tCommon('filters.toggle')}
        filters={
          <>
            <div className="w-full sm:w-40">
              <Select
                label={tColumns('rating')}
                value={ratingFilter}
                options={ratingOptions}
                onChange={(e) => {
                  setRatingFilter(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="w-full sm:w-56">
              <Select
                label={tList('columns.property')}
                value={propertyFilter}
                options={propertyOptions}
                onChange={(e) => {
                  setPropertyFilter(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="w-full sm:w-44">
              <Select
                label={tColumns('status')}
                value={statusFilter}
                options={statusOptions}
                onChange={(e) => {
                  setStatusFilter(e.target.value as '' | ReviewStatus);
                  setPage(1);
                }}
              />
            </div>
          </>
        }
      />

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
              ? tList('empty.filtered.title')
              : tList('empty.default.title')
          }
          description={
            hasFilters
              ? tList('empty.filtered.description')
              : tList('empty.default.description')
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
                ? tList('empty.filtered.tableMessage')
                : tList('empty.default.tableMessage')
            }
            aria-label={tList('ariaLabel')}
          />
        </Card>
      )}

      {state.status === 'ready' && state.totalPages > 1 ? (
        <DataTablePagination
          page={page}
          pageSize={PAGE_SIZE}
          totalPages={state.totalPages}
          totalItems={state.total}
          itemLabel={tPagination('review')}
          onPageChange={setPage}
        />
      ) : null}

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open && !actingId) setPendingDelete(null);
        }}
        title={t('deleteDialog.title')}
        description={
          pendingDelete ? t('deleteDialog.description') : undefined
        }
        confirmLabel={tActions('delete')}
        cancelLabel={tActions('cancel')}
        variant="danger"
        loading={actingId === pendingDelete?.id}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}

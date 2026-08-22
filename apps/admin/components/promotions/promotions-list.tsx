'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  AlertDialog,
  Card,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  DataTableBadge,
  DataTablePagination,
  FilterBar,
  Input,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { Promotion } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { usePromoDiscountLabels, usePromoUsageLabels } from '../../lib/i18n/use-module-labels';
import { useDataTablePaginationLabels } from '../../lib/i18n/use-pagination-labels';
import {
  formatPromoUsageLabel,
  formatPromotionValidityDisplay,
  getPromoUsageBadgeVariant,
} from '../../lib/promo-validity';
import {
  PromotionPreviewBanner,
  promotionToPreviewProps,
} from './promotion-preview-banner';

import type { PromotionsListFilter } from '../../config/promotions-kpi';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

type PromotionsListProps = {
  listFilter: PromotionsListFilter;
};

export function PromotionsList({ listFilter }: PromotionsListProps) {
  const { promotions: getPromotionsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.promotions.list');
  const tStatus = useTranslations('modules.promotions.status');
  const tCommon = useTranslations('modules.common');
  const tDataTable = useTranslations('modules.common.dataTable');
  const tUsage = usePromoUsageLabels();
  const discountLabels = usePromoDiscountLabels();
  const paginationLabels = useDataTablePaginationLabels();
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
  const [confirmTarget, setConfirmTarget] = useState<Promotion | null>(null);

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
        ...listFilter,
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
  }, [page, search, listFilter, getPromotionsErrorMessage]);

  useEffect(() => {
    setPage(1);
  }, [listFilter]);

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

  const hasKpiFilter =
    listFilter.active !== undefined ||
    listFilter.validity !== undefined ||
    listFilter.hasDiscount !== undefined;
  const activeFilterCount = (search !== '' ? 1 : 0) + (hasKpiFilter ? 1 : 0);
  const hasFilters = activeFilterCount > 0;

  const handleClearFilters = useCallback(() => {
    setSearchInput('');
    setSearch('');
    setPage(1);
  }, []);

  const handleDeleteRequest = useCallback((promo: Promotion) => {
    setConfirmTarget(promo);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!confirmTarget) return;
    const promo = confirmTarget;
    setConfirmTarget(null);
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
  }, [confirmTarget, getPromotionsErrorMessage, load]);

  const columns = useMemo<ColumnDef<Promotion, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t('columns.campaign'),
        cell: ({ row }) => (
          <div className="max-w-md min-w-0 space-y-2">
            <PromotionPreviewBanner
              {...promotionToPreviewProps(row.original)}
              compact
            />
          </div>
        ),
      },
      {
        id: 'validity',
        header: t('columns.validity'),
        meta: { hideOnMobile: true },
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm tabular-nums text-atg-muted">
            {formatPromotionValidityDisplay(
              row.original.validFrom,
              row.original.validUntil,
              discountLabels,
            )}
          </span>
        ),
      },
      {
        id: 'usage',
        header: t('columns.usage'),
        meta: { align: 'center', hideOnMobile: true },
        cell: ({ row }) => {
          const promo = row.original;
          return (
            <DataTableBadge
              variant={getPromoUsageBadgeVariant(promo.redemptionCount, promo.maxRedemptions)}
              className="tabular-nums"
            >
              {formatPromoUsageLabel(
                promo.redemptionCount,
                promo.maxRedemptions,
                tUsage.format,
                tUsage.unlimitedMax,
              )}
            </DataTableBadge>
          );
        },
      },
      {
        id: 'active',
        header: t('columns.status'),
        meta: { align: 'center' },
        cell: ({ row }) => (
          <DataTableBadge variant={row.original.active === 1 ? 'success' : 'muted'}>
            {row.original.active === 1 ? tStatus('active') : tStatus('inactive')}
          </DataTableBadge>
        ),
      },
      {
        id: 'actions',
        header: tCommon('columns.actions'),
        meta: { align: 'right' },
        cell: ({ row }) => {
          const promo = row.original;
          return (
            <DataTableActions>
              <DataTableActionButton action="edit" href={`/paiements/promotions/${promo.id}`} />
              {canWrite ? (
                <DataTableActionButton
                  action="delete"
                  onClick={() => handleDeleteRequest(promo)}
                  disabled={deletingId === promo.id}
                  loading={deletingId === promo.id}
                />
              ) : null}
            </DataTableActions>
          );
        },
      },
    ],
    [canWrite, deletingId, discountLabels, handleDeleteRequest, t, tCommon, tStatus, tUsage],
  );

  const isLoading = state.status === 'loading';
  const isError = state.status === 'error';
  const promotions = state.status === 'ready' ? state.promotions : [];
  const emptyMessage = hasFilters ? t('emptySearch') : t('emptyDefault');

  return (
    <>
      <AlertDialog
        open={!!confirmTarget}
        onOpenChange={(open) => {
          if (!open) setConfirmTarget(null);
        }}
        title={t('deleteTitle')}
        description={confirmTarget ? t('deleteConfirm', { name: confirmTarget.name }) : ''}
        confirmLabel={t('deleteConfirmButton')}
        cancelLabel={t('cancel')}
        variant="danger"
        loading={!!deletingId}
        error={deleteError}
        onConfirm={() => void handleDeleteConfirm()}
      />
      <div className="space-y-6">
        <FilterBar
          mobileVariant="drawer"
          activeCount={activeFilterCount}
          onClear={handleClearFilters}
          clearLabel={tCommon('filters.clearAll')}
          applyLabel={tCommon('filters.apply')}
          toggleLabel={tCommon('filters.toggle')}
          filters={
            <div className="min-w-[200px] flex-1 sm:max-w-md">
              <Input
                name="search"
                type="search"
                placeholder={t('searchPlaceholder')}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                aria-label={t('searchAria')}
              />
            </div>
          }
        />

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
                loadingMessage={tDataTable('loading')}
                emptyMessage={emptyMessage}
                emptyVariant={hasFilters ? 'search' : 'default'}
                expandRowLabel={tDataTable('expandRow')}
                collapseRowLabel={tDataTable('collapseRow')}
                expandRowAriaLabel={tDataTable('expandRowAria')}
                getRowId={(row) => row.id}
                aria-label={t('tableAria')}
              />
            </Card>

            {state.status === 'ready' ? (
              <DataTablePagination
                page={page}
                pageSize={PAGE_SIZE}
                totalPages={state.totalPages}
                totalItems={state.total}
                itemLabel={t('paginationItem')}
                labels={paginationLabels}
                onPageChange={setPage}
              />
            ) : null}
          </>
        )}
      </div>
    </>
  );
}

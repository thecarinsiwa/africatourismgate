'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

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
import type { Promotion } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { usePromoDiscountLabels } from '../../lib/i18n/use-module-labels';
import {
  formatPromoUsageLabel,
  formatPromotionValidityDisplay,
  getPromoUsageBadgeVariant,
} from '../../lib/promo-validity';
import {
  PromotionPreviewBanner,
  promotionToPreviewProps,
} from './promotion-preview-banner';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

export function PromotionsList() {
  const { promotions: getPromotionsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.promotions.list');
  const tStatus = useTranslations('modules.promotions.status');
  const tCommon = useTranslations('modules.common');
  const tUsage = useTranslations('modules.promoCodes.usage');
  const discountLabels = usePromoDiscountLabels();
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
  }, [page, search, getPromotionsErrorMessage]);

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
      if (!window.confirm(t('deleteConfirm', { name: promo.name }))) return;
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
    [load, t, getPromotionsErrorMessage],
  );

  const columns = useMemo<ColumnDef<Promotion, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t('columns.campaign'),
        cell: ({ row }) => (
          <div className="max-w-md space-y-2">
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
        meta: { align: 'center' },
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
                tUsage('format'),
                tUsage('unlimitedMax'),
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
    [canWrite, deletingId, discountLabels, handleDelete, t, tCommon, tStatus, tUsage],
  );

  const isLoading = state.status === 'loading';
  const isError = state.status === 'error';
  const promotions = state.status === 'ready' ? state.promotions : [];
  const emptyMessage = search.trim() ? t('emptySearch') : t('emptyDefault');

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 sm:max-w-md">
          <Input
            name="search"
            type="search"
            placeholder={t('searchPlaceholder')}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            aria-label={t('searchAria')}
          />
        </div>
        {canWrite ? (
          <Button href="/paiements/promotions/nouveau">{t('newButton')}</Button>
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
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}
    </div>
  );
}

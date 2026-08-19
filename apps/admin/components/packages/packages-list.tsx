'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  AlertDialog,
  Button,
  Card,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  DataTablePagination,
  Input,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { Package, PackageDetail } from '@africatourismgate/types';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { resolveMediaUrl } from '../../lib/resolve-media-url';
import { usePackageStatusLabels } from '../../lib/i18n/use-module-labels';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

function formatMoney(cents: number, currency: string): string {
  return `${(cents / 100).toFixed(2)} ${currency}`;
}

type PackageRow = Package & {
  totalCents?: number;
  currency?: string;
  imageUrl?: string | null;
};

export function PackagesList() {
  const { packages: getPackagesErrorMessage } = useAdminErrorMessages();
  const tList = useTranslations('modules.packages.list');
  const tColumns = useTranslations('modules.packages.columns');
  const tCommonColumns = useTranslations('modules.common.columns');
  const tPagination = useTranslations('modules.common.pagination');
  const packageStatusLabels = usePackageStatusLabels();
  const tEmpty = useTranslations('modules.common.empty');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; packages: PackageRow[]; total: number; totalPages: number }
  >({ status: 'loading' });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<Package | null>(null);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listPackages({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
      });
      const details = await Promise.all(
        result.data.map((pkg) =>
          getApiClient()
            .getPackage(pkg.id)
            .then((d: PackageDetail) => ({
              ...pkg,
              totalCents: d.pricing.totalCents,
              currency: d.pricing.currency,
            }))
            .catch(() => ({ ...pkg })),
        ),
      );
      setState({
        status: 'ready',
        packages: details,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      setState({ status: 'error', message: getPackagesErrorMessage(error) });
    }
  }, [page, search, getPackagesErrorMessage]);

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

  const handleDeleteRequest = useCallback((pkg: Package) => {
    setConfirmTarget(pkg);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!confirmTarget) return;
    const pkg = confirmTarget;
    setConfirmTarget(null);
    setDeleteError(null);
    setDeletingId(pkg.id);
    try {
      await getApiClient().deletePackage(pkg.id);
      await load();
    } catch (error) {
      setDeleteError(getPackagesErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  }, [confirmTarget, getPackagesErrorMessage, load]);

  const columns = useMemo<ColumnDef<PackageRow, unknown>[]>(
    () => [
      {
        id: 'cover',
        header: tColumns('cover'),
        meta: { align: 'center' },
        cell: ({ row }) => {
          const imageUrl = row.original.imageUrl ?? row.original.coverImageUrl;
          if (!imageUrl?.trim()) {
            return <span className="text-sm text-atg-muted">{tEmpty('dash')}</span>;
          }
          return (
            <div className="relative mx-auto h-12 w-16 overflow-hidden rounded-md border border-atg-border">
              <Image
                src={resolveMediaUrl(imageUrl.trim())}
                alt=""
                fill
                unoptimized
                className="object-cover"
                sizes="64px"
              />
            </div>
          );
        },
      },
      {
        accessorKey: 'name',
        header: tColumns('package'),
        cell: ({ row }) => (
          <span className="font-medium text-atg-fg">{row.original.name}</span>
        ),
      },
      {
        id: 'discount',
        header: tColumns('discount'),
        meta: { align: 'center' },
        cell: ({ row }) => (
          <span className="text-sm tabular-nums">{row.original.discountPercent}%</span>
        ),
      },
      {
        id: 'total',
        header: tColumns('total'),
        meta: { align: 'right' },
        cell: ({ row }) =>
          row.original.totalCents != null && row.original.currency ? (
            <span className="tabular-nums text-sm">
              {formatMoney(row.original.totalCents, row.original.currency)}
            </span>
          ) : (
            <span className="text-sm text-atg-muted">{tEmpty('dash')}</span>
          ),
      },
      {
        id: 'active',
        header: tColumns('active'),
        meta: { align: 'center' },
        cell: ({ row }) =>
          row.original.active === 1
            ? packageStatusLabels.active
            : packageStatusLabels.inactive,
      },
      {
        id: 'actions',
        header: tCommonColumns('actions'),
        meta: { align: 'right' },
        cell: ({ row }) => {
          const pkg = row.original;
          return (
            <DataTableActions>
              <DataTableActionButton
                action="view"
                href={`/produits/forfaits/${pkg.id}/voir`}
              />
              <DataTableActionButton action="edit" href={`/produits/forfaits/${pkg.id}`} />
              <DataTableActionButton
                action="delete"
                onClick={() => handleDeleteRequest(pkg)}
                disabled={deletingId === pkg.id}
                loading={deletingId === pkg.id}
              />
            </DataTableActions>
          );
        },
      },
    ],
    [deletingId, handleDeleteRequest, packageStatusLabels, tColumns, tCommonColumns, tEmpty],
  );

  const packages = state.status === 'ready' ? state.packages : [];

  return (
    <>
      <AlertDialog
        open={!!confirmTarget}
        onOpenChange={(open) => { if (!open) setConfirmTarget(null); }}
        title={tList('deleteTitle')}
        description={confirmTarget ? tList('deleteConfirm', { name: confirmTarget.name }) : ''}
        confirmLabel={tList('deleteConfirmButton')}
        cancelLabel={tList('cancel')}
        variant="danger"
        loading={!!deletingId}
        error={deleteError}
        onConfirm={() => void handleDeleteConfirm()}
      />
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 sm:max-w-md">
          <Input
            type="search"
            placeholder={tList('searchPlaceholder')}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <Button href="/produits/forfaits/nouveau">{tList('newPackage')}</Button>
      </div>

      {state.status === 'error' ? (
        <p role="alert" className="text-sm text-red-600">
          {state.message}
        </p>
      ) : (
        <>
          <Card variant="dashboard" padding="none" className="overflow-hidden">
            <DataTable
              columns={columns}
              data={packages}
              isLoading={state.status === 'loading'}
              emptyMessage={tList('emptyDefault')}
              getRowId={(row) => row.id}
            />
          </Card>
          {state.status === 'ready' ? (
            <DataTablePagination
              page={page}
              pageSize={PAGE_SIZE}
              totalPages={state.totalPages}
              totalItems={state.total}
              itemLabel={tPagination('package')}
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}
    </div>
    </>
  );
}

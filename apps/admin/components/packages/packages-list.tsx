'use client';

import {
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
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { getPackagesErrorMessage } from '../../lib/packages-errors';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

function formatMoney(cents: number, currency: string): string {
  return `${(cents / 100).toFixed(2)} ${currency}`;
}

type PackageRow = Package & { totalCents?: number; currency?: string };

export function PackagesList() {
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
    async (pkg: Package) => {
      if (!window.confirm(`Supprimer le forfait « ${pkg.name} » ?`)) return;
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
    },
    [load],
  );

  const columns = useMemo<ColumnDef<PackageRow, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Forfait',
        cell: ({ row }) => (
          <span className="font-medium text-atg-fg">{row.original.name}</span>
        ),
      },
      {
        id: 'discount',
        header: 'Remise',
        meta: { align: 'center' },
        cell: ({ row }) => (
          <span className="text-sm tabular-nums">{row.original.discountPercent}%</span>
        ),
      },
      {
        id: 'total',
        header: 'Total',
        meta: { align: 'right' },
        cell: ({ row }) =>
          row.original.totalCents != null && row.original.currency ? (
            <span className="tabular-nums text-sm">
              {formatMoney(row.original.totalCents, row.original.currency)}
            </span>
          ) : (
            <span className="text-sm text-atg-muted">—</span>
          ),
      },
      {
        id: 'active',
        header: 'Actif',
        meta: { align: 'center' },
        cell: ({ row }) => (row.original.active === 1 ? 'Oui' : 'Non'),
      },
      {
        id: 'actions',
        header: 'Actions',
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
                onClick={() => void handleDelete(pkg)}
                disabled={deletingId === pkg.id}
                loading={deletingId === pkg.id}
              />
            </DataTableActions>
          );
        },
      },
    ],
    [deletingId, handleDelete],
  );

  const packages = state.status === 'ready' ? state.packages : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 sm:max-w-md">
          <Input
            type="search"
            placeholder="Rechercher un forfait…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <Button href="/produits/forfaits/nouveau">Nouveau forfait</Button>
      </div>

      {deleteError ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {deleteError}
        </p>
      ) : null}

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
              emptyMessage="Aucun forfait pour le moment."
              getRowId={(row) => row.id}
            />
          </Card>
          {state.status === 'ready' ? (
            <DataTablePagination
              page={page}
              pageSize={PAGE_SIZE}
              totalPages={state.totalPages}
              totalItems={state.total}
              itemLabel="forfait"
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}
    </div>
  );
}

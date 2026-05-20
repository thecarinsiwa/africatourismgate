'use client';

import { Card, DataTable, DataTablePagination, Input, type ColumnDef } from '@africatourismgate/ui';
import type { Permission } from '@africatourismgate/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { getRbacErrorMessage } from '../../lib/rbac-errors';
import { RbacSubnav } from './rbac-subnav';

const PAGE_SIZE = 20;

export function PermissionsList() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; permissions: Permission[]; total: number; totalPages: number }
  >({ status: 'loading' });

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listPermissions({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
      });
      setState({
        status: 'ready',
        permissions: result.data,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      setState({ status: 'error', message: getRbacErrorMessage(error) });
    }
  }, [page, search]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch((prev) => {
        const q = searchInput.trim();
        if (prev !== q) setPage(1);
        return q;
      });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const columns = useMemo<ColumnDef<Permission, unknown>[]>(
    () => [
      { accessorKey: 'resource', header: 'Ressource' },
      { accessorKey: 'action', header: 'Action' },
      {
        accessorKey: 'code',
        header: 'Code',
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.code}</span>
        ),
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => (
          <span className="text-atg-muted">{row.original.description ?? '—'}</span>
        ),
      },
    ],
    [],
  );

  const permissions = state.status === 'ready' ? state.permissions : [];

  return (
    <div className="space-y-6">
      <RbacSubnav />
      <p className="text-sm text-atg-muted">
        Catalogue des permissions (lecture seule). Modifiez les droits via la matrice sur chaque
        rôle.
      </p>
      <div className="max-w-md">
        <Input
          type="search"
          placeholder="Rechercher…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
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
              data={permissions}
              isLoading={state.status === 'loading'}
              emptyMessage="Aucune permission."
              getRowId={(p) => p.id}
            />
          </Card>
          {state.status === 'ready' ? (
            <DataTablePagination
              page={page}
              pageSize={PAGE_SIZE}
              totalPages={state.totalPages}
              totalItems={state.total}
              itemLabel="permission"
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}
    </div>
  );
}

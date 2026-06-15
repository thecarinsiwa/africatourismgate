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
import type { Role } from '@africatourismgate/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { getRbacErrorMessage } from '../../lib/rbac-errors';
import { RbacSubnav } from './rbac-subnav';

const PAGE_SIZE = 20;

export function RolesList() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; roles: Role[]; total: number; totalPages: number }
  >({ status: 'loading' });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listRoles({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        includeSystem: true,
      });
      setState({
        status: 'ready',
        roles: result.data,
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

  const handleDelete = useCallback(
    async (role: Role) => {
      if (role.isSystem) return;
      if (!window.confirm(`Supprimer le rôle « ${role.name} » ?`)) return;
      setDeletingId(role.id);
      try {
        await getApiClient().deleteRole(role.id);
        await load();
      } catch (error) {
        window.alert(getRbacErrorMessage(error));
      } finally {
        setDeletingId(null);
      }
    },
    [load],
  );

  const columns = useMemo<ColumnDef<Role, unknown>[]>(
    () => [
      {
        accessorKey: 'code',
        header: 'Code',
        cell: ({ row }) => (
          <span className="font-mono text-sm text-atg-fg">{row.original.code}</span>
        ),
      },
      {
        accessorKey: 'name',
        header: 'Nom',
        cell: ({ row }) => (
          <span className="font-medium text-atg-fg">{row.original.name}</span>
        ),
      },
      {
        id: 'type',
        header: 'Type',
        meta: { align: 'center' },
        cell: ({ row }) => (
          <DataTableBadge variant={row.original.isSystem ? 'muted' : 'success'}>
            {row.original.isSystem ? 'Système' : 'Personnalisé'}
          </DataTableBadge>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        meta: { align: 'right' },
        cell: ({ row }) => {
          const role = row.original;
          return (
            <DataTableActions>
              <DataTableActionButton
                action={role.isSystem ? 'view' : 'edit'}
                href={`/systeme/roles/${role.id}`}
              />
              {!role.isSystem ? (
                <DataTableActionButton
                  action="delete"
                  onClick={() => void handleDelete(role)}
                  disabled={deletingId === role.id}
                  loading={deletingId === role.id}
                />
              ) : null}
            </DataTableActions>
          );
        },
      },
    ],
    [deletingId, handleDelete],
  );

  const roles = state.status === 'ready' ? state.roles : [];

  return (
    <div className="space-y-6">
      <RbacSubnav />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-[200px] flex-1 sm:max-w-md">
          <Input
            type="search"
            placeholder="Rechercher par code ou nom…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <Button href="/systeme/roles/nouveau">Nouveau rôle</Button>
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
              data={roles}
              isLoading={state.status === 'loading'}
              emptyMessage="Aucun rôle trouvé."
              getRowId={(r) => r.id}
              aria-label="Liste des rôles"
            />
          </Card>
          {state.status === 'ready' ? (
            <DataTablePagination
              page={page}
              pageSize={PAGE_SIZE}
              totalPages={state.totalPages}
              totalItems={state.total}
              itemLabel="rôle"
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}
    </div>
  );
}

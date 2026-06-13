'use client';

import {
  Card,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  DataTablePagination,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { UserRoleAssignment } from '@africatourismgate/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { getRbacErrorMessage } from '../../lib/rbac-errors';
import { RbacSubnav } from './rbac-subnav';
import { UserRoleAssignmentForm } from './user-role-assignment-form';

const PAGE_SIZE = 20;

function scopeLabel(row: UserRoleAssignment): string {
  if (row.scopeType === 'global') return 'Global';
  return `${row.scopeType}${row.scopeId ? `: ${row.scopeId.slice(0, 8)}…` : ''}`;
}

export function UserRoleAssignmentsList() {
  const [page, setPage] = useState(1);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | {
        status: 'ready';
        assignments: UserRoleAssignment[];
        total: number;
        totalPages: number;
      }
  >({ status: 'loading' });
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listUserRoleAssignments({
        page,
        limit: PAGE_SIZE,
        includeRevoked: false,
      });
      setState({
        status: 'ready',
        assignments: result.data,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      setState({ status: 'error', message: getRbacErrorMessage(error) });
    }
  }, [page]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleRevoke = useCallback(
    async (row: UserRoleAssignment) => {
      if (!window.confirm('Révoquer cette assignation de rôle ?')) return;
      setRevokingId(row.id);
      try {
        await getApiClient().revokeUserRoleAssignment(row.id);
        await load();
      } catch (error) {
        window.alert(getRbacErrorMessage(error));
      } finally {
        setRevokingId(null);
      }
    },
    [load],
  );

  const columns = useMemo<ColumnDef<UserRoleAssignment, unknown>[]>(
    () => [
      {
        id: 'user',
        header: 'Utilisateur',
        cell: ({ row }) => {
          const u = row.original.user;
          return u ? (
            <span>
              {u.firstName} {u.lastName}
              <span className="block text-xs text-atg-muted">{u.email}</span>
            </span>
          ) : (
            row.original.userId.slice(0, 8)
          );
        },
      },
      {
        id: 'role',
        header: 'Rôle',
        cell: ({ row }) => {
          const r = row.original.role;
          return r ? `${r.name} (${r.code})` : row.original.roleId.slice(0, 8);
        },
      },
      {
        id: 'scope',
        header: 'Périmètre',
        cell: ({ row }) => <span className="text-atg-muted">{scopeLabel(row.original)}</span>,
      },
      {
        id: 'actions',
        header: 'Actions',
        meta: { align: 'right' },
        cell: ({ row }) => (
          <DataTableActions>
            <DataTableActionButton
              action="revoke"
              onClick={() => void handleRevoke(row.original)}
              disabled={revokingId === row.original.id}
              loading={revokingId === row.original.id}
            />
          </DataTableActions>
        ),
      },
    ],
    [handleRevoke, revokingId],
  );

  const rows = state.status === 'ready' ? state.assignments : [];

  return (
    <div className="space-y-6">
      <RbacSubnav />
      <UserRoleAssignmentForm onSuccess={() => void load()} />
      {state.status === 'error' ? (
        <p role="alert" className="text-sm text-red-600">
          {state.message}
        </p>
      ) : (
        <>
          <Card variant="dashboard" padding="none" className="overflow-hidden">
            <DataTable
              columns={columns}
              data={rows}
              isLoading={state.status === 'loading'}
              emptyMessage="Aucune assignation active."
              getRowId={(r) => r.id}
            />
          </Card>
          {state.status === 'ready' ? (
            <DataTablePagination
              page={page}
              pageSize={PAGE_SIZE}
              totalPages={state.totalPages}
              totalItems={state.total}
              itemLabel="assignation"
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}
    </div>
  );
}

'use client';

import {
  Card,
  DataTable,
  DataTableBadge,
  DataTablePagination,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { UserPaymentMethod } from '@africatourismgate/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { getUsersErrorMessage } from '../../lib/users-errors';

const PAGE_SIZE = 20;

export function UserPaymentMethodsList() {
  const [page, setPage] = useState(1);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | {
        status: 'ready';
        rows: UserPaymentMethod[];
        total: number;
        totalPages: number;
      }
  >({ status: 'loading' });

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listUserPaymentMethods({
        page,
        limit: PAGE_SIZE,
      });
      setState({
        status: 'ready',
        rows: result.data,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      setState({ status: 'error', message: getUsersErrorMessage(error) });
    }
  }, [page]);

  useEffect(() => {
    void load();
  }, [load]);

  const columns = useMemo<ColumnDef<UserPaymentMethod, unknown>[]>(
    () => [
      {
        id: 'type',
        header: 'Type',
        cell: ({ row }) => row.original.type,
      },
      {
        id: 'provider',
        header: 'Fournisseur',
        cell: ({ row }) => row.original.provider?.trim() || '—',
      },
      {
        id: 'lastFour',
        header: 'Fin',
        cell: ({ row }) => (row.original.lastFour ? `•••• ${row.original.lastFour}` : '—'),
      },
      {
        id: 'userId',
        header: 'Utilisateur',
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.userId.slice(0, 8)}…</span>
        ),
      },
      {
        id: 'default',
        header: 'Par défaut',
        cell: ({ row }) =>
          row.original.isDefault ? (
            <DataTableBadge variant="success">Oui</DataTableBadge>
          ) : (
            <DataTableBadge variant="muted">Non</DataTableBadge>
          ),
      },
    ],
    [],
  );

  if (state.status === 'loading') {
    return <p className="text-sm text-atg-muted">Chargement…</p>;
  }

  if (state.status === 'error') {
    return (
      <p role="alert" className="text-sm text-red-600 dark:text-red-400">
        {state.message}
      </p>
    );
  }

  return (
    <Card variant="dashboard" padding="none" className="overflow-hidden">
      <DataTable
        columns={columns}
        data={state.rows}
        getRowId={(row) => row.id}
        aria-label="Liste des moyens de paiement"
      />
      <DataTablePagination
        page={page}
        pageSize={PAGE_SIZE}
        totalPages={state.totalPages}
        totalItems={state.total}
        itemLabel="moyen de paiement"
        onPageChange={setPage}
      />
    </Card>
  );
}

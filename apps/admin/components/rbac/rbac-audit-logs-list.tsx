'use client';

import {
  Card,
  DataTable,
  DataTableBadge,
  DataTablePagination,
  type ColumnDef,
} from '@africatourismgate/ui';
import {
  RBAC_AUDIT_EVENT_LABELS,
  RBAC_AUDIT_EVENT_TYPES,
  type RbacAuditEventType,
  type RbacAuditLog,
  type User,
} from '@africatourismgate/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { getRbacErrorMessage } from '../../lib/rbac-errors';
import { RbacSubnav } from './rbac-subnav';

const PAGE_SIZE = 20;

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      dateStyle: 'short',
      timeStyle: 'medium',
    });
  } catch {
    return iso;
  }
}

function payloadPreview(payload: Record<string, unknown> | null): string {
  if (!payload) return '—';
  const text = JSON.stringify(payload);
  return text.length > 80 ? `${text.slice(0, 80)}…` : text;
}

export function RbacAuditLogsList() {
  const [page, setPage] = useState(1);
  const [filterTick, setFilterTick] = useState(0);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [eventType, setEventType] = useState<RbacAuditEventType | ''>('');
  const [actorUserId, setActorUserId] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [access, setAccess] = useState<
    | { status: 'checking' }
    | { status: 'denied' }
    | { status: 'allowed' }
  >({ status: 'checking' });
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; logs: RbacAuditLog[]; total: number; totalPages: number }
  >({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    async function checkAccess() {
      try {
        const me = await getApiClient().getAuthMe();
        if (!cancelled) {
          setAccess(me.isSuperAdmin ? { status: 'allowed' } : { status: 'denied' });
        }
      } catch {
        if (!cancelled) setAccess({ status: 'denied' });
      }
    }
    void checkAccess();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (access.status !== 'allowed') return;
    let cancelled = false;
    async function loadUsers() {
      try {
        const result = await getApiClient().listUsers({
          page: 1,
          limit: 100,
          status: 'active',
        });
        if (!cancelled) setUsers(result.data);
      } catch {
        if (!cancelled) setUsers([]);
      }
    }
    void loadUsers();
    return () => {
      cancelled = true;
    };
  }, [access.status]);

  const load = useCallback(async () => {
    if (access.status !== 'allowed') return;
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listRbacAuditLogs({
        page,
        limit: PAGE_SIZE,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        eventType: eventType || undefined,
        actorUserId: actorUserId || undefined,
      });
      setState({
        status: 'ready',
        logs: result.data,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      setState({ status: 'error', message: getRbacErrorMessage(error) });
    }
  }, [access.status, page, dateFrom, dateTo, eventType, actorUserId, filterTick]);

  useEffect(() => {
    void load();
  }, [load]);

  const applyFilters = useCallback(() => {
    setPage(1);
    setFilterTick((t) => t + 1);
  }, []);

  const columns = useMemo<ColumnDef<RbacAuditLog, unknown>[]>(
    () => [
      {
        accessorKey: 'createdAt',
        header: 'Date',
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm">
            {formatDateTime(row.original.createdAt)}
          </span>
        ),
      },
      {
        accessorKey: 'eventType',
        header: 'Action',
        cell: ({ row }) => (
          <DataTableBadge variant="muted">
            {RBAC_AUDIT_EVENT_LABELS[row.original.eventType] ?? row.original.eventType}
          </DataTableBadge>
        ),
      },
      {
        id: 'actor',
        header: 'Acteur',
        cell: ({ row }) => {
          const log = row.original;
          return log.actor ? (
            <span className="text-sm">
              {log.actor.firstName} {log.actor.lastName}
              <span className="block text-xs text-atg-muted">{log.actor.email}</span>
            </span>
          ) : (
            <span className="text-sm text-atg-muted">{log.actorUserId ?? '—'}</span>
          );
        },
      },
      {
        id: 'target',
        header: 'Cible',
        cell: ({ row }) => (
          <span className="font-mono text-xs text-atg-muted">
            {row.original.targetUserId
              ? `${row.original.targetUserId.slice(0, 8)}…`
              : '—'}
          </span>
        ),
      },
      {
        accessorKey: 'ipAddress',
        header: 'IP',
        cell: ({ row }) => (
          <span className="text-sm text-atg-muted">{row.original.ipAddress ?? '—'}</span>
        ),
      },
      {
        id: 'payload',
        header: 'Détail',
        cell: ({ row }) => (
          <span
            className="max-w-xs truncate text-xs text-atg-muted"
            title={payloadPreview(row.original.payload)}
          >
            {payloadPreview(row.original.payload)}
          </span>
        ),
      },
    ],
    [],
  );

  if (access.status === 'checking') {
    return (
      <>
        <RbacSubnav />
        <p className="text-sm text-atg-muted">Vérification des droits…</p>
      </>
    );
  }

  if (access.status === 'denied') {
    return (
      <>
        <RbacSubnav />
        <Card className="p-6">
          <p role="alert" className="text-sm text-red-600">
            Cette page est réservée au super administrateur. Connectez-vous avec{' '}
            <strong>admin@africatourismgate.local</strong> ou un compte disposant du rôle{' '}
            <code className="rounded bg-atg-elevated px-1">super_admin</code>.
          </p>
        </Card>
      </>
    );
  }

  return (
    <>
      <RbacSubnav />

      <Card className="mb-6 p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-atg-muted">
              Date début
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full rounded-lg border border-atg-border bg-atg-elevated px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-atg-muted">Date fin</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full rounded-lg border border-atg-border bg-atg-elevated px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-atg-muted">
              Type d&apos;événement
            </label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value as RbacAuditEventType | '')}
              className="w-full rounded-lg border border-atg-border bg-atg-elevated px-3 py-2 text-sm"
            >
              <option value="">Tous</option>
              {RBAC_AUDIT_EVENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {RBAC_AUDIT_EVENT_LABELS[type]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-atg-muted">
              Utilisateur (acteur)
            </label>
            <select
              value={actorUserId}
              onChange={(e) => setActorUserId(e.target.value)}
              className="w-full rounded-lg border border-atg-border bg-atg-elevated px-3 py-2 text-sm"
            >
              <option value="">Tous</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.firstName} {u.lastName} — {u.email}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={applyFilters}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Appliquer les filtres
          </button>
        </div>
      </Card>

      {state.status === 'error' ? (
        <p role="alert" className="mb-4 text-sm text-red-600">
          {state.message}
        </p>
      ) : null}

      <DataTable
        columns={columns}
        data={state.status === 'ready' ? state.logs : []}
        isLoading={state.status === 'loading'}
        emptyMessage="Aucun événement pour ces critères."
      />

      {state.status === 'ready' && state.totalPages > 1 ? (
        <DataTablePagination
          page={page}
          totalPages={state.totalPages}
          total={state.total}
          onPageChange={setPage}
        />
      ) : null}
    </>
  );
}

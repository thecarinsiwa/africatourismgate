'use client';

import {
  Avatar,
  Card,
  DataTablePagination,
  FilterBar,
  Skeleton,
  useToast,
} from '@africatourismgate/ui';
import {
  RBAC_AUDIT_EVENT_LABELS,
  RBAC_AUDIT_EVENT_TYPES,
} from '@africatourismgate/types/rbac';
import type {
  RbacAuditEventType,
  RbacAuditLog,
  User,
} from '@africatourismgate/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { getRbacErrorMessage } from '../../lib/rbac-errors';
import { UserIdFilterBar } from '../users/user-id-filter-bar';
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

function eventIcon(eventType: RbacAuditEventType): string {
  if (eventType.startsWith('role_') && !eventType.includes('permission')) return '🛡';
  if (eventType.startsWith('permission_') || eventType.includes('permission')) return '🔑';
  if (eventType.startsWith('user_role_')) return '👤';
  if (eventType.startsWith('impersonation_')) return '🎭';
  if (eventType === 'permission_denied') return '🔒';
  return '📋';
}

function eventAccentClass(eventType: RbacAuditEventType): string {
  if (eventType === 'permission_denied') {
    return 'bg-atg-danger-light text-atg-danger-fg ring-atg-danger/25';
  }
  if (eventType.startsWith('user_role_granted') || eventType.includes('granted')) {
    return 'bg-atg-success-light text-atg-success-fg ring-atg-success/25';
  }
  if (eventType.includes('revoked') || eventType.includes('deleted')) {
    return 'bg-atg-warning-light text-atg-warning-fg ring-atg-warning/25';
  }
  return 'bg-atg-surface text-atg-fg ring-atg-border/80';
}

function AuditTimelineItem({ log }: { log: RbacAuditLog }) {
  const label = RBAC_AUDIT_EVENT_LABELS[log.eventType] ?? log.eventType;
  const [expanded, setExpanded] = useState(false);
  const hasPayload = log.payload && Object.keys(log.payload).length > 0;

  return (
    <li className="relative pl-10">
      <span
        className={`absolute left-0 top-1 flex h-8 w-8 items-center justify-center rounded-full text-sm ring-1 ring-inset ${eventAccentClass(log.eventType)}`}
        aria-hidden
      >
        {eventIcon(log.eventType)}
      </span>
      <Card variant="dashboard" padding="md" className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="font-medium text-atg-fg">{label}</p>
            <p className="mt-0.5 text-xs text-atg-muted">{formatDateTime(log.createdAt)}</p>
          </div>
          {hasPayload ? (
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              className="text-xs font-medium text-primary hover:underline"
              aria-expanded={expanded}
            >
              {expanded ? 'Masquer le détail' : 'Voir le détail JSON'}
            </button>
          ) : null}
        </div>

        {log.actor ? (
          <div className="flex items-center gap-3">
            <Avatar
              email={log.actor.email}
              firstName={log.actor.firstName}
              lastName={log.actor.lastName}
              size="sm"
            />
            <div className="min-w-0 text-sm">
              <p className="font-medium text-atg-fg">
                {log.actor.firstName} {log.actor.lastName}
              </p>
              <p className="truncate text-xs text-atg-muted">{log.actor.email}</p>
            </div>
          </div>
        ) : log.actorUserId ? (
          <p className="text-sm text-atg-muted">Acteur : {log.actorUserId.slice(0, 8)}…</p>
        ) : null}

        <dl className="grid gap-1 text-xs text-atg-muted sm:grid-cols-2">
          {log.targetUserId ? (
            <div>
              <dt className="inline font-medium">Cible </dt>
              <dd className="inline font-mono">{log.targetUserId.slice(0, 8)}…</dd>
            </div>
          ) : null}
          {log.ipAddress ? (
            <div>
              <dt className="inline font-medium">IP </dt>
              <dd className="inline">{log.ipAddress}</dd>
            </div>
          ) : null}
        </dl>

        {hasPayload && expanded ? (
          <pre className="max-h-80 overflow-x-auto rounded-lg bg-atg-elevated p-3 text-xs text-atg-fg">
            {JSON.stringify(log.payload, null, 2)}
          </pre>
        ) : null}
      </Card>
    </li>
  );
}

export function RbacAuditLogsList({
  showSubnav = true,
  userFilterMode = showSubnav ? 'actor' : 'involved',
}: {
  showSubnav?: boolean;
  userFilterMode?: 'actor' | 'involved';
}) {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [filterTick, setFilterTick] = useState(0);
  const [draftDateFrom, setDraftDateFrom] = useState('');
  const [draftDateTo, setDraftDateTo] = useState('');
  const [draftEventType, setDraftEventType] = useState<RbacAuditEventType | ''>('');
  const [draftActorUserId, setDraftActorUserId] = useState('');
  const [appliedDateFrom, setAppliedDateFrom] = useState('');
  const [appliedDateTo, setAppliedDateTo] = useState('');
  const [appliedEventType, setAppliedEventType] = useState<RbacAuditEventType | ''>('');
  const [appliedActorUserId, setAppliedActorUserId] = useState('');
  const [userIdFilter, setUserIdFilter] = useState('');
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
    if (access.status !== 'allowed' || userFilterMode === 'involved') return;
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
  }, [access.status, userFilterMode]);

  const handleUserIdChange = useCallback((userId: string) => {
    setUserIdFilter(userId);
    setPage(1);
    setFilterTick((tick) => tick + 1);
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (appliedDateFrom) count += 1;
    if (appliedDateTo) count += 1;
    if (appliedEventType) count += 1;
    if (userFilterMode === 'actor' && appliedActorUserId) count += 1;
    if (userFilterMode === 'involved' && userIdFilter) count += 1;
    return count;
  }, [
    appliedDateFrom,
    appliedDateTo,
    appliedEventType,
    appliedActorUserId,
    userFilterMode,
    userIdFilter,
  ]);

  const applyFilters = useCallback(() => {
    setAppliedDateFrom(draftDateFrom);
    setAppliedDateTo(draftDateTo);
    setAppliedEventType(draftEventType);
    setAppliedActorUserId(draftActorUserId);
    setPage(1);
    setFilterTick((tick) => tick + 1);
  }, [draftDateFrom, draftDateTo, draftEventType, draftActorUserId]);

  const clearFilters = useCallback(() => {
    setDraftDateFrom('');
    setDraftDateTo('');
    setDraftEventType('');
    setDraftActorUserId('');
    setAppliedDateFrom('');
    setAppliedDateTo('');
    setAppliedEventType('');
    setAppliedActorUserId('');
    setPage(1);
    setFilterTick((tick) => tick + 1);
  }, []);

  const load = useCallback(async () => {
    void filterTick;
    if (access.status !== 'allowed') return;
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listRbacAuditLogs({
        page,
        limit: PAGE_SIZE,
        dateFrom: appliedDateFrom || undefined,
        dateTo: appliedDateTo || undefined,
        eventType: appliedEventType || undefined,
        actorUserId: userFilterMode === 'actor' ? appliedActorUserId || undefined : undefined,
        userId: userFilterMode === 'involved' ? userIdFilter || undefined : undefined,
      });
      setState({
        status: 'ready',
        logs: result.data,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      const message = getRbacErrorMessage(error);
      setState({ status: 'error', message });
      toast({
        title: 'Erreur de chargement',
        message,
        variant: 'error',
      });
    }
  }, [
    access.status,
    page,
    appliedDateFrom,
    appliedDateTo,
    appliedEventType,
    appliedActorUserId,
    userIdFilter,
    userFilterMode,
    filterTick,
    toast,
  ]);

  useEffect(() => {
    void load();
  }, [load]);

  const filterControls = (
    <>
      <div>
        <label className="mb-1 block text-xs font-medium text-atg-muted">Date début</label>
        <input
          type="date"
          value={draftDateFrom}
          onChange={(event) => setDraftDateFrom(event.target.value)}
          className="w-full rounded-lg border border-atg-border bg-atg-elevated px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-atg-muted">Date fin</label>
        <input
          type="date"
          value={draftDateTo}
          onChange={(event) => setDraftDateTo(event.target.value)}
          className="w-full rounded-lg border border-atg-border bg-atg-elevated px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-atg-muted">
          Type d&apos;événement
        </label>
        <select
          value={draftEventType}
          onChange={(event) =>
            setDraftEventType(event.target.value as RbacAuditEventType | '')
          }
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
      {userFilterMode === 'actor' ? (
        <div>
          <label className="mb-1 block text-xs font-medium text-atg-muted">
            Utilisateur (acteur)
          </label>
          <select
            value={draftActorUserId}
            onChange={(event) => setDraftActorUserId(event.target.value)}
            className="w-full rounded-lg border border-atg-border bg-atg-elevated px-3 py-2 text-sm"
          >
            <option value="">Tous</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.firstName} {user.lastName} — {user.email}
              </option>
            ))}
          </select>
        </div>
      ) : null}
    </>
  );

  if (access.status === 'checking') {
    return (
      <>
        {showSubnav ? <RbacSubnav /> : null}
        <p className="text-sm text-atg-muted">Vérification des droits…</p>
      </>
    );
  }

  if (access.status === 'denied') {
    return (
      <>
        {showSubnav ? <RbacSubnav /> : null}
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

  const logs = state.status === 'ready' ? state.logs : [];

  return (
    <>
      {showSubnav ? <RbacSubnav /> : null}

      {userFilterMode === 'involved' ? (
        <UserIdFilterBar onUserIdChange={handleUserIdChange} onUsersLoaded={setUsers} />
      ) : null}

      <FilterBar
        activeCount={activeFilterCount}
        filters={filterControls}
        onClear={clearFilters}
        onApply={applyFilters}
        className="mb-6"
        mobileVariant="drawer"
      />

      {state.status === 'error' ? (
        <p role="alert" className="mb-4 text-sm text-red-600">
          {state.message}
        </p>
      ) : null}

      {state.status === 'loading' ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <Card variant="dashboard" padding="lg">
          <p className="text-sm text-atg-muted">Aucun événement pour ces critères.</p>
        </Card>
      ) : (
        <ol className="relative space-y-6 border-l border-atg-border pl-4">
          {logs.map((log) => (
            <AuditTimelineItem key={log.id} log={log} />
          ))}
        </ol>
      )}

      {state.status === 'ready' && state.totalPages > 1 ? (
        <DataTablePagination
          page={page}
          pageSize={PAGE_SIZE}
          totalPages={state.totalPages}
          totalItems={state.total}
          itemLabel="événement"
          onPageChange={setPage}
          className="mt-6"
        />
      ) : null}
    </>
  );
}

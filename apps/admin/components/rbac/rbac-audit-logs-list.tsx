'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  Avatar,
  Button,
  Card,
  DataTableBadge,
  DataTablePagination,
  FilterBar,
  Modal,
  Skeleton,
  useToast,
} from '@africatourismgate/ui';
import { RBAC_AUDIT_EVENT_TYPES } from '@africatourismgate/types/rbac';
import type {
  RbacAuditEventType,
  RbacAuditLog,
  User,
} from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { useFormatDateTime } from '../../lib/i18n/use-module-labels';
import { UserIdFilterBar } from '../users/user-id-filter-bar';
import { RbacSubnav } from './rbac-subnav';

const DEFAULT_PAGE_SIZE = 20;

type EventTone = 'danger' | 'success' | 'warning' | 'neutral';

function eventTone(eventType: RbacAuditEventType): EventTone {
  if (eventType === 'permission_denied') return 'danger';
  if (eventType.includes('granted') || eventType.includes('created') || eventType.includes('started')) {
    return 'success';
  }
  if (
    eventType.includes('revoked') ||
    eventType.includes('deleted') ||
    eventType.includes('ended')
  ) {
    return 'warning';
  }
  return 'neutral';
}

function eventMarkerClass(tone: EventTone): string {
  switch (tone) {
    case 'danger':
      return 'bg-atg-danger-light text-atg-danger-fg ring-atg-danger/30';
    case 'success':
      return 'bg-atg-success-light text-atg-success-fg ring-atg-success/30';
    case 'warning':
      return 'bg-atg-warning-light text-atg-warning-fg ring-atg-warning/30';
    default:
      return 'bg-atg-info-light text-atg-info ring-atg-info/25';
  }
}

function eventBadgeVariant(
  tone: EventTone,
): 'danger' | 'success' | 'warning' | 'muted' | 'default' {
  switch (tone) {
    case 'danger':
      return 'danger';
    case 'success':
      return 'success';
    case 'warning':
      return 'warning';
    default:
      return 'default';
  }
}

function EventGlyph({ eventType }: { eventType: RbacAuditEventType }) {
  const common = 'h-4 w-4';
  if (eventType === 'permission_denied') {
    return (
      <svg className={common} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </svg>
    );
  }
  if (eventType.startsWith('user_role_') || eventType.startsWith('impersonation_')) {
    return (
      <svg className={common} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    );
  }
  if (eventType.includes('permission')) {
    return (
      <svg className={common} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
        />
      </svg>
    );
  }
  return (
    <svg className={common} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    </svg>
  );
}

function MetaChip({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="inline-flex max-w-full items-center gap-1.5 rounded-md bg-atg-surface px-2.5 py-1 text-xs ring-1 ring-atg-border/70">
      <span className="font-medium text-atg-muted">{label}</span>
      <span className="truncate font-mono text-atg-fg">{value}</span>
    </div>
  );
}

function AuditTimelineItem({ log, isLast }: { log: RbacAuditLog; isLast: boolean }) {
  const formatDateTime = useFormatDateTime('mediumTime');
  const t = useTranslations('modules.rbac.audit');
  const tActions = useTranslations('common.actions');
  const [detailOpen, setDetailOpen] = useState(false);
  const hasPayload = log.payload && Object.keys(log.payload).length > 0;
  const tone = eventTone(log.eventType);
  const label = t(`eventTypes.${log.eventType}`);
  const payloadJson = hasPayload ? JSON.stringify(log.payload, null, 2) : '';

  return (
    <li className="relative grid grid-cols-[2.75rem_minmax(0,1fr)] gap-x-3 pb-6 last:pb-0 sm:gap-x-4">
      <div className="relative flex justify-center" aria-hidden>
        {!isLast ? (
          <span className="absolute top-10 bottom-0 w-px bg-gradient-to-b from-atg-border via-atg-border to-transparent" />
        ) : null}
        <span
          className={`relative z-[1] mt-1 flex h-10 w-10 items-center justify-center rounded-full ring-1 ring-inset shadow-sm ${eventMarkerClass(tone)}`}
        >
          <EventGlyph eventType={log.eventType} />
        </span>
      </div>

      <Card
        variant="dashboard"
        padding="md"
        className="min-w-0 space-y-4 transition-shadow hover:shadow-md"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <DataTableBadge variant={eventBadgeVariant(tone)}>{label}</DataTableBadge>
            </div>
            <p className="text-xs text-atg-muted tabular-nums">
              {formatDateTime(log.createdAt)}
            </p>
          </div>
          {hasPayload ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDetailOpen(true)}
            >
              {t('showDetailJson')}
            </Button>
          ) : null}
        </div>

        {log.actor ? (
          <div className="flex items-center gap-3 rounded-lg border border-atg-border/70 bg-atg-surface/60 px-3 py-2.5">
            <Avatar
              email={log.actor.email}
              firstName={log.actor.firstName}
              lastName={log.actor.lastName}
              size="sm"
            />
            <div className="min-w-0 text-sm">
              <p className="truncate font-medium text-atg-fg">
                {log.actor.firstName} {log.actor.lastName}
              </p>
              <p className="truncate text-xs text-atg-muted">{log.actor.email}</p>
            </div>
          </div>
        ) : log.actorUserId ? (
          <p className="rounded-lg border border-dashed border-atg-border px-3 py-2 text-sm text-atg-muted">
            {t('actorFallback', { actorId: log.actorUserId.slice(0, 8) })}
          </p>
        ) : null}

        {log.targetUserId || log.ipAddress ? (
          <div className="flex flex-wrap gap-2">
            {log.targetUserId ? (
              <MetaChip label={t('targetLabel')} value={`${log.targetUserId.slice(0, 8)}…`} />
            ) : null}
            {log.ipAddress ? <MetaChip label={t('ipLabel')} value={log.ipAddress} /> : null}
          </div>
        ) : null}
      </Card>

      {hasPayload ? (
        <Modal
          open={detailOpen}
          onOpenChange={setDetailOpen}
          title={t('detailModalTitle')}
          description={label}
          showClose
          className="max-w-2xl"
        >
          <div className="space-y-4">
            <pre className="max-h-[min(28rem,60vh)] overflow-auto rounded-lg border border-atg-border/80 bg-atg-elevated p-4 text-xs leading-relaxed text-atg-fg">
              {payloadJson}
            </pre>
            <div className="flex justify-end">
              <Button type="button" variant="outline" onClick={() => setDetailOpen(false)}>
                {tActions('close')}
              </Button>
            </div>
          </div>
        </Modal>
      ) : null}
    </li>
  );
}

export function RbacAuditLogsList({
  showSubnav = true,
  userFilterMode = showSubnav ? 'actor' : 'involved',
  pageSize = DEFAULT_PAGE_SIZE,
}: {
  showSubnav?: boolean;
  userFilterMode?: 'actor' | 'involved';
  pageSize?: number;
}) {
  const { rbac: getRbacErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.rbac.audit');
  const tFilters = useTranslations('modules.common.filters');
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const limit = pageSize > 0 ? pageSize : DEFAULT_PAGE_SIZE;
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
        limit,
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
        title: t('toast.loadFailedTitle'),
        message,
        variant: 'error',
      });
    }
  }, [
    access.status,
    page,
    limit,
    appliedDateFrom,
    appliedDateTo,
    appliedEventType,
    appliedActorUserId,
    userIdFilter,
    userFilterMode,
    filterTick,
    toast,
    t,
    getRbacErrorMessage,
  ]);

  useEffect(() => {
    void load();
  }, [load]);

  const filterControls = (
    <>
      <div>
        <label className="mb-1 block text-xs font-medium text-atg-muted">
          {tFilters('dateFrom')}
        </label>
        <input
          type="date"
          value={draftDateFrom}
          onChange={(event) => setDraftDateFrom(event.target.value)}
          className="w-full rounded-lg border border-atg-border bg-atg-elevated px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-atg-muted">
          {tFilters('dateTo')}
        </label>
        <input
          type="date"
          value={draftDateTo}
          onChange={(event) => setDraftDateTo(event.target.value)}
          className="w-full rounded-lg border border-atg-border bg-atg-elevated px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-atg-muted">
          {t('filters.eventType')}
        </label>
        <select
          value={draftEventType}
          onChange={(event) =>
            setDraftEventType(event.target.value as RbacAuditEventType | '')
          }
          className="w-full rounded-lg border border-atg-border bg-atg-elevated px-3 py-2 text-sm"
        >
          <option value="">{tFilters('all')}</option>
          {RBAC_AUDIT_EVENT_TYPES.map((type) => (
            <option key={type} value={type}>
              {t(`eventTypes.${type}`)}
            </option>
          ))}
        </select>
      </div>
      {userFilterMode === 'actor' ? (
        <div>
          <label className="mb-1 block text-xs font-medium text-atg-muted">
            {t('filters.actorUser')}
          </label>
          <select
            value={draftActorUserId}
            onChange={(event) => setDraftActorUserId(event.target.value)}
            className="w-full rounded-lg border border-atg-border bg-atg-elevated px-3 py-2 text-sm"
          >
            <option value="">{tFilters('all')}</option>
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
        <p className="text-sm text-atg-muted">{t('checkingAccess')}</p>
      </>
    );
  }

  if (access.status === 'denied') {
    return (
      <>
        {showSubnav ? <RbacSubnav /> : null}
        <Card className="p-6">
          <p role="alert" className="text-sm text-red-600">
            {t('accessDenied')}
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
          {Array.from({ length: Math.min(limit, 5) }).map((_, index) => (
            <div
              key={index}
              className="grid grid-cols-[2.75rem_minmax(0,1fr)] gap-x-3 sm:gap-x-4"
            >
              <div className="flex justify-center pt-1">
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
              <Skeleton className="h-32 rounded-xl" />
            </div>
          ))}
        </div>
      ) : logs.length === 0 ? (
        <Card variant="dashboard" padding="lg" className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-atg-surface text-atg-muted ring-1 ring-atg-border">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-atg-fg">{t('empty')}</p>
        </Card>
      ) : (
        <ol className="space-y-0">
          {logs.map((log, index) => (
            <AuditTimelineItem
              key={log.id}
              log={log}
              isLast={index === logs.length - 1}
            />
          ))}
        </ol>
      )}

      {state.status === 'ready' && state.totalPages > 0 ? (
        <DataTablePagination
          page={page}
          pageSize={limit}
          totalPages={state.totalPages}
          totalItems={state.total}
          itemLabel={t('paginationItem')}
          onPageChange={setPage}
          className="mt-6"
        />
      ) : null}
    </>
  );
}

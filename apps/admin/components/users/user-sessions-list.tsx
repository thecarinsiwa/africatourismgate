'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  AlertDialog,
  Button,
  Card,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  DataTableBadge,
  DataTablePagination,
  Skeleton,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { User, UserSession } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import type { UserScopedListProps } from './user-addresses-list';
import { UserIdFilterBar } from './user-id-filter-bar';
import { UserListCell } from './user-list-cell';

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

function isSessionExpired(expiresAt: string): boolean {
  return new Date(expiresAt).getTime() <= Date.now();
}

type UserSessionsListProps = UserScopedListProps & {
  layout?: 'table' | 'cards';
};

function SessionCard({
  session,
  usersById,
  showUser,
  revoking,
  onRevoke,
  tSessionStatus,
  tDates,
  tRoles,
}: {
  session: UserSession;
  usersById: Map<string, User>;
  showUser: boolean;
  revoking: boolean;
  onRevoke: (session: UserSession) => void;
  tSessionStatus: ReturnType<typeof useTranslations<'modules.common.sessionStatus'>>;
  tDates: ReturnType<typeof useTranslations<'modules.common.dates'>>;
  tRoles: ReturnType<typeof useTranslations<'modules.users.roles'>>;
}) {
  const expired = isSessionExpired(session.expiresAt);

  return (
    <Card variant="dashboard" padding="md" className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {showUser ? (
            <UserListCell userId={session.userId} usersById={usersById} />
          ) : (
            <p className="text-sm font-medium text-atg-fg">{tSessionStatus('title')}</p>
          )}
        </div>
        <DataTableBadge variant={expired ? 'muted' : 'success'}>
          {expired ? tSessionStatus('expired') : tSessionStatus('active')}
        </DataTableBadge>
      </div>
      <dl className="grid gap-2 text-sm">
        <div className="flex justify-between gap-2">
          <dt className="text-atg-muted">{tDates('createdAt')}</dt>
          <dd className="text-right font-medium text-atg-fg">
            {formatDateTime(session.createdAt)}
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-atg-muted">{tDates('expiresAt')}</dt>
          <dd className="text-right text-atg-fg">{formatDateTime(session.expiresAt)}</dd>
        </div>
      </dl>
      {!expired ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full !text-red-600 dark:!text-red-400"
          onClick={() => onRevoke(session)}
          disabled={revoking}
          loading={revoking}
        >
          {tRoles('revokeDialog.title')}
        </Button>
      ) : null}
    </Card>
  );
}

export function UserSessionsList({
  fixedUserId,
  showUserColumn = true,
  layout = 'cards',
}: UserSessionsListProps = {}) {
  const { users: getUsersErrorMessage } = useAdminErrorMessages();
  const tSessions = useTranslations('modules.users.sessions');
  const tColumns = useTranslations('modules.common.columns');
  const tSessionStatus = useTranslations('modules.common.sessionStatus');
  const tDates = useTranslations('modules.common.dates');
  const tRoles = useTranslations('modules.users.roles');
  const tPagination = useTranslations('modules.common.pagination');
  const [page, setPage] = useState(1);
  const [userIdFilter, setUserIdFilter] = useState(fixedUserId ?? '');
  const [users, setUsers] = useState<User[]>([]);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokeError, setRevokeError] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<UserSession | null>(null);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; rows: UserSession[]; total: number; totalPages: number }
  >({ status: 'loading' });

  const usersById = useMemo(() => new Map(users.map((user) => [user.id, user])), [users]);

  useEffect(() => {
    if (fixedUserId) {
      setUserIdFilter(fixedUserId);
    }
  }, [fixedUserId]);

  const handleUserIdChange = useCallback(
    (userId: string) => {
      if (fixedUserId) return;
      setUserIdFilter(userId);
      setPage(1);
    },
    [fixedUserId],
  );

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listUserSessions({
        page,
        limit: PAGE_SIZE,
        userId: userIdFilter || undefined,
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
  }, [page, userIdFilter, getUsersErrorMessage]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleRevokeRequest = useCallback((row: UserSession) => {
    setConfirmTarget(row);
  }, []);

  const handleRevokeConfirm = useCallback(async () => {
    if (!confirmTarget) return;
    const row = confirmTarget;
    setConfirmTarget(null);
    setRevokeError(null);
    setRevokingId(row.id);
    try {
      await getApiClient().revokeUserSession(row.id);
      await load();
    } catch (error) {
      setRevokeError(getUsersErrorMessage(error));
    } finally {
      setRevokingId(null);
    }
  }, [confirmTarget, load, getUsersErrorMessage]);

  const columns = useMemo<ColumnDef<UserSession, unknown>[]>(() => {
    const cols: ColumnDef<UserSession, unknown>[] = [];

    if (showUserColumn) {
      cols.push({
        id: 'user',
        header: tColumns('user'),
        cell: ({ row }) => (
          <UserListCell userId={row.original.userId} usersById={usersById} />
        ),
      });
    }

    cols.push(
      {
        id: 'createdAt',
        header: tDates('createdAt'),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm">
            {formatDateTime(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: 'expiresAt',
        header: tDates('expiresAt'),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-atg-muted">
            {formatDateTime(row.original.expiresAt)}
          </span>
        ),
      },
      {
        id: 'status',
        header: tColumns('status'),
        meta: { align: 'center' },
        cell: ({ row }) =>
          isSessionExpired(row.original.expiresAt) ? (
            <DataTableBadge variant="muted">{tSessionStatus('expired')}</DataTableBadge>
          ) : (
            <DataTableBadge variant="success">{tSessionStatus('active')}</DataTableBadge>
          ),
      },
      {
        id: 'actions',
        header: tColumns('actions'),
        meta: { align: 'right' },
        cell: ({ row }) => (
          <DataTableActions>
            <DataTableActionButton
              action="revoke"
              label={tRoles('revokeDialog.title')}
              onClick={() => handleRevokeRequest(row.original)}
              disabled={revokingId === row.original.id}
              loading={revokingId === row.original.id}
            />
          </DataTableActions>
        ),
      },
    );

    return cols;
  }, [
    handleRevokeRequest,
    revokingId,
    showUserColumn,
    tColumns,
    tDates,
    tRoles,
    tSessionStatus,
    usersById,
  ]);

  const rows = state.status === 'ready' ? state.rows : [];
  const emptyMessage = userIdFilter ? tSessions('emptyFiltered') : tSessions('emptyDefault');

  return (
    <>
      <AlertDialog
        open={!!confirmTarget}
        onOpenChange={(open) => { if (!open) setConfirmTarget(null); }}
        title={tSessions('revokeTitle')}
        description={tSessions('revokeConfirm')}
        confirmLabel={tSessions('revokeConfirmButton')}
        cancelLabel={tSessions('cancel')}
        variant="danger"
        loading={!!revokingId}
        error={revokeError}
        onConfirm={() => void handleRevokeConfirm()}
      />
      {!fixedUserId ? (
        <UserIdFilterBar onUserIdChange={handleUserIdChange} onUsersLoaded={setUsers} />
      ) : null}

      {state.status === 'error' ? (
        <p role="alert" className="mb-4 text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
      ) : null}

      {layout === 'cards' ? (
        <div className="space-y-4">
          {state.status === 'loading' ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-xl" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <Card variant="dashboard" padding="lg">
              <p className="text-sm text-atg-muted">{emptyMessage}</p>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rows.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  usersById={usersById}
                  showUser={showUserColumn}
                  revoking={revokingId === session.id}
                  onRevoke={(s) => handleRevokeRequest(s)}
                  tSessionStatus={tSessionStatus}
                  tDates={tDates}
                  tRoles={tRoles}
                />
              ))}
            </div>
          )}
          {state.status === 'ready' && state.totalPages > 0 ? (
            <DataTablePagination
              page={page}
              pageSize={PAGE_SIZE}
              totalPages={state.totalPages}
              totalItems={state.total}
              itemLabel={tPagination('session')}
              onPageChange={setPage}
            />
          ) : null}
        </div>
      ) : (
        <Card variant="dashboard" padding="none" className="overflow-hidden">
          <DataTable
            columns={columns}
            data={rows}
            getRowId={(row) => row.id}
            isLoading={state.status === 'loading'}
            emptyMessage={emptyMessage}
            aria-label={tSessions('ariaLabel')}
          />
          {state.status === 'ready' && state.totalPages > 0 ? (
            <DataTablePagination
              page={page}
              pageSize={PAGE_SIZE}
              totalPages={state.totalPages}
              totalItems={state.total}
              itemLabel={tPagination('session')}
              onPageChange={setPage}
            />
          ) : null}
        </Card>
      )}
    </>
  );
}

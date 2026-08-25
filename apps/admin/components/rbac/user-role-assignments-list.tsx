'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  AlertDialog,
  Avatar,
  Button,
  Card,
  DataTablePagination,
  EmptyState,
  FilterBar,
  Select,
  Skeleton,
  useToast,
} from '@africatourismgate/ui';
import type { User, UserRoleAssignment } from '@africatourismgate/types';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRbacScopeDisplayLabels } from '../../lib/i18n/use-module-labels';
import { formatAssignmentScope } from '../../lib/rbac-display';
import { getApiClient } from '../../lib/auth/api';
import { RoleBadge } from './role-badge';
import { RbacSubnav } from './rbac-subnav';
import { UserRoleAssignmentForm } from './user-role-assignment-form';

const PAGE_SIZE = 50;

type UserAssignmentGroup = {
  userId: string;
  user: UserRoleAssignment['user'];
  assignments: UserRoleAssignment[];
};

export function UserRoleAssignmentsList() {
  const { rbac: getRbacErrorMessage } = useAdminErrorMessages();
  const locale = useLocale();
  const t = useTranslations('modules.rbac.assignments');
  const tCommon = useTranslations('modules.common');
  const tFilter = useTranslations('modules.users.userIdFilter');
  const tActions = useTranslations('common.actions');
  const scopeLabels = useRbacScopeDisplayLabels();
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [userIdFilter, setUserIdFilter] = useState(() => searchParams.get('userId') ?? '');
  const [users, setUsers] = useState<User[]>([]);
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
  const [pendingRevoke, setPendingRevoke] = useState<UserRoleAssignment | null>(null);

  useEffect(() => {
    setUserIdFilter(searchParams.get('userId') ?? '');
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    void getApiClient()
      .listUsers({ page: 1, limit: 100, status: 'active' })
      .then((result) => {
        if (!cancelled) setUsers(result.data);
      })
      .catch(() => {
        if (!cancelled) setUsers([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const userOptions = useMemo(
    () => [
      { value: '', label: tFilter('allUsers') },
      ...users.map((user) => ({
        value: user.id,
        label: `${user.firstName} ${user.lastName} — ${user.email}`,
      })),
    ],
    [tFilter, users],
  );

  const syncUserId = useCallback(
    (userId: string) => {
      setUserIdFilter(userId);
      setPage(1);
      const params = new URLSearchParams(searchParams.toString());
      if (userId) params.set('userId', userId);
      else params.delete('userId');
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    },
    [pathname, router, searchParams],
  );

  const handleClearFilters = useCallback(() => {
    syncUserId('');
  }, [syncUserId]);

  const activeFilterCount = userIdFilter ? 1 : 0;

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listUserRoleAssignments({
        page,
        limit: PAGE_SIZE,
        includeRevoked: false,
        userId: userIdFilter || undefined,
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
  }, [page, userIdFilter, getRbacErrorMessage]);

  useEffect(() => {
    void load();
  }, [load]);

  const groupedByUser = useMemo<UserAssignmentGroup[]>(() => {
    if (state.status !== 'ready') return [];

    const groups = new Map<string, UserAssignmentGroup>();
    for (const assignment of state.assignments) {
      const existing = groups.get(assignment.userId);
      if (existing) {
        existing.assignments.push(assignment);
      } else {
        groups.set(assignment.userId, {
          userId: assignment.userId,
          user: assignment.user,
          assignments: [assignment],
        });
      }
    }

    return Array.from(groups.values()).sort((a, b) => {
      const nameA = a.user
        ? `${a.user.lastName} ${a.user.firstName}`.toLowerCase()
        : a.userId;
      const nameB = b.user
        ? `${b.user.lastName} ${b.user.firstName}`.toLowerCase()
        : b.userId;
      return nameA.localeCompare(nameB, locale);
    });
  }, [state, locale]);

  const confirmRevoke = useCallback(async () => {
    if (!pendingRevoke) return;
    setRevokingId(pendingRevoke.id);
    try {
      await getApiClient().revokeUserRoleAssignment(pendingRevoke.id);
      toast({
        title: t('toast.revokedTitle'),
        message: t('toast.revokedMessage'),
        variant: 'success',
      });
      setPendingRevoke(null);
      await load();
    } catch (error) {
      toast({
        title: t('toast.revokeFailedTitle'),
        message: getRbacErrorMessage(error),
        variant: 'error',
      });
    } finally {
      setRevokingId(null);
    }
  }, [pendingRevoke, load, toast, t, getRbacErrorMessage]);

  const isLoading = state.status === 'loading';
  const isError = state.status === 'error';
  const isEmpty = state.status === 'ready' && groupedByUser.length === 0;
  const hasActiveFilters = activeFilterCount > 0;

  return (
    <div className="space-y-6">
      <RbacSubnav />

      <FilterBar
        mobileVariant="drawer"
        activeCount={activeFilterCount}
        onClear={handleClearFilters}
        clearLabel={tCommon('filters.clearAll')}
        applyLabel={tCommon('filters.apply')}
        toggleLabel={tCommon('filters.toggle')}
        filters={
          <div className="w-full sm:max-w-md">
            <Select
              label={tFilter('label')}
              value={userIdFilter}
              options={userOptions}
              onChange={(e) => syncUserId(e.target.value)}
            />
          </div>
        }
      />

      <UserRoleAssignmentForm onSuccess={() => void load()} />

      {isError ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
      ) : isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <p className="sr-only">{t('loading')}</p>
        </div>
      ) : isEmpty ? (
        <EmptyState
          title={hasActiveFilters ? t('emptyTitleSearch') : t('emptyTitleDefault')}
          description={
            hasActiveFilters ? t('emptyDescriptionSearch') : t('emptyDescriptionDefault')
          }
        />
      ) : (
        <>
          <div className="space-y-3">
            {groupedByUser.map((group) => (
              <Card key={group.userId} variant="dashboard" padding="md" className="space-y-3">
                <div className="flex items-start gap-3">
                  {group.user ? (
                    <>
                      <Avatar
                        email={group.user.email}
                        firstName={group.user.firstName}
                        lastName={group.user.lastName}
                        size="md"
                      />
                      <div className="min-w-0">
                        <Link
                          href={`/utilisateurs/${group.userId}/voir`}
                          className="font-medium text-atg-fg hover:text-primary hover:underline"
                        >
                          {group.user.firstName} {group.user.lastName}
                        </Link>
                        <p className="truncate text-sm text-atg-muted">{group.user.email}</p>
                      </div>
                    </>
                  ) : (
                    <p className="font-mono text-sm text-atg-muted">{group.userId}</p>
                  )}
                </div>

                <ul className="flex flex-wrap gap-2">
                  {group.assignments.map((assignment) => (
                    <li
                      key={assignment.id}
                      className="flex flex-wrap items-center gap-2 rounded-lg border border-atg-border bg-atg-surface/40 px-3 py-2"
                    >
                      {assignment.role ? (
                        <RoleBadge code={assignment.role.code} name={assignment.role.name} />
                      ) : (
                        <RoleBadge code={assignment.roleId.slice(0, 8)} />
                      )}
                      <span className="text-xs text-atg-muted">
                        {formatAssignmentScope(
                          assignment.scopeType,
                          scopeLabels,
                          assignment.scopeId,
                        )}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto px-1.5 py-0.5 text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400"
                        disabled={revokingId === assignment.id}
                        loading={revokingId === assignment.id}
                        onClick={() => setPendingRevoke(assignment)}
                      >
                        {t('revoke')}
                      </Button>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>

          {state.status === 'ready' && state.totalPages > 1 ? (
            <DataTablePagination
              page={page}
              pageSize={PAGE_SIZE}
              totalPages={state.totalPages}
              totalItems={state.total}
              itemLabel={t('paginationItem')}
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}

      <AlertDialog
        open={pendingRevoke !== null}
        onOpenChange={(open) => {
          if (!open && !revokingId) setPendingRevoke(null);
        }}
        title={t('revokeDialog.title')}
        description={t('revokeDialog.description')}
        confirmLabel={t('revoke')}
        cancelLabel={tActions('cancel')}
        variant="danger"
        loading={revokingId !== null}
        onConfirm={() => void confirmRevoke()}
        onCancel={() => setPendingRevoke(null)}
      />
    </div>
  );
}

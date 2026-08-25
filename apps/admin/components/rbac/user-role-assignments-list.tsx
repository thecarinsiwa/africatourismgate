'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  AlertDialog,
  Avatar,
  Card,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  DataTablePagination,
  EmptyState,
  FilterBar,
  Input,
  Select,
  useToast,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { Role, ScopeType, User, UserRoleAssignment } from '@africatourismgate/types';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  useRbacScopeDisplayLabels,
  useRbacScopeTypeLabels,
} from '../../lib/i18n/use-module-labels';
import { useDataTablePaginationLabels } from '../../lib/i18n/use-pagination-labels';
import { formatAssignmentScope } from '../../lib/rbac-display';
import { getApiClient } from '../../lib/auth/api';
import { RoleBadge } from './role-badge';
import { RbacSubnav } from './rbac-subnav';
import { UserRoleAssignmentForm } from './user-role-assignment-form';

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;
const SCOPE_TYPES: ScopeType[] = ['global', 'property', 'agency', 'support_queue'];

function isScopeType(value: string): value is ScopeType {
  return (SCOPE_TYPES as string[]).includes(value);
}

export function UserRoleAssignmentsList() {
  const { rbac: getRbacErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.rbac.assignments');
  const tCommon = useTranslations('modules.common');
  const tRoleNames = useTranslations('modules.rbac.roleNames');
  const tActions = useTranslations('common.actions');
  const scopeLabels = useRbacScopeDisplayLabels();
  const scopeTypeLabels = useRbacScopeTypeLabels();
  const paginationLabels = useDataTablePaginationLabels();
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [userIdFilter, setUserIdFilter] = useState(() => searchParams.get('userId') ?? '');
  const [roleIdFilter, setRoleIdFilter] = useState(() => searchParams.get('roleId') ?? '');
  const [scopeTypeFilter, setScopeTypeFilter] = useState(() => {
    const value = searchParams.get('scopeType') ?? '';
    return isScopeType(value) ? value : '';
  });
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
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
    const userId = searchParams.get('userId') ?? '';
    const roleId = searchParams.get('roleId') ?? '';
    const scopeTypeRaw = searchParams.get('scopeType') ?? '';
    setUserIdFilter(userId);
    setRoleIdFilter(roleId);
    setScopeTypeFilter(isScopeType(scopeTypeRaw) ? scopeTypeRaw : '');
  }, [searchParams]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch((prev) => {
        const q = searchInput.trim();
        if (prev !== q) setPage(1);
        return q;
      });
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      getApiClient().listUsers({ page: 1, limit: 100, status: 'active' }),
      getApiClient().listRoles({ page: 1, limit: 100, includeSystem: true }),
    ])
      .then(([usersResult, rolesResult]) => {
        if (cancelled) return;
        setUsers(usersResult.data);
        setRoles(rolesResult.data);
      })
      .catch(() => {
        if (cancelled) return;
        setUsers([]);
        setRoles([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const roleDisplayName = useCallback(
    (role: Role) => {
      const hasTranslated =
        typeof tRoleNames.has === 'function' ? tRoleNames.has(role.code) : false;
      return hasTranslated ? tRoleNames(role.code) : role.name;
    },
    [tRoleNames],
  );

  const roleOptions = useMemo(
    () => [
      { value: '', label: t('filters.allRoles') },
      ...roles.map((role) => ({
        value: role.id,
        label: `${roleDisplayName(role)} (${role.code})`,
      })),
    ],
    [roleDisplayName, roles, t],
  );

  const scopeOptions = useMemo(
    () => [
      { value: '', label: t('filters.allScopes') },
      ...SCOPE_TYPES.map((value) => ({
        value,
        label: scopeTypeLabels[value],
      })),
    ],
    [scopeTypeLabels, t],
  );

  const syncFilters = useCallback(
    (next: { userId?: string; roleId?: string; scopeType?: string }) => {
      const userId = next.userId ?? userIdFilter;
      const roleId = next.roleId ?? roleIdFilter;
      const scopeType = next.scopeType ?? scopeTypeFilter;

      setUserIdFilter(userId);
      setRoleIdFilter(roleId);
      setScopeTypeFilter(isScopeType(scopeType) ? scopeType : '');
      setPage(1);

      const params = new URLSearchParams(searchParams.toString());
      if (userId) params.set('userId', userId);
      else params.delete('userId');
      if (roleId) params.set('roleId', roleId);
      else params.delete('roleId');
      if (scopeType && isScopeType(scopeType)) params.set('scopeType', scopeType);
      else params.delete('scopeType');

      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    },
    [pathname, roleIdFilter, router, scopeTypeFilter, searchParams, userIdFilter],
  );

  const handleClearFilters = useCallback(() => {
    setSearchInput('');
    setSearch('');
    setUserIdFilter('');
    setRoleIdFilter('');
    setScopeTypeFilter('');
    setPage(1);
    router.replace(pathname);
  }, [pathname, router]);

  const activeFilterCount = [
    search.trim().length > 0,
    userIdFilter,
    roleIdFilter,
    scopeTypeFilter,
  ].filter(Boolean).length;

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listUserRoleAssignments({
        page,
        limit: PAGE_SIZE,
        includeRevoked: false,
        search: search || undefined,
        userId: userIdFilter || undefined,
        roleId: roleIdFilter || undefined,
        scopeType: isScopeType(scopeTypeFilter) ? scopeTypeFilter : undefined,
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
  }, [page, search, userIdFilter, roleIdFilter, scopeTypeFilter, getRbacErrorMessage]);

  useEffect(() => {
    void load();
  }, [load]);

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

  const columns = useMemo<ColumnDef<UserRoleAssignment, unknown>[]>(
    () => [
      {
        id: 'user',
        header: t('columns.user'),
        cell: ({ row }) => {
          const assignment = row.original;
          const user = assignment.user;
          if (!user) {
            return (
              <span className="font-mono text-xs text-atg-muted">
                {assignment.userId.slice(0, 8)}…
              </span>
            );
          }
          return (
            <div className="flex min-w-0 items-center gap-2.5">
              <Avatar
                email={user.email}
                firstName={user.firstName}
                lastName={user.lastName}
                size="sm"
              />
              <div className="min-w-0">
                <Link
                  href={`/utilisateurs/${assignment.userId}/voir`}
                  className="block truncate font-medium text-atg-fg hover:text-primary hover:underline"
                >
                  {user.firstName} {user.lastName}
                </Link>
                <p className="truncate text-xs text-atg-muted">{user.email}</p>
              </div>
            </div>
          );
        },
      },
      {
        id: 'role',
        header: t('columns.role'),
        cell: ({ row }) => {
          const role = row.original.role;
          if (!role) {
            return <RoleBadge code={row.original.roleId.slice(0, 8)} />;
          }
          return <RoleBadge code={role.code} name={role.name} />;
        },
      },
      {
        id: 'scope',
        header: t('columns.scope'),
        cell: ({ row }) => (
          <span className="text-sm text-atg-muted">
            {formatAssignmentScope(
              row.original.scopeType,
              scopeLabels,
              row.original.scopeId,
              row.original.scopeName,
            )}
          </span>
        ),
      },
      {
        id: 'actions',
        header: tCommon('columns.actions'),
        meta: { align: 'right' },
        cell: ({ row }) => {
          const assignment = row.original;
          const busy = revokingId === assignment.id;
          return (
            <DataTableActions className="opacity-90 transition-opacity group-hover:opacity-100">
              <DataTableActionButton
                action="revoke"
                label={t('revoke')}
                onClick={() => setPendingRevoke(assignment)}
                disabled={busy}
                loading={busy}
              />
            </DataTableActions>
          );
        },
      },
    ],
    [revokingId, scopeLabels, t, tCommon],
  );

  const isLoading = state.status === 'loading';
  const isError = state.status === 'error';
  const assignments = state.status === 'ready' ? state.assignments : [];
  const isEmpty = state.status === 'ready' && assignments.length === 0;
  const hasActiveFilters = activeFilterCount > 0;

  return (
    <div className="space-y-6">
      <RbacSubnav />

      <UserRoleAssignmentForm onSuccess={() => void load()} />

      <FilterBar
        mobileVariant="drawer"
        activeCount={activeFilterCount}
        onClear={handleClearFilters}
        clearLabel={tCommon('filters.clearAll')}
        applyLabel={tCommon('filters.apply')}
        toggleLabel={tCommon('filters.toggle')}
        filters={
          <>
            <div className="w-full sm:min-w-[220px] sm:max-w-sm">
              <Input
                label={t('filters.search')}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t('filters.searchPlaceholder')}
                aria-label={t('filters.searchPlaceholder')}
              />
            </div>
            <div className="w-full sm:max-w-xs">
              <Select
                label={t('filters.user')}
                value={userIdFilter}
                options={[
                  { value: '', label: t('filters.allUsers') },
                  ...users.map((user) => ({
                    value: user.id,
                    label: `${user.firstName} ${user.lastName} — ${user.email}`,
                  })),
                ]}
                onChange={(e) => syncFilters({ userId: e.target.value })}
              />
            </div>
            <div className="w-full sm:max-w-xs">
              <Select
                label={t('filters.role')}
                value={roleIdFilter}
                options={roleOptions}
                onChange={(e) => syncFilters({ roleId: e.target.value })}
              />
            </div>
            <div className="w-full sm:max-w-xs">
              <Select
                label={t('filters.scope')}
                value={scopeTypeFilter}
                options={scopeOptions}
                onChange={(e) => syncFilters({ scopeType: e.target.value })}
              />
            </div>
          </>
        }
      />

      {isError ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
      ) : isEmpty && !isLoading ? (
        <EmptyState
          title={hasActiveFilters ? t('emptyTitleSearch') : t('emptyTitleDefault')}
          description={
            hasActiveFilters ? t('emptyDescriptionSearch') : t('emptyDescriptionDefault')
          }
        />
      ) : (
        <>
          <Card variant="dashboard" padding="none" className="overflow-hidden">
            <DataTable
              columns={columns}
              data={assignments}
              isLoading={isLoading}
              loadingMessage={t('loading')}
              emptyMessage={
                hasActiveFilters ? t('emptyTableSearch') : t('emptyTableDefault')
              }
              emptyVariant={hasActiveFilters ? 'search' : 'default'}
              getRowId={(row) => row.id}
              aria-label={t('ariaLabel')}
            />
          </Card>

          {state.status === 'ready' && state.totalPages > 1 ? (
            <DataTablePagination
              page={page}
              pageSize={PAGE_SIZE}
              totalPages={state.totalPages}
              totalItems={state.total}
              itemLabel={t('paginationItem')}
              labels={paginationLabels}
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

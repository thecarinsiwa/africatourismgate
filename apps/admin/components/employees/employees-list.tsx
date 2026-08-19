'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';
import { useEmployeeStatusLabels } from '../../lib/i18n/use-module-labels';

import {
  AlertDialog,
  Avatar,
  Button,
  Card,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  DataTableBadge,
  DataTablePagination,
  Input,
  useToast,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { Employee, EmployeeStatus, OrganizationListItem } from '@africatourismgate/types';
import Link from 'next/link';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { getApiClient } from '../../lib/auth/api';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

type StatusFilter = '' | EmployeeStatus;

const statusVariants: Record<EmployeeStatus, 'success' | 'muted' | 'danger'> = {
  active: 'success',
  on_leave: 'muted',
  terminated: 'danger',
};

function userDisplayName(employee: Employee): string {
  if (employee.user) {
    return `${employee.user.firstName} ${employee.user.lastName}`;
  }
  return employee.userId.slice(0, 8);
}

type EmployeesListProps = {
  /** Filtre fixe sur une organisation (ex. fiche org). */
  lockedOrganizationId?: string;
  /** Mode intégré dans une fiche (sans chrome page). */
  embedded?: boolean;
};

export function EmployeesList({
  lockedOrganizationId,
  embedded = false,
}: EmployeesListProps = {}) {
  const { employees: getEmployeesErrorMessage } = useAdminErrorMessages();
  const tList = useTranslations('modules.employees.list');
  const tFilters = useTranslations('modules.employees.filters');
  const tColumns = useTranslations('modules.common.columns');
  const tEmployeeColumns = useTranslations('modules.employees.columns');
  const tCommonFilters = useTranslations('modules.common.filters');
  const tCommon = useTranslations('modules.common');
  const tPagination = useTranslations('modules.common.pagination');
  const tActions = useTranslations('common.actions');
  const tNav = useTranslations('nav');
  const tToast = useTranslations('modules.common.toast');
  const statusLabels = useEmployeeStatusLabels();
  const { toast } = useToast();
  const statusFilterId = useId();
  const orgFilterId = useId();
  const emptyDash = tCommon('empty.dash');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');
  const [organizationFilter, setOrganizationFilter] = useState('');
  const [page, setPage] = useState(1);
  const [organizations, setOrganizations] = useState<OrganizationListItem[]>([]);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | {
        status: 'ready';
        employees: Employee[];
        total: number;
        totalPages: number;
      }
  >({ status: 'loading' });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<Employee | null>(null);

  useEffect(() => {
    if (lockedOrganizationId) {
      return;
    }
    let cancelled = false;
    async function loadOrganizations() {
      try {
        const result = await getApiClient().listOrganizations({ page: 1, limit: 100 });
        if (!cancelled) {
          setOrganizations(result.data);
        }
      } catch {
        if (!cancelled) {
          setOrganizations([]);
        }
      }
    }
    void loadOrganizations();
    return () => {
      cancelled = true;
    };
  }, [lockedOrganizationId]);

  const orgNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const org of organizations) {
      map.set(org.id, org.name);
    }
    return map;
  }, [organizations]);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listEmployees({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        status: statusFilter || undefined,
        organizationId: lockedOrganizationId || organizationFilter || undefined,
      });
      setState({
        status: 'ready',
        employees: result.data,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      setState({ status: 'error', message: getEmployeesErrorMessage(error) });
    }
  }, [page, search, statusFilter, organizationFilter, lockedOrganizationId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const query = searchInput.trim();
    const timer = window.setTimeout(() => {
      setSearch((prev) => {
        if (prev !== query) {
          setPage(1);
        }
        return query;
      });
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const handleDeleteRequest = useCallback((employee: Employee) => {
    setConfirmTarget(employee);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!confirmTarget) return;
    const employee = confirmTarget;
    setConfirmTarget(null);
    setDeleteError(null);
    setDeletingId(employee.id);
    try {
      await getApiClient().deleteEmployee(employee.id);
      await load();
      const label =
        employee.user?.email ?? employee.employeeCode ?? employee.userId.slice(0, 8);
      toast({
        variant: 'success',
        message: tToast('deletedEmployee', { label }),
      });
    } catch (error) {
      toast({
        variant: 'error',
        message: getEmployeesErrorMessage(error),
      });
    } finally {
      setDeletingId(null);
    }
  }, [confirmTarget, load, getEmployeesErrorMessage, toast, tToast]);

  const columns = useMemo<ColumnDef<Employee, unknown>[]>(() => {
    const base: ColumnDef<Employee, unknown>[] = [
      {
        id: 'user',
        header: tColumns('user'),
        cell: ({ row }) => {
          const emp = row.original;
          const email = emp.user?.email ?? '';
          const firstName = emp.user?.firstName;
          const lastName = emp.user?.lastName;
          const fullName = userDisplayName(emp);
          return (
            <div className="flex items-center gap-3">
              {email ? (
                <Avatar
                  email={email}
                  firstName={firstName}
                  lastName={lastName}
                  size="md"
                />
              ) : null}
              <div className="min-w-0">
                <span className="block truncate font-medium text-atg-fg">{fullName}</span>
                {email ? (
                  <span className="block truncate text-xs text-atg-muted">{email}</span>
                ) : null}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'employeeCode',
        header: tColumns('code'),
        cell: ({ row }) => (
          <span className="font-mono tabular-nums text-atg-fg">
            {row.original.employeeCode ?? emptyDash}
          </span>
        ),
      },
      {
        accessorKey: 'jobTitle',
        header: tEmployeeColumns('jobTitle'),
        cell: ({ row }) => (
          <span className="text-atg-muted">{row.original.jobTitle ?? emptyDash}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: tColumns('status'),
        meta: { align: 'center' },
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <DataTableBadge variant={statusVariants[status]}>
              {statusLabels[status]}
            </DataTableBadge>
          );
        },
      },
    ];

    if (!lockedOrganizationId) {
      base.splice(4, 0, {
        id: 'organization',
        header: tColumns('organization'),
        cell: ({ row }) => {
          const orgId = row.original.organizationId;
          if (!orgId) {
            return <span className="text-atg-muted">{emptyDash}</span>;
          }
          const orgName = orgNameById.get(orgId) ?? orgId.slice(0, 8);
          return (
            <Link
              href={`/organisations/${orgId}`}
              aria-label={tList('viewOrganization', { name: orgName })}
              className="inline-flex max-w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-atg-surface"
            >
              <DataTableBadge
                variant="default"
                className="max-w-[12rem] truncate transition-colors hover:bg-primary/10 hover:text-primary"
              >
                {orgName}
              </DataTableBadge>
            </Link>
          );
        },
      });
    }

    base.push({
      id: 'actions',
      header: tColumns('actions'),
      meta: { align: 'right' },
      cell: ({ row }) => {
        const employee = row.original;
        return (
          <DataTableActions className="opacity-90 transition-opacity group-hover:opacity-100">
            <DataTableActionButton action="edit" href={`/utilisateurs/employes/${employee.id}`} />
            <DataTableActionButton
              action="delete"
              onClick={() => handleDeleteRequest(employee)}
              disabled={deletingId === employee.id}
              loading={deletingId === employee.id}
            />
          </DataTableActions>
        );
      },
    });

    return base;
  }, [
    deletingId,
    emptyDash,
    handleDeleteRequest,
    lockedOrganizationId,
    orgNameById,
    statusLabels,
    tColumns,
    tEmployeeColumns,
    tList,
  ]);

  const isLoading = state.status === 'loading';
  const isError = state.status === 'error';
  const employees = state.status === 'ready' ? state.employees : [];
  const hasFilters =
    search.trim().length > 0 ||
    statusFilter !== '' ||
    (!lockedOrganizationId && organizationFilter !== '');
  const emptyMessage = hasFilters
    ? tList('emptyFiltered')
    : lockedOrganizationId
      ? tList('emptyOrganization')
      : tList('emptyDefault');

  const newEmployeeHref = lockedOrganizationId
    ? `/utilisateurs/employes/nouveau?organizationId=${lockedOrganizationId}`
    : '/utilisateurs/employes/nouveau';

  const confirmLabel = confirmTarget
    ? `${confirmTarget.user?.email ?? confirmTarget.employeeCode ?? confirmTarget.id}`
    : '';

  return (
    <>
      <AlertDialog
        open={!!confirmTarget}
        onOpenChange={(open) => { if (!open) setConfirmTarget(null); }}
        title={tList('deleteTitle')}
        description={tList('deleteDescription', { label: confirmLabel })}
        confirmLabel={tActions('delete')}
        cancelLabel={tActions('cancel')}
        variant="danger"
        loading={!!deletingId}
        error={deleteError}
        onConfirm={() => void handleDeleteConfirm()}
      />
    <div className={embedded ? 'space-y-4' : 'space-y-6'}>
      <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end lg:justify-between">
        <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="min-w-[200px] flex-1 sm:max-w-md">
            <Input
              name="search"
              type="search"
              placeholder={tList('searchPlaceholder')}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              aria-label={tList('searchAria')}
            />
          </div>
          <div>
            <label htmlFor={statusFilterId} className="mb-2 block text-sm font-medium text-atg-fg">
              {tFilters('status')}
            </label>
            <select
              id={statusFilterId}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as StatusFilter);
                setPage(1);
              }}
              className="w-full min-w-[140px] rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="">{tCommonFilters('all')}</option>
              <option value="active">{statusLabels.active}</option>
              <option value="on_leave">{statusLabels.on_leave}</option>
              <option value="terminated">{statusLabels.terminated}</option>
            </select>
          </div>
          {!lockedOrganizationId ? (
            <div>
              <label htmlFor={orgFilterId} className="mb-2 block text-sm font-medium text-atg-fg">
                {tFilters('organization')}
              </label>
              <select
                id={orgFilterId}
                value={organizationFilter}
                onChange={(e) => {
                  setOrganizationFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full min-w-[180px] rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="">{tCommonFilters('allFeminine')}</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>
        <Button href={newEmployeeHref}>{tNav('links.newEmployee')}</Button>
      </div>

      {deleteError ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {deleteError}
        </p>
      ) : null}

      {isError ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {state.message}
        </p>
      ) : (
        <>
          <Card variant="dashboard" padding="none" className="overflow-hidden">
            <DataTable
              columns={columns}
              data={employees}
              isLoading={isLoading}
              emptyMessage={emptyMessage}
              emptyVariant={hasFilters ? 'search' : 'default'}
              getRowId={(row) => row.id}
              aria-label={tList('ariaLabel')}
            />
          </Card>

          {state.status === 'ready' ? (
            <DataTablePagination
              page={page}
              pageSize={PAGE_SIZE}
              totalPages={state.totalPages}
              totalItems={state.total}
              itemLabel={tPagination('employee')}
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}
    </div>
    </>
  );
}

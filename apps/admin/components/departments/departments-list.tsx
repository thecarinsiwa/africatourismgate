'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  AlertDialog,
  Button,
  Card,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  DataTablePagination,
  Input,
  Modal,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { Department, OrganizationListItem } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { ReferentialListToolbar } from '../referential-list-toolbar';
import { getApiClient } from '../../lib/auth/api';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

type FormValues = {
  organizationId: string;
  name: string;
  description: string;
};

const emptyForm: FormValues = { organizationId: '', name: '', description: '' };

export function DepartmentsList() {
  const { departments: getDepartmentsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.departments');
  const tCommon = useTranslations('modules.common');
  const tPagination = useTranslations('modules.common.pagination');
  const tActions = useTranslations('common.actions');
  const tFilters = useTranslations('modules.common.filters');
  const emptyDash = tCommon('empty.dash');
  const orgFilterId = useId();
  const formOrgId = useId();

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [canWrite, setCanWrite] = useState(false);
  const [userOrganizationId, setUserOrganizationId] = useState<string | null>(null);
  const [organizationFilter, setOrganizationFilter] = useState('');
  const [organizations, setOrganizations] = useState<OrganizationListItem[]>([]);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; departments: Department[]; total: number; totalPages: number }
  >({ status: 'loading' });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [formValues, setFormValues] = useState<FormValues>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<Department | null>(null);

  const orgNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const org of organizations) {
      map.set(org.id, org.name);
    }
    return map;
  }, [organizations]);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        const client = getApiClient();
        const me = await client.getAuthMe();
        if (cancelled) return;
        setIsSuperAdmin(me.isSuperAdmin);
        setCanWrite(me.isSuperAdmin || me.permissions.includes('departments.write'));
        setUserOrganizationId(me.user.organizationId ?? null);
        if (me.isSuperAdmin) {
          const orgs = await client.listOrganizations({ page: 1, limit: 100 });
          if (!cancelled) setOrganizations(orgs.data);
        }
      } catch {
        if (!cancelled) {
          setCanWrite(false);
        }
      }
    }
    void init();
    return () => {
      cancelled = true;
    };
  }, []);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listDepartments({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        organizationId: organizationFilter || undefined,
      });
      setState({
        status: 'ready',
        departments: result.data,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      setState({ status: 'error', message: getDepartmentsErrorMessage(error) });
    }
  }, [page, search, organizationFilter, getDepartmentsErrorMessage]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const q = searchInput.trim();
    const timer = window.setTimeout(() => {
      setSearch((prev) => {
        if (prev !== q) setPage(1);
        return q;
      });
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  function openForm(department?: Department) {
    if (department) {
      setEditing(department);
      setFormValues({
        organizationId: department.organizationId,
        name: department.name,
        description: department.description ?? '',
      });
    } else {
      setEditing(null);
      setFormValues({
        ...emptyForm,
        organizationId: organizationFilter || userOrganizationId || '',
      });
    }
    setFormError(null);
    setShowForm(true);
  }

  function resetForm() {
    setFormValues(emptyForm);
    setEditing(null);
    setShowForm(false);
    setFormError(null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (!formValues.name.trim()) {
      setFormError(tCommon('validation.nameRequired'));
      return;
    }
    if (!editing && !formValues.organizationId.trim()) {
      setFormError(t('form.validation.organizationRequired'));
      return;
    }
    setSubmitting(true);
    try {
      const client = getApiClient();
      if (editing) {
        await client.updateDepartment(editing.id, {
          name: formValues.name.trim(),
          description: formValues.description.trim()
            ? formValues.description.trim()
            : null,
        });
      } else {
        await client.createDepartment({
          organizationId: formValues.organizationId.trim(),
          name: formValues.name.trim(),
          ...(formValues.description.trim()
            ? { description: formValues.description.trim() }
            : {}),
        });
      }
      resetForm();
      await load();
    } catch (error) {
      setFormError(getDepartmentsErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  const handleDeleteRequest = useCallback((department: Department) => {
    setConfirmTarget(department);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!confirmTarget) return;
    const department = confirmTarget;
    setConfirmTarget(null);
    setDeleteError(null);
    setDeletingId(department.id);
    try {
      await getApiClient().deleteDepartment(department.id);
      await load();
    } catch (error) {
      setDeleteError(getDepartmentsErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  }, [confirmTarget, getDepartmentsErrorMessage, load]);

  const columns = useMemo<ColumnDef<Department, unknown>[]>(
    () => [
      { accessorKey: 'name', header: tCommon('columns.name') },
      ...(isSuperAdmin
        ? ([
            {
              id: 'organization',
              header: tCommon('columns.organization'),
              cell: ({ row }) =>
                orgNameById.get(row.original.organizationId) ??
                row.original.organizationId.slice(0, 8),
            },
          ] as ColumnDef<Department, unknown>[])
        : []),
      {
        accessorKey: 'description',
        header: tCommon('columns.description'),
        cell: ({ row }) => row.original.description ?? emptyDash,
      },
      ...(canWrite
        ? ([
            {
              id: 'actions',
              header: tCommon('columns.actions'),
              meta: { align: 'right' },
              cell: ({ row }) => (
                <DataTableActions>
                  <DataTableActionButton
                    action="edit"
                    onClick={() => openForm(row.original)}
                  />
                  <DataTableActionButton
                    action="delete"
                    onClick={() => handleDeleteRequest(row.original)}
                    disabled={deletingId === row.original.id}
                    loading={deletingId === row.original.id}
                  />
                </DataTableActions>
              ),
            },
          ] as ColumnDef<Department, unknown>[])
        : []),
    ],
    [
      canWrite,
      deletingId,
      emptyDash,
      handleDeleteRequest,
      isSuperAdmin,
      orgNameById,
      tCommon,
    ],
  );

  const departments = state.status === 'ready' ? state.departments : [];
  const emptyMessage =
    search.trim().length > 0 ? t('list.emptySearch') : t('list.emptyDefault');

  return (
    <>
      <AlertDialog
        open={!!confirmTarget}
        onOpenChange={(open) => {
          if (!open) setConfirmTarget(null);
        }}
        title={t('list.deleteTitle')}
        description={
          confirmTarget ? t('list.deleteConfirm', { name: confirmTarget.name }) : ''
        }
        confirmLabel={t('list.deleteConfirmButton')}
        cancelLabel={tActions('cancel')}
        variant="danger"
        loading={!!deletingId}
        error={deleteError}
        onConfirm={() => void handleDeleteConfirm()}
      />
      <div className="space-y-6">
        <ReferentialListToolbar
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          placeholder={t('list.searchPlaceholder')}
          ariaLabel={t('list.searchAria')}
          action={
            canWrite ? (
              <Button type="button" onClick={() => openForm()}>
                {t('list.new')}
              </Button>
            ) : undefined
          }
        />

        {isSuperAdmin ? (
          <div className="max-w-xs">
            <label htmlFor={orgFilterId} className="mb-2 block text-sm font-medium text-atg-fg">
              {tCommon('columns.organization')}
            </label>
            <select
              id={orgFilterId}
              value={organizationFilter}
              onChange={(e) => {
                setOrganizationFilter(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="">{tFilters('allFeminine')}</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <Modal
          open={showForm}
          onOpenChange={(open) => {
            if (!open && !submitting) resetForm();
          }}
          title={editing ? t('list.edit') : t('list.new')}
          showClose
          className="max-w-lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError ? (
              <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                {formError}
              </p>
            ) : null}
            {!editing && isSuperAdmin ? (
              <div>
                <label htmlFor={formOrgId} className="mb-2 block text-sm font-medium text-atg-fg">
                  {tCommon('columns.organization')}
                </label>
                <select
                  id={formOrgId}
                  value={formValues.organizationId}
                  onChange={(e) =>
                    setFormValues((prev) => ({ ...prev, organizationId: e.target.value }))
                  }
                  className="w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                  required
                >
                  <option value="">{t('form.selectOrganization')}</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
            <Input
              label={tCommon('columns.name')}
              value={formValues.name}
              onChange={(e) => setFormValues((p) => ({ ...p, name: e.target.value }))}
            />
            <Input
              label={tCommon('columns.description')}
              value={formValues.description}
              onChange={(e) =>
                setFormValues((p) => ({ ...p, description: e.target.value }))
              }
            />
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={resetForm} disabled={submitting}>
                {tActions('cancel')}
              </Button>
              <Button type="submit" loading={submitting}>
                {editing ? tActions('save') : tActions('create')}
              </Button>
            </div>
          </form>
        </Modal>

        {state.status === 'error' ? (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {state.message}
          </p>
        ) : (
          <>
            <Card variant="dashboard" padding="none">
              <DataTable
                columns={columns}
                data={departments}
                isLoading={state.status === 'loading'}
                emptyMessage={emptyMessage}
                emptyVariant={search.trim().length > 0 ? 'search' : 'default'}
                getRowId={(r) => r.id}
              />
            </Card>
            {state.status === 'ready' ? (
              <DataTablePagination
                page={page}
                pageSize={PAGE_SIZE}
                totalPages={state.totalPages}
                totalItems={state.total}
                itemLabel={tPagination('department')}
                onPageChange={setPage}
              />
            ) : null}
          </>
        )}
      </div>
    </>
  );
}

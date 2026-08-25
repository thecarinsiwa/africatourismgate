'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  AlertDialog,
  Button,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  DataTableBadge,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { OrganizationBankAccount, OrganizationListItem } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSetAdminPageMeta } from '../admin-page-meta-context';
import { getApiClient } from '../../lib/auth/api';
import { maskAccountNumberForDisplay } from '../../lib/bank-account-masking';
import { useUnsavedChangesGuard } from '../rbac/use-unsaved-changes-guard';
import { ParametresPageLayout } from './parametres-subnav';
import { OrganizationBankAccountForm } from './organization-bank-account-form';
import {
  resolveInitialOrganizationId,
} from './organization-settings-form';

export function OrganizationBankAccountsList() {
  const { organizationSettings: getOrganizationSettingsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.settings');
  const tBank = useTranslations('modules.settings.bankAccounts');
  const tCommon = useTranslations('modules.common');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [accessError, setAccessError] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<OrganizationListItem[]>([]);
  const [accounts, setAccounts] = useState<OrganizationBankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [editing, setEditing] = useState<OrganizationBankAccount | null>(null);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OrganizationBankAccount | null>(null);
  const [formDirty, setFormDirty] = useState(false);
  const { dialogOpen, setDialogOpen, requestAction, confirmDiscard, cancelDiscard } =
    useUnsavedChangesGuard(formDirty);

  useSetAdminPageMeta({ title: tBank('page.title') });

  const loadAccounts = useCallback(async (orgId: string, superAdmin = false) => {
    setLoading(true);
    setListError(null);
    try {
      const result = await getApiClient().listOrganizationBankAccounts({
        ...(superAdmin ? { organizationId: orgId } : {}),
        page: 1,
        limit: 100,
      });
      setAccounts(result.data);
    } catch (error) {
      setListError(getOrganizationSettingsErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [getOrganizationSettingsErrorMessage]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const client = getApiClient();
        const me = await client.getAuthMe();
        const canRead =
          me.isSuperAdmin ||
          me.permissions.includes('organization_bank_accounts.read');
        if (!canRead) {
          if (!cancelled) {
            setAccessError(tBank('page.denied'));
          }
          return;
        }

        const orgId = resolveInitialOrganizationId(
          me.isSuperAdmin,
          me.user.organizationId,
          searchParams.get('organizationId'),
        );

        if (!cancelled) {
          setIsSuperAdmin(me.isSuperAdmin);
          setOrganizationId(orgId);
        }

        if (me.isSuperAdmin) {
          const orgs = await client.listOrganizations({ page: 1, limit: 100 });
          if (!cancelled) setOrganizations(orgs.data);
        }

        if (!cancelled) await loadAccounts(orgId, me.isSuperAdmin);
      } catch (error) {
        if (!cancelled) {
          setAccessError(getOrganizationSettingsErrorMessage(error));
        }
      }
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, [searchParams, loadAccounts, tBank, getOrganizationSettingsErrorMessage]);

  const handleOrganizationChange = useCallback(
    (id: string) => {
      setOrganizationId(id);
      setEditing(null);
      setCreating(false);
      const params = new URLSearchParams(searchParams.toString());
      params.set('organizationId', id);
      router.replace(`/parametres/comptes?${params.toString()}`);
      void loadAccounts(id, isSuperAdmin);
    },
    [router, searchParams, loadAccounts],
  );

  const handleDeleteRequest = useCallback((account: OrganizationBankAccount) => {
    setDeleteTarget(account);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget || !organizationId) return;
    const account = deleteTarget;
    setDeleteTarget(null);
    setDeleteError(null);
    setDeletingId(account.id);
    try {
      await getApiClient().deleteOrganizationBankAccount(
        account.id,
        isSuperAdmin ? organizationId : undefined,
      );
      await loadAccounts(organizationId, isSuperAdmin);
    } catch (error) {
      setDeleteError(getOrganizationSettingsErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  }, [deleteTarget, organizationId, isSuperAdmin, loadAccounts, getOrganizationSettingsErrorMessage]);

  const columns = useMemo<ColumnDef<OrganizationBankAccount, unknown>[]>(
    () => [
      {
        accessorKey: 'bankName',
        header: tBank('list.columns.bank'),
        cell: ({ row }) => <span className="text-atg-fg">{row.original.bankName}</span>,
      },
      {
        accessorKey: 'accountName',
        header: tBank('list.columns.account'),
        cell: ({ row }) => <span className="text-atg-fg">{row.original.accountName}</span>,
      },
      {
        id: 'accountNumber',
        header: tBank('list.columns.accountNumber'),
        cell: ({ row }) => (
          <span className="font-mono text-sm">
            {maskAccountNumberForDisplay(row.original.accountNumber)}
          </span>
        ),
      },
      {
        accessorKey: 'currency',
        header: tBank('list.columns.currency'),
        cell: ({ row }) => row.original.currency,
      },
      {
        id: 'isDefault',
        header: tBank('list.columns.isDefault'),
        meta: { align: 'center' },
        cell: ({ row }) =>
          row.original.isDefault ? (
            <DataTableBadge variant="success">{tCommon('boolean.yes')}</DataTableBadge>
          ) : (
            <span className="text-atg-muted">{tCommon('empty.dash')}</span>
          ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <DataTableActions>
            <DataTableActionButton
              action="edit"
              onClick={() => {
                setCreating(false);
                setEditing(row.original);
              }}
            />
            <DataTableActionButton
              action="delete"
              loading={deletingId === row.original.id}
              onClick={() => handleDeleteRequest(row.original)}
            />
          </DataTableActions>
        ),
      },
    ],
    [deletingId, handleDeleteRequest, tBank, tCommon],
  );

  if (accessError) {
    return (
      <ParametresPageLayout>
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {accessError}
        </p>
      </ParametresPageLayout>
    );
  }

  if (!organizationId) {
    return (
      <ParametresPageLayout>
        <p className="text-sm text-atg-muted">{t('form.loading')}</p>
      </ParametresPageLayout>
    );
  }

  const selectClass =
    'mb-6 w-full max-w-md rounded-lg border border-atg-border bg-atg-bg px-3 py-2 text-sm text-atg-fg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary';

  return (
    <>
      <ParametresPageLayout
        onSubnavNavigate={formDirty ? (_href, proceed) => requestAction(proceed) : undefined}
      >
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <p className="text-sm text-atg-muted">{tBank('page.intro')}</p>
          {!creating && !editing ? (
            <Button onClick={() => setCreating(true)}>{tBank('list.newButton')}</Button>
          ) : null}
        </div>

        {isSuperAdmin && organizations.length > 0 ? (
          <select
            className={selectClass}
            value={organizationId}
            onChange={(e) => handleOrganizationChange(e.target.value)}
            aria-label={tBank('list.orgSelectAria')}
          >
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
        ) : null}

        {creating && organizationId ? (
          <div className="mb-8">
            <OrganizationBankAccountForm
              organizationId={organizationId}
              isSuperAdmin={isSuperAdmin}
              onSuccess={() => {
                setCreating(false);
                setFormDirty(false);
                void loadAccounts(organizationId, isSuperAdmin);
              }}
              onCancel={() => {
                setCreating(false);
                setFormDirty(false);
              }}
              onDirtyChange={setFormDirty}
            />
          </div>
        ) : null}

        {editing && organizationId ? (
          <div className="mb-8">
            <OrganizationBankAccountForm
              organizationId={organizationId}
              isSuperAdmin={isSuperAdmin}
              account={editing}
              onSuccess={() => {
                setEditing(null);
                setFormDirty(false);
                void loadAccounts(organizationId, isSuperAdmin);
              }}
              onCancel={() => {
                setEditing(null);
                setFormDirty(false);
              }}
              onDirtyChange={setFormDirty}
            />
          </div>
        ) : null}

        {listError ? (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {listError}
          </p>
        ) : loading ? (
          <p className="text-sm text-atg-muted">{t('form.loading')}</p>
        ) : (
          <DataTable columns={columns} data={accounts} emptyMessage={tBank('list.empty')} />
        )}
      </ParametresPageLayout>
      <AlertDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={t('unsaved.title')}
        description={t('unsaved.description')}
        confirmLabel={t('unsaved.confirm')}
        cancelLabel={t('unsaved.cancel')}
        variant="danger"
        onConfirm={confirmDiscard}
        onCancel={cancelDiscard}
      />
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title={tBank('list.deleteTitle')}
        description={tBank('list.deleteConfirm')}
        confirmLabel={tBank('list.deleteConfirmButton')}
        cancelLabel={tBank('list.cancel')}
        variant="danger"
        loading={!!deletingId}
        error={deleteError}
        onConfirm={() => void handleDeleteConfirm()}
      />
    </>
  );
}

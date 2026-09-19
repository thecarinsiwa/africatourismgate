'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  AlertDialog,
  Button,
  Card,
  DataTableActionButton,
  DataTableActions,
  DataTableBadge,
} from '@africatourismgate/ui';
import type { OrganizationBankAccount, OrganizationListItem } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSetAdminPageMeta } from '../admin-page-meta-context';
import { AdminListPageHeader } from '../pages/admin-list-page-header';
import { getApiClient } from '../../lib/auth/api';
import { maskAccountNumberForDisplay } from '../../lib/bank-account-masking';
import { useUnsavedChangesGuard } from '../rbac/use-unsaved-changes-guard';
import { OrganizationOrgSelector } from '../organizations/organization-org-selector';
import { BankAccountsStatCards } from './bank-accounts-stat-cards';
import { OrganizationBankAccountCreateModal } from './organization-bank-account-create-modal';
import { OrganizationBankAccountEditModal } from './organization-bank-account-edit-modal';
import { ParametresPageLayout } from './parametres-subnav';
import { resolveInitialOrganizationId } from './organization-settings-form';

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
  const [editFormDirty, setEditFormDirty] = useState(false);
  const [createFormDirty, setCreateFormDirty] = useState(false);
  const { dialogOpen, setDialogOpen, requestAction, confirmDiscard, cancelDiscard } =
    useUnsavedChangesGuard(editFormDirty || createFormDirty);

  useSetAdminPageMeta({ title: tBank('page.title') });

  const loadAccounts = useCallback(
    async (orgId: string, superAdmin = false) => {
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
    },
    [getOrganizationSettingsErrorMessage],
  );

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
      const applyChange = () => {
        setOrganizationId(id);
        setEditing(null);
        setCreating(false);
        setCreateFormDirty(false);
        setEditFormDirty(false);
        const params = new URLSearchParams(searchParams.toString());
        params.set('organizationId', id);
        router.replace(`/parametres/comptes?${params.toString()}`);
        void loadAccounts(id, isSuperAdmin);
      };
      if (editFormDirty || createFormDirty) {
        requestAction(applyChange);
        return;
      }
      applyChange();
    },
    [
      router,
      searchParams,
      loadAccounts,
      isSuperAdmin,
      editFormDirty,
      createFormDirty,
      requestAction,
    ],
  );

  const handleCreateModalOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        setCreating(true);
        return;
      }
      if (createFormDirty) {
        requestAction(() => {
          setCreating(false);
          setCreateFormDirty(false);
        });
        return;
      }
      setCreating(false);
      setCreateFormDirty(false);
    },
    [createFormDirty, requestAction],
  );

  const handleEditModalOpenChange = useCallback(
    (open: boolean) => {
      if (open) return;
      if (editFormDirty) {
        requestAction(() => {
          setEditing(null);
          setEditFormDirty(false);
        });
        return;
      }
      setEditing(null);
      setEditFormDirty(false);
    },
    [editFormDirty, requestAction],
  );

  const handleEditRequest = useCallback(
    (account: OrganizationBankAccount) => {
      const openEdit = () => {
        setCreating(false);
        setCreateFormDirty(false);
        setEditing(account);
      };
      if (creating && createFormDirty) {
        requestAction(openEdit);
        return;
      }
      openEdit();
    },
    [creating, createFormDirty, requestAction],
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
  }, [
    deleteTarget,
    organizationId,
    isSuperAdmin,
    loadAccounts,
    getOrganizationSettingsErrorMessage,
  ]);

  const sortedAccounts = useMemo(
    () =>
      [...accounts].sort((a, b) => {
        if (a.isDefault !== b.isDefault) return a.isDefault ? -1 : 1;
        return a.bankName.localeCompare(b.bankName, undefined, { sensitivity: 'base' });
      }),
    [accounts],
  );

  if (accessError) {
    return (
      <ParametresPageLayout>
        <div className="min-w-0">
          <AdminListPageHeader routePath="parametres/comptes" />
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {accessError}
          </p>
        </div>
      </ParametresPageLayout>
    );
  }

  if (!organizationId) {
    return (
      <ParametresPageLayout>
        <div className="min-w-0">
          <AdminListPageHeader routePath="parametres/comptes" />
          <p className="text-sm text-atg-muted">{t('form.loading')}</p>
        </div>
      </ParametresPageLayout>
    );
  }

  return (
    <>
      <ParametresPageLayout
        onSubnavNavigate={
          editFormDirty || createFormDirty
            ? (_href, proceed) => requestAction(proceed)
            : undefined
        }
      >
        <div className="min-w-0 space-y-6">
          <AdminListPageHeader
            routePath="parametres/comptes"
            actions={
              !editing && !creating ? (
                <Button onClick={() => setCreating(true)}>{tBank('list.newButton')}</Button>
              ) : undefined
            }
          />

          {isSuperAdmin && organizations.length > 0 ? (
            <OrganizationOrgSelector
              organizations={organizations}
              value={organizationId}
              onChange={handleOrganizationChange}
              label={tBank('list.orgSelectAria')}
              className="max-w-md"
            />
          ) : null}

          <BankAccountsStatCards
            accounts={accounts}
            loading={loading}
            error={listError}
          />

          <Card variant="dashboard" padding="sm" className="min-w-0">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-atg-fg">
                  {tBank('list.sectionTitle')}
                </h2>
                <p className="text-xs text-atg-muted">{tBank('list.sectionHint')}</p>
              </div>
              {!editing && !creating ? (
                <Button size="sm" onClick={() => setCreating(true)}>
                  {tBank('list.newButton')}
                </Button>
              ) : null}
            </div>

            {listError && !loading ? (
              <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                {listError}
              </p>
            ) : null}

            {loading ? (
              <p className="text-sm text-atg-muted">{t('form.loading')}</p>
            ) : sortedAccounts.length === 0 && !listError ? (
              <div className="rounded-lg border border-dashed border-atg-border px-4 py-10 text-center">
                <p className="text-sm text-atg-muted">{tBank('list.empty')}</p>
                <div className="mt-4">
                  <Button size="sm" onClick={() => setCreating(true)}>
                    {tBank('list.newButton')}
                  </Button>
                </div>
              </div>
            ) : (
              <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                {sortedAccounts.map((account) => (
                  <li key={account.id}>
                    <div
                      className={[
                        'flex h-full flex-col gap-3 rounded-lg border px-4 py-3 transition-colors',
                        account.isDefault
                          ? 'border-primary/40 bg-primary/5 ring-1 ring-primary/15'
                          : 'border-atg-border bg-atg-surface hover:border-atg-border',
                      ].join(' ')}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate text-sm font-semibold text-atg-fg">
                              {account.bankName}
                            </h3>
                            <span className="rounded-md bg-atg-elevated px-1.5 py-0.5 font-mono text-xs font-semibold uppercase text-atg-fg">
                              {account.currency}
                            </span>
                            {account.isDefault ? (
                              <DataTableBadge variant="success">
                                {tBank('list.defaultBadge')}
                              </DataTableBadge>
                            ) : null}
                          </div>
                          <p className="mt-1 truncate text-sm text-atg-muted">
                            {account.accountName}
                          </p>
                        </div>
                        <DataTableActions>
                          <DataTableActionButton
                            action="edit"
                            onClick={() => handleEditRequest(account)}
                          />
                          <DataTableActionButton
                            action="delete"
                            loading={deletingId === account.id}
                            onClick={() => handleDeleteRequest(account)}
                          />
                        </DataTableActions>
                      </div>

                      <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                        <div className="min-w-0">
                          <dt className="text-xs text-atg-muted">
                            {tBank('list.columns.accountNumber')}
                          </dt>
                          <dd className="mt-0.5 font-mono text-atg-fg">
                            {maskAccountNumberForDisplay(account.accountNumber)}
                          </dd>
                        </div>
                        <div className="min-w-0">
                          <dt className="text-xs text-atg-muted">{tBank('form.swiftBic')}</dt>
                          <dd className="mt-0.5 font-mono text-atg-fg">
                            {account.swiftBic?.trim() || tCommon('empty.dash')}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </ParametresPageLayout>
      {organizationId ? (
        <>
          <OrganizationBankAccountCreateModal
            open={creating}
            organizationId={organizationId}
            isSuperAdmin={isSuperAdmin}
            onOpenChange={handleCreateModalOpenChange}
            onDirtyChange={setCreateFormDirty}
            onSuccess={() => {
              setCreating(false);
              setCreateFormDirty(false);
              void loadAccounts(organizationId, isSuperAdmin);
            }}
          />
          <OrganizationBankAccountEditModal
            open={!!editing}
            account={editing}
            organizationId={organizationId}
            isSuperAdmin={isSuperAdmin}
            onOpenChange={handleEditModalOpenChange}
            onDirtyChange={setEditFormDirty}
            onSuccess={() => {
              setEditing(null);
              setEditFormDirty(false);
              void loadAccounts(organizationId, isSuperAdmin);
            }}
          />
        </>
      ) : null}
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
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
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

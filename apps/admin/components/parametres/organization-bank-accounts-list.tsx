'use client';

import {
  Button,
  DataTable,
  DataTableBadge,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { Organization, OrganizationBankAccount } from '@africatourismgate/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getApiClient } from '../../lib/auth/api';
import { getOrganizationSettingsErrorMessage } from '../../lib/organization-settings-errors';
import { ParametresSubnav } from './parametres-subnav';
import { OrganizationBankAccountForm } from './organization-bank-account-form';
import {
  resolveInitialOrganizationId,
} from './organization-settings-form';

export function OrganizationBankAccountsList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [accessError, setAccessError] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [accounts, setAccounts] = useState<OrganizationBankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [editing, setEditing] = useState<OrganizationBankAccount | null>(null);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadAccounts = useCallback(async (orgId: string) => {
    setLoading(true);
    setListError(null);
    try {
      const result = await getApiClient().listOrganizationBankAccounts({
        organizationId: orgId,
        page: 1,
        limit: 100,
      });
      setAccounts(result.data);
    } catch (error) {
      setListError(getOrganizationSettingsErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

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
            setAccessError('Vous n’avez pas la permission de consulter les comptes bancaires.');
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

        if (!cancelled) await loadAccounts(orgId);
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
  }, [searchParams, loadAccounts]);

  const handleOrganizationChange = useCallback(
    (id: string) => {
      setOrganizationId(id);
      setEditing(null);
      setCreating(false);
      const params = new URLSearchParams(searchParams.toString());
      params.set('organizationId', id);
      router.replace(`/parametres/comptes?${params.toString()}`);
      void loadAccounts(id);
    },
    [router, searchParams, loadAccounts],
  );

  const handleDelete = useCallback(
    async (account: OrganizationBankAccount) => {
      if (!organizationId) return;
      if (!window.confirm('Supprimer ce compte bancaire ?')) return;
      setDeletingId(account.id);
      try {
        await getApiClient().deleteOrganizationBankAccount(
          account.id,
          isSuperAdmin ? organizationId : undefined,
        );
        await loadAccounts(organizationId);
      } catch (error) {
        window.alert(getOrganizationSettingsErrorMessage(error));
      } finally {
        setDeletingId(null);
      }
    },
    [organizationId, isSuperAdmin, loadAccounts],
  );

  const columns = useMemo<ColumnDef<OrganizationBankAccount, unknown>[]>(
    () => [
      {
        accessorKey: 'bankName',
        header: 'Banque',
        cell: ({ row }) => <span className="text-atg-fg">{row.original.bankName}</span>,
      },
      {
        accessorKey: 'accountName',
        header: 'Compte',
        cell: ({ row }) => <span className="text-atg-fg">{row.original.accountName}</span>,
      },
      {
        id: 'accountNumber',
        header: 'N° compte',
        cell: ({ row }) => (
          <span className="font-mono text-sm">{row.original.accountNumber}</span>
        ),
      },
      {
        accessorKey: 'currency',
        header: 'Devise',
        cell: ({ row }) => row.original.currency,
      },
      {
        id: 'isDefault',
        header: 'Défaut',
        meta: { align: 'center' },
        cell: ({ row }) =>
          row.original.isDefault ? (
            <DataTableBadge variant="success">Oui</DataTableBadge>
          ) : (
            <span className="text-atg-muted">—</span>
          ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCreating(false);
                setEditing(row.original);
              }}
            >
              Modifier
            </Button>
            <Button
              variant="ghost"
              size="sm"
              loading={deletingId === row.original.id}
              onClick={() => void handleDelete(row.original)}
            >
              Supprimer
            </Button>
          </div>
        ),
      },
    ],
    [deletingId, handleDelete],
  );

  if (accessError) {
    return (
      <div>
        <ParametresSubnav />
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {accessError}
        </p>
      </div>
    );
  }

  if (!organizationId) {
    return (
      <div>
        <ParametresSubnav />
        <p className="text-sm text-atg-muted">Chargement…</p>
      </div>
    );
  }

  const selectClass =
    'mb-6 w-full max-w-md rounded-lg border border-atg-border bg-atg-bg px-3 py-2 text-sm text-atg-fg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary';

  return (
    <div>
      <ParametresSubnav />
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-atg-fg">Comptes bancaires</h1>
          <p className="mt-2 text-sm text-atg-muted">
            Comptes B2B de l’organisation. Le numéro de compte est partiellement masqué pour les
            administrateurs d’organisation.
          </p>
        </div>
        {!creating && !editing ? (
          <Button onClick={() => setCreating(true)}>Nouveau compte</Button>
        ) : null}
      </div>

      {isSuperAdmin && organizations.length > 0 ? (
        <select
          className={selectClass}
          value={organizationId}
          onChange={(e) => handleOrganizationChange(e.target.value)}
          aria-label="Organisation"
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
              void loadAccounts(organizationId);
            }}
            onCancel={() => setCreating(false)}
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
              void loadAccounts(organizationId);
            }}
            onCancel={() => setEditing(null)}
          />
        </div>
      ) : null}

      {listError ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {listError}
        </p>
      ) : loading ? (
        <p className="text-sm text-atg-muted">Chargement…</p>
      ) : (
        <DataTable columns={columns} data={accounts} emptyMessage="Aucun compte bancaire." />
      )}
    </div>
  );
}

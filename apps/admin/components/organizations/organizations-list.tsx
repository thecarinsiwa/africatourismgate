'use client';

import { Button, Card, cn, Input } from '@africatourismgate/ui';
import type { Organization, OrganizationStatus } from '@africatourismgate/types';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { getOrganizationsErrorMessage } from '../../lib/organizations-errors';

const PAGE_SIZE = 20;

const statusLabels: Record<OrganizationStatus, string> = {
  active: 'Actif',
  suspended: 'Suspendu',
  deleted: 'Supprimé',
};

const statusStyles: Record<OrganizationStatus, string> = {
  active: 'bg-primary/10 text-primary',
  suspended: 'bg-atg-border/80 text-atg-muted',
  deleted: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400',
};

export function OrganizationsList() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | {
        status: 'ready';
        organizations: Organization[];
        total: number;
        totalPages: number;
      }
  >({ status: 'loading' });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listOrganizations({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
      });
      setState({
        status: 'ready',
        organizations: result.data,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      setState({ status: 'error', message: getOrganizationsErrorMessage(error) });
    }
  }, [page, search]);

  useEffect(() => {
    void load();
  }, [load]);

  function handleSearchSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  async function handleDelete(org: Organization) {
    if (
      !window.confirm(
        `Supprimer l’organisation « ${org.name} » ? Cette action est réversible côté base.`,
      )
    ) {
      return;
    }
    setDeleteError(null);
    setDeletingId(org.id);
    try {
      await getApiClient().deleteOrganization(org.id);
      await load();
    } catch (error) {
      setDeleteError(getOrganizationsErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleSearchSubmit} className="flex flex-1 flex-col gap-2 sm:max-w-md sm:flex-row">
          <Input
            name="search"
            placeholder="Rechercher par nom ou slug…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            aria-label="Rechercher par nom ou slug"
          />
          <Button type="submit" variant="secondary" className="shrink-0">
            Rechercher
          </Button>
        </form>
        <Button href="/organisations/nouveau">Nouvelle organisation</Button>
      </div>

      {deleteError ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {deleteError}
        </p>
      ) : null}

      <Card variant="dashboard" padding="none">
        {state.status === 'loading' ? (
          <p className="p-5 text-sm text-atg-muted" aria-busy="true">
            Chargement…
          </p>
        ) : state.status === 'error' ? (
          <p className="p-5 text-sm text-red-600 dark:text-red-400" role="alert">
            {state.message}
          </p>
        ) : state.organizations.length === 0 ? (
          <p className="p-5 text-sm text-atg-muted">
            {search ? 'Aucune organisation ne correspond à votre recherche.' : 'Aucune organisation.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-atg-border text-atg-muted">
                  <th className="px-5 py-3 font-medium">Nom</th>
                  <th className="px-5 py-3 font-medium">Slug</th>
                  <th className="px-5 py-3 font-medium">Devise</th>
                  <th className="px-5 py-3 font-medium">Statut</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {state.organizations.map((org) => (
                  <tr key={org.id} className="border-b border-atg-border/60 last:border-0">
                    <td className="px-5 py-3 font-medium text-atg-fg">{org.name}</td>
                    <td className="px-5 py-3 font-mono text-xs text-atg-muted">{org.slug}</td>
                    <td className="px-5 py-3 text-atg-fg">{org.currency}</td>
                    <td className="px-5 py-3">
                      <span
                        className={cn(
                          'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                          statusStyles[org.status],
                        )}
                      >
                        {statusLabels[org.status]}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/organisations/${org.id}`}
                          className="text-sm font-medium text-primary hover:text-primary-hover"
                        >
                          Modifier
                        </Link>
                        <button
                          type="button"
                          onClick={() => void handleDelete(org)}
                          disabled={deletingId === org.id}
                          className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50 dark:text-red-400"
                        >
                          {deletingId === org.id ? 'Suppression…' : 'Supprimer'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {state.status === 'ready' && state.totalPages > 1 ? (
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-atg-muted">
            {state.total} organisation{state.total > 1 ? 's' : ''} — page {page} / {state.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Précédent
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= state.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Suivant
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

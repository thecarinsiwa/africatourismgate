'use client';

import type { Organization } from '@africatourismgate/types';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { getOrganizationsErrorMessage } from '../../lib/organizations-errors';
import { OrganizationForm } from './organization-form';

type OrganizationEditPageProps = {
  organizationId: string;
};

export function OrganizationEditPage({ organizationId }: OrganizationEditPageProps) {
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; organization: Organization }
  >({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const organization = await getApiClient().getOrganization(organizationId);
        if (!cancelled) {
          setState({ status: 'ready', organization });
        }
      } catch (error) {
        if (!cancelled) {
          setState({ status: 'error', message: getOrganizationsErrorMessage(error) });
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [organizationId]);

  if (state.status === 'loading') {
    return <p className="text-sm text-atg-muted">Chargement…</p>;
  }

  if (state.status === 'error') {
    return (
      <div className="space-y-4">
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
        <Link href="/organisations" className="text-sm font-medium text-primary hover:text-primary-hover">
          ← Retour à la liste
        </Link>
      </div>
    );
  }

  const { organization } = state;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atg-fg">Modifier l’organisation</h1>
        <p className="mt-2 text-sm text-atg-muted">
          {organization.name}{' '}
          <span className="font-mono text-xs text-atg-muted">({organization.slug})</span>
        </p>
      </div>
      <OrganizationForm
        mode="edit"
        organizationId={organizationId}
        initialOrganization={organization}
      />
    </div>
  );
}

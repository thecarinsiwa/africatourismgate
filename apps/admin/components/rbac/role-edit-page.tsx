'use client';

import type { Role } from '@africatourismgate/types';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { getRbacErrorMessage } from '../../lib/rbac-errors';
import { RoleForm } from './role-form';

type RoleEditPageProps = {
  roleId: string;
};

export function RoleEditPage({ roleId }: RoleEditPageProps) {
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; role: Role }
  >({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const role = await getApiClient().getRole(roleId);
        if (!cancelled) setState({ status: 'ready', role });
      } catch (error) {
        if (!cancelled) setState({ status: 'error', message: getRbacErrorMessage(error) });
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [roleId]);

  if (state.status === 'loading') {
    return <p className="text-sm text-atg-muted">Chargement…</p>;
  }

  if (state.status === 'error') {
    return (
      <div className="space-y-4">
        <p role="alert" className="text-sm text-red-600">
          {state.message}
        </p>
        <Link href="/systeme/roles" className="text-sm text-primary">
          ← Retour aux rôles
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atg-fg">
          {state.role.isSystem ? 'Rôle système' : 'Modifier le rôle'}
        </h1>
        <p className="mt-2 text-sm text-atg-muted">{state.role.name}</p>
      </div>
      <RoleForm mode="edit" roleId={roleId} initialRole={state.role} />
    </div>
  );
}

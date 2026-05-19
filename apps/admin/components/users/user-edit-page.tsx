'use client';

import type { User } from '@africatourismgate/types';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { getUsersErrorMessage } from '../../lib/users-errors';
import { UserForm } from './user-form';

type UserEditPageProps = {
  userId: string;
};

export function UserEditPage({ userId }: UserEditPageProps) {
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; user: User }
  >({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const user = await getApiClient().getUser(userId);
        if (!cancelled) {
          setState({ status: 'ready', user });
        }
      } catch (error) {
        if (!cancelled) {
          setState({ status: 'error', message: getUsersErrorMessage(error) });
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (state.status === 'loading') {
    return <p className="text-sm text-atg-muted">Chargement…</p>;
  }

  if (state.status === 'error') {
    return (
      <div className="space-y-4">
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
        <Link
          href="/utilisateurs"
          className="text-sm font-medium text-primary hover:text-primary-hover"
        >
          ← Retour à la liste
        </Link>
      </div>
    );
  }

  const { user } = state;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atg-fg">Modifier l’utilisateur</h1>
        <p className="mt-2 text-sm text-atg-muted">{user.email}</p>
      </div>
      <UserForm mode="edit" userId={userId} initialUser={user} />
    </div>
  );
}

'use client';

import { Button, Card } from '@africatourismgate/ui';
import type { User } from '@africatourismgate/types';
import { useCallback, useEffect, useId, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { getApiClient } from '../../lib/auth/api';
import { getUsersErrorMessage } from '../../lib/users-errors';

export type UserIdFilterBarProps = {
  /** Called when the selected user id changes (empty string = all users). */
  onUserIdChange: (userId: string) => void;
  /** Optional: receive the loaded user list for display elsewhere (e.g. table columns). */
  onUsersLoaded?: (users: User[]) => void;
  /** Skip internal fetch when users are provided by the parent. */
  users?: User[];
  className?: string;
};

export function UserIdFilterBar({
  onUserIdChange,
  onUsersLoaded,
  users: usersProp,
  className,
}: UserIdFilterBarProps) {
  const selectId = useId();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [userId, setUserId] = useState(() => searchParams.get('userId') ?? '');
  const [users, setUsers] = useState<User[]>(usersProp ?? []);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(!usersProp);

  useEffect(() => {
    const fromUrl = searchParams.get('userId') ?? '';
    setUserId(fromUrl);
  }, [searchParams]);

  useEffect(() => {
    onUserIdChange(userId);
  }, [userId, onUserIdChange]);

  useEffect(() => {
    if (usersProp) {
      setUsers(usersProp);
      onUsersLoaded?.(usersProp);
      setLoadingUsers(false);
    }
  }, [usersProp, onUsersLoaded]);

  useEffect(() => {
    if (usersProp) return;

    let cancelled = false;

    async function loadUsers() {
      setLoadingUsers(true);
      setUsersError(null);
      try {
        const result = await getApiClient().listUsers({
          page: 1,
          limit: 100,
          status: 'active',
        });
        if (!cancelled) {
          setUsers(result.data);
          onUsersLoaded?.(result.data);
        }
      } catch (error) {
        if (!cancelled) {
          setUsers([]);
          setUsersError(getUsersErrorMessage(error));
        }
      } finally {
        if (!cancelled) setLoadingUsers(false);
      }
    }

    void loadUsers();
    return () => {
      cancelled = true;
    };
  }, [usersProp, onUsersLoaded]);

  const syncUrl = useCallback(
    (nextUserId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (nextUserId) {
        params.set('userId', nextUserId);
      } else {
        params.delete('userId');
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    },
    [pathname, router, searchParams],
  );

  const handleSelectChange = useCallback(
    (value: string) => {
      setUserId(value);
      syncUrl(value);
    },
    [syncUrl],
  );

  const handleClear = useCallback(() => {
    setUserId('');
    syncUrl('');
  }, [syncUrl]);

  return (
    <Card className={`mb-6 p-4 ${className ?? ''}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="min-w-[240px] flex-1">
          <label htmlFor={selectId} className="mb-1 block text-xs font-medium text-atg-muted">
            Utilisateur
          </label>
          <select
            id={selectId}
            value={userId}
            onChange={(e) => handleSelectChange(e.target.value)}
            disabled={loadingUsers}
            className="w-full rounded-lg border border-atg-border bg-atg-elevated px-3 py-2 text-sm text-atg-fg outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-60"
          >
            <option value="">Tous les utilisateurs</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.firstName} {user.lastName} — {user.email}
              </option>
            ))}
          </select>
        </div>
        {userId ? (
          <Button type="button" variant="outline" size="sm" onClick={handleClear}>
            Effacer le filtre
          </Button>
        ) : null}
      </div>
      {usersError ? (
        <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">
          {usersError}
        </p>
      ) : null}
    </Card>
  );
}

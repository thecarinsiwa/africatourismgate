'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { Button, Card } from '@africatourismgate/ui';
import type { User } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useId, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { getApiClient } from '../../lib/auth/api';

export type UserIdFilterBarProps = {
  /** Called when the selected user id changes (empty string = all users). */
  onUserIdChange: (userId: string) => void;
  /** Optional: receive the loaded user list for display elsewhere (e.g. table columns). */
  onUsersLoaded?: (users: User[]) => void;
  /** Skip internal fetch when users are provided by the parent. */
  users?: User[];
  /** Affiche Du / Au et synchronise dateFrom / dateTo dans l’URL. */
  showDateRange?: boolean;
  /** Appelé quand l’intervalle change (chaînes vides = pas de filtre). */
  onDateRangeChange?: (dateFrom: string, dateTo: string) => void;
  className?: string;
};

export function UserIdFilterBar({
  onUserIdChange,
  onUsersLoaded,
  users: usersProp,
  showDateRange = false,
  onDateRangeChange,
  className,
}: UserIdFilterBarProps) {
  const { users: getUsersErrorMessage } = useAdminErrorMessages();
  const tFilter = useTranslations('modules.users.userIdFilter');
  const tCommonFilters = useTranslations('modules.common.filters');
  const selectId = useId();
  const dateFromId = useId();
  const dateToId = useId();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [userId, setUserId] = useState(() => searchParams.get('userId') ?? '');
  const [dateFrom, setDateFrom] = useState(() => searchParams.get('dateFrom') ?? '');
  const [dateTo, setDateTo] = useState(() => searchParams.get('dateTo') ?? '');
  const [users, setUsers] = useState<User[]>(usersProp ?? []);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(!usersProp);

  useEffect(() => {
    const fromUrl = searchParams.get('userId') ?? '';
    setUserId(fromUrl);
  }, [searchParams]);

  useEffect(() => {
    if (!showDateRange) return;
    setDateFrom(searchParams.get('dateFrom') ?? '');
    setDateTo(searchParams.get('dateTo') ?? '');
  }, [searchParams, showDateRange]);

  useEffect(() => {
    onUserIdChange(userId);
  }, [userId, onUserIdChange]);

  useEffect(() => {
    if (!showDateRange) return;
    onDateRangeChange?.(dateFrom, dateTo);
  }, [showDateRange, dateFrom, dateTo, onDateRangeChange]);

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
  }, [usersProp, onUsersLoaded, getUsersErrorMessage]);

  const syncUrl = useCallback(
    (next: { userId?: string; dateFrom?: string; dateTo?: string }) => {
      const params = new URLSearchParams(searchParams.toString());
      const nextUserId = next.userId ?? userId;
      const nextDateFrom = next.dateFrom ?? dateFrom;
      const nextDateTo = next.dateTo ?? dateTo;

      if (nextUserId) {
        params.set('userId', nextUserId);
      } else {
        params.delete('userId');
      }

      if (showDateRange) {
        if (nextDateFrom) {
          params.set('dateFrom', nextDateFrom);
        } else {
          params.delete('dateFrom');
        }
        if (nextDateTo) {
          params.set('dateTo', nextDateTo);
        } else {
          params.delete('dateTo');
        }
      }

      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    },
    [pathname, router, searchParams, userId, dateFrom, dateTo, showDateRange],
  );

  const handleSelectChange = useCallback(
    (value: string) => {
      setUserId(value);
      syncUrl({ userId: value });
    },
    [syncUrl],
  );

  const handleDateFromChange = useCallback(
    (value: string) => {
      setDateFrom(value);
      syncUrl({ dateFrom: value });
    },
    [syncUrl],
  );

  const handleDateToChange = useCallback(
    (value: string) => {
      setDateTo(value);
      syncUrl({ dateTo: value });
    },
    [syncUrl],
  );

  const handleClear = useCallback(() => {
    setUserId('');
    setDateFrom('');
    setDateTo('');
    syncUrl({ userId: '', dateFrom: '', dateTo: '' });
  }, [syncUrl]);

  const hasActiveFilters = Boolean(userId || (showDateRange && (dateFrom || dateTo)));

  return (
    <Card className={`mb-6 p-4 ${className ?? ''}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="min-w-[200px] flex-1">
          <label htmlFor={selectId} className="mb-1 block text-xs font-medium text-atg-muted">
            {tFilter('label')}
          </label>
          <select
            id={selectId}
            value={userId}
            onChange={(e) => handleSelectChange(e.target.value)}
            disabled={loadingUsers}
            className="w-full rounded-lg border border-atg-border bg-atg-elevated px-3 py-2 text-sm text-atg-fg outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-60"
          >
            <option value="">{tFilter('allUsers')}</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.firstName} {user.lastName} — {user.email}
              </option>
            ))}
          </select>
        </div>
        {showDateRange ? (
          <>
            <div className="min-w-[160px] flex-1 sm:max-w-[200px]">
              <label
                htmlFor={dateFromId}
                className="mb-1 block text-xs font-medium text-atg-muted"
              >
                {tCommonFilters('dateFrom')}
              </label>
              <input
                id={dateFromId}
                type="date"
                value={dateFrom}
                onChange={(e) => handleDateFromChange(e.target.value)}
                className="w-full rounded-lg border border-atg-border bg-atg-elevated px-3 py-2 text-sm text-atg-fg outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="min-w-[160px] flex-1 sm:max-w-[200px]">
              <label htmlFor={dateToId} className="mb-1 block text-xs font-medium text-atg-muted">
                {tCommonFilters('dateTo')}
              </label>
              <input
                id={dateToId}
                type="date"
                value={dateTo}
                min={dateFrom || undefined}
                onChange={(e) => handleDateToChange(e.target.value)}
                className="w-full rounded-lg border border-atg-border bg-atg-elevated px-3 py-2 text-sm text-atg-fg outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </>
        ) : null}
        {hasActiveFilters ? (
          <Button type="button" variant="outline" size="sm" onClick={handleClear}>
            {tCommonFilters('clear')}
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

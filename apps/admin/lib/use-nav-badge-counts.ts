'use client';

import { useEffect, useState } from 'react';
import type { AdminNavBadgeKey } from '../config/dashboard-nav.config';
import { getApiClient } from './auth/api';
import { isApiForbidden } from './auth/is-api-forbidden';
import { usePermissions } from './auth/use-permissions';

export type NavBadgeCounts = Partial<Record<AdminNavBadgeKey, number>>;

async function fetchBadgeTotal(fetch: () => Promise<number>): Promise<number | undefined> {
  try {
    return await fetch();
  } catch (error) {
    if (isApiForbidden(error)) {
      return undefined;
    }
    return undefined;
  }
}

/** Compteurs nav sidebar (avis pending, tickets ouverts) — silencieux si 403 ou erreur réseau. */
export function useNavBadgeCounts(): NavBadgeCounts {
  const { hasPermission, loading: permissionsLoading } = usePermissions();
  const [counts, setCounts] = useState<NavBadgeCounts>({});

  useEffect(() => {
    if (permissionsLoading) {
      return;
    }

    let cancelled = false;
    const client = getApiClient();
    const tasks: Promise<void>[] = [];
    const next: NavBadgeCounts = {};

    if (hasPermission('reviews.read')) {
      tasks.push(
        fetchBadgeTotal(async () => {
          const result = await client.listReviews({ status: 'pending', page: 1, limit: 1 });
          return result.meta.total;
        }).then((total) => {
          if (total !== undefined) {
            next.pendingReviews = total;
          }
        }),
      );
    }

    if (hasPermission('support_tickets.read')) {
      tasks.push(
        fetchBadgeTotal(async () => {
          const result = await client.listSupportTickets({ status: 'open', page: 1, limit: 1 });
          return result.meta.total;
        }).then((total) => {
          if (total !== undefined) {
            next.openSupportTickets = total;
          }
        }),
      );
    }

    if (tasks.length === 0) {
      setCounts({});
      return;
    }

    void Promise.all(tasks).then(() => {
      if (!cancelled) {
        setCounts(next);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [hasPermission, permissionsLoading]);

  return counts;
}

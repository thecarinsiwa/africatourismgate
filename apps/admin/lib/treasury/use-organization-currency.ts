'use client';

import { useEffect, useState } from 'react';
import {
  fetchOrganizationCurrency,
  useOrganizationCurrencyContext,
} from '../../components/organization-currency-provider';
import { FALLBACK_TREASURY_CURRENCY } from './currency-options';

/**
 * Loads `organizations.currency` for the given org id.
 * Without an id (or for the session organization), returns the Admin default currency.
 * Returns `null` while loading; falls back to the Admin default on error.
 */
export function useOrganizationCurrency(
  organizationId: string | undefined | null,
): string | null {
  const ctx = useOrganizationCurrencyContext();
  const sessionCurrency = ctx?.currency ?? FALLBACK_TREASURY_CURRENCY;
  const sessionLoading = ctx?.loading ?? false;
  const id = organizationId?.trim() || null;
  const useSession = !id || id === ctx?.organizationId;

  const [fetched, setFetched] = useState<{ id: string; currency: string | null } | null>(
    null,
  );

  useEffect(() => {
    if (useSession || !id) return;

    let cancelled = false;
    setFetched(null);

    void fetchOrganizationCurrency(id)
      .then((currency) => {
        if (!cancelled) setFetched({ id, currency });
      })
      .catch(() => {
        if (!cancelled) setFetched({ id, currency: null });
      });

    return () => {
      cancelled = true;
    };
  }, [id, useSession]);

  if (useSession) {
    return sessionLoading ? null : sessionCurrency;
  }
  if (fetched?.id !== id) return null;
  return fetched.currency ?? sessionCurrency;
}

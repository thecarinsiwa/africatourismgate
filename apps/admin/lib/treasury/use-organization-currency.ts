'use client';

import { useEffect, useState } from 'react';
import { getApiClient } from '../auth/api';
import {
  FALLBACK_TREASURY_CURRENCY,
  normalizeCurrencyCode,
} from './currency-options';

/**
 * Loads `organizations.currency` for the given org id.
 * Returns `null` while idle/loading; falls back to {@link FALLBACK_TREASURY_CURRENCY} on error.
 */
export function useOrganizationCurrency(
  organizationId: string | undefined | null,
): string | null {
  const [currency, setCurrency] = useState<string | null>(null);

  useEffect(() => {
    const id = organizationId?.trim();
    if (!id) {
      setCurrency(null);
      return;
    }

    let cancelled = false;
    setCurrency(null);

    void getApiClient()
      .getOrganization(id)
      .then((org) => {
        if (cancelled) return;
        setCurrency(
          normalizeCurrencyCode(org.currency) ?? FALLBACK_TREASURY_CURRENCY,
        );
      })
      .catch(() => {
        if (!cancelled) setCurrency(FALLBACK_TREASURY_CURRENCY);
      });

    return () => {
      cancelled = true;
    };
  }, [organizationId]);

  return currency;
}

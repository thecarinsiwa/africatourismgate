'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { getApiClient } from '../lib/auth/api';
import {
  FALLBACK_TREASURY_CURRENCY,
  normalizeCurrencyCode,
} from '../lib/treasury/currency-options';
import { useOrganizationThemeOptional } from './organization-theme-provider';

type OrganizationCurrencyContextValue = {
  /** Organization whose currency is the Admin default (same scope as the theme). */
  organizationId: string | null;
  /** ISO 4217 code; {@link FALLBACK_TREASURY_CURRENCY} until loaded or on error. */
  currency: string;
  loading: boolean;
  /** Immediately apply a known currency (e.g. right after saving the organization). */
  applyCurrency: (currency: string | null | undefined) => void;
  refreshCurrency: () => Promise<void>;
};

const OrganizationCurrencyContext =
  createContext<OrganizationCurrencyContextValue | null>(null);

/**
 * `GET /organizations/:id` may require `organizations.read`; regular users fall back
 * to `/auth/me/organizations`, which always includes their own organization.
 */
async function fetchOrganizationCurrency(organizationId: string): Promise<string | null> {
  const client = getApiClient();
  try {
    const org = await client.getOrganization(organizationId);
    return normalizeCurrencyCode(org.currency);
  } catch {
    const orgs = await client.listAuthOrganizations();
    const org = orgs.find((item) => item.id === organizationId);
    return normalizeCurrencyCode(org?.currency);
  }
}

export function OrganizationCurrencyProvider({ children }: { children: ReactNode }) {
  const theme = useOrganizationThemeOptional();
  const organizationId = theme?.organizationId ?? null;
  const themeLoading = theme?.loading ?? false;

  const [currency, setCurrency] = useState<string>(FALLBACK_TREASURY_CURRENCY);
  const [loading, setLoading] = useState(true);
  const lastLoadedOrgIdRef = useRef<string | null>(null);
  const requestIdRef = useRef(0);

  const loadCurrency = useCallback(
    async (options?: { force?: boolean }) => {
      if (!organizationId) return;
      if (!options?.force && lastLoadedOrgIdRef.current === organizationId) return;

      const requestId = ++requestIdRef.current;
      setLoading(true);
      try {
        const next = await fetchOrganizationCurrency(organizationId);
        if (requestId !== requestIdRef.current) return;
        setCurrency(next ?? FALLBACK_TREASURY_CURRENCY);
        lastLoadedOrgIdRef.current = organizationId;
      } catch {
        // Keep the last-known currency so API blips don't flip amounts to the fallback.
      } finally {
        if (requestId === requestIdRef.current) setLoading(false);
      }
    },
    [organizationId],
  );

  useEffect(() => {
    if (!organizationId) {
      if (!themeLoading) setLoading(false);
      return;
    }
    void loadCurrency();
  }, [loadCurrency, organizationId, themeLoading]);

  const applyCurrency = useCallback((next: string | null | undefined) => {
    const code = normalizeCurrencyCode(next);
    if (code) setCurrency(code);
  }, []);

  const refreshCurrency = useCallback(async () => {
    lastLoadedOrgIdRef.current = null;
    await loadCurrency({ force: true });
  }, [loadCurrency]);

  const value = useMemo(
    () => ({
      organizationId,
      currency,
      loading,
      applyCurrency,
      refreshCurrency,
    }),
    [organizationId, currency, loading, applyCurrency, refreshCurrency],
  );

  return (
    <OrganizationCurrencyContext.Provider value={value}>
      {children}
    </OrganizationCurrencyContext.Provider>
  );
}

export function useOrganizationCurrencyContext(): OrganizationCurrencyContextValue | null {
  return useContext(OrganizationCurrencyContext);
}

/**
 * Admin default currency: session organization's `currency`
 * (or the org targeted by `?organizationId` for super admins).
 * Safe outside the provider: returns {@link FALLBACK_TREASURY_CURRENCY}.
 */
export function useDefaultCurrency(): string {
  return useContext(OrganizationCurrencyContext)?.currency ?? FALLBACK_TREASURY_CURRENCY;
}

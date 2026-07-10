'use client';

import type { OrganizationSetting } from '@africatourismgate/types';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { getApiClient } from '../lib/auth/api';
import { usePermissions } from '../lib/auth/use-permissions';
import {
  applyFaviconToDocument,
  applyOrganizationBrandingToDocument,
  brandingFromPlatformSetting,
  clearOrganizationBrandingFromDocument,
  resolveThemeOrganizationId,
  type OrganizationBranding,
} from '../lib/organization-theme';
import { fetchPublicBranding } from '../lib/public-branding';

type OrganizationThemeContextValue = {
  organizationId: string | null;
  branding: OrganizationBranding | null;
  loading: boolean;
  applyBranding: (branding: OrganizationBranding) => void;
  refreshTheme: () => Promise<void>;
};

const OrganizationThemeContext = createContext<OrganizationThemeContextValue | null>(
  null,
);

export function useOrganizationTheme(): OrganizationThemeContextValue {
  const ctx = useContext(OrganizationThemeContext);
  if (!ctx) {
    throw new Error('useOrganizationTheme doit être utilisé dans OrganizationThemeProvider');
  }
  return ctx;
}

function findPlatformSetting(
  settings: OrganizationSetting[],
): OrganizationBranding {
  const platform = settings.find((s) => s.settingKey === 'platform');
  return brandingFromPlatformSetting(platform?.settingValue);
}

function brandingFromPublicBranding(
  publicBranding: Awaited<ReturnType<typeof fetchPublicBranding>>,
): OrganizationBranding {
  return {
    displayName: publicBranding.displayName,
    primaryColor: '#0B6E4F',
    secondaryColor: '#199a45',
    logoUrl: publicBranding.logoUrl,
    faviconUrl: publicBranding.faviconUrl,
  };
}

export function OrganizationThemeProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryOrgId = searchParams.get('organizationId');
  const { hasPermission, loading: permissionsLoading } = usePermissions();

  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [branding, setBranding] = useState<OrganizationBranding | null>(null);
  const [loading, setLoading] = useState(true);

  const resolvedOrgId = organizationId;
  const canReadSettings = hasPermission('organization_settings.read');

  const loadTheme = useCallback(async () => {
    setLoading(true);
    try {
      const client = getApiClient();
      const me = await client.getAuthMe();
      const orgId = resolveThemeOrganizationId(
        me.isSuperAdmin,
        me.user.organizationId,
        queryOrgId,
        pathname,
      );
      setOrganizationId(orgId);

      if (canReadSettings) {
        const settingsPage = await client.listOrganizationSettings({
          organizationId: orgId,
          page: 1,
          limit: 100,
        });
        const nextBranding = findPlatformSetting(settingsPage.data);
        setBranding(nextBranding);
        applyOrganizationBrandingToDocument(nextBranding);
        applyFaviconToDocument(nextBranding.faviconUrl);
      } else {
        const publicBranding = await fetchPublicBranding();
        const nextBranding = brandingFromPublicBranding(publicBranding);
        setBranding(nextBranding);
        applyOrganizationBrandingToDocument(nextBranding);
        applyFaviconToDocument(nextBranding.faviconUrl);
      }
    } catch {
      clearOrganizationBrandingFromDocument();
      applyFaviconToDocument(null);
      setBranding(null);
    } finally {
      setLoading(false);
    }
  }, [canReadSettings, pathname, queryOrgId]);

  useEffect(() => {
    if (permissionsLoading) return;
    void loadTheme();
  }, [loadTheme, permissionsLoading]);

  const applyBranding = useCallback((next: OrganizationBranding) => {
    setBranding(next);
    applyOrganizationBrandingToDocument(next);
    applyFaviconToDocument(next.faviconUrl);
  }, []);

  const value = useMemo(
    () => ({
      organizationId: resolvedOrgId,
      branding,
      loading,
      applyBranding,
      refreshTheme: loadTheme,
    }),
    [resolvedOrgId, branding, loading, applyBranding, loadTheme],
  );

  return (
    <OrganizationThemeContext.Provider value={value}>
      {children}
    </OrganizationThemeContext.Provider>
  );
}

/** Hook optionnel (hors provider) pour appliquer le thème localement. */
export function useOrganizationThemeOptional(): OrganizationThemeContextValue | null {
  return useContext(OrganizationThemeContext);
}

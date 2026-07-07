'use client';

import { normalizeBrandingAssetUrl } from '@africatourismgate/utils';
import { useEffect, useState } from 'react';
import { usePublicBranding } from '../../components/branding-provider';
import { getWebApiUrl } from '../api/get-api-url';

export const DEFAULT_PUBLIC_DISPLAY_NAME = 'Africa Tourism Gate';

type ResolvedBranding = {
  displayName: string;
  logoUrl: string | null;
};

export type { ResolvedBranding };

export function useResolvedPublicBranding() {
  const serverBranding = usePublicBranding();
  const [logoBroken, setLogoBroken] = useState(false);
  const [branding, setBranding] = useState<ResolvedBranding>({
    displayName: serverBranding?.displayName ?? DEFAULT_PUBLIC_DISPLAY_NAME,
    logoUrl: serverBranding?.logoUrl ?? null,
  });

  useEffect(() => {
    if (serverBranding) {
      setBranding({
        displayName: serverBranding.displayName,
        logoUrl: serverBranding.logoUrl,
      });
      setLogoBroken(false);
      return;
    }

    const apiUrl = getWebApiUrl();

    async function loadBranding() {
      try {
        const response = await fetch(`${apiUrl}/organization-settings/public/branding`, {
          headers: { Accept: 'application/json' },
          cache: 'no-store',
        });
        if (!response.ok) return;
        const payload = (await response.json()) as {
          displayName?: string;
          logoUrl?: string | null;
        };
        setBranding({
          displayName: payload.displayName?.trim() || DEFAULT_PUBLIC_DISPLAY_NAME,
          logoUrl: normalizeBrandingAssetUrl(payload.logoUrl?.trim() || null),
        });
        setLogoBroken(false);
      } catch {
        // Keep defaults if branding endpoint is unavailable.
      }
    }

    void loadBranding();
  }, [serverBranding]);

  return { branding, logoBroken, setLogoBroken };
}

'use client';

import type { PublicAuthVisual } from '@africatourismgate/types';
import { useEffect, useState } from 'react';
import { authVisualIconsFromPublic } from '../../lib/auth-visual';
import { fetchPublicBranding } from '../../lib/public-branding';

export function useAuthVisualConfig() {
  const [authVisual, setAuthVisual] = useState<PublicAuthVisual | undefined>();

  useEffect(() => {
    let cancelled = false;

    void fetchPublicBranding().then((branding) => {
      if (!cancelled) {
        setAuthVisual(branding.authVisual);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return authVisualIconsFromPublic(authVisual);
}

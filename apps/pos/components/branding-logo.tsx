'use client';

import { Logo } from '@africatourismgate/ui';
import { useEffect, useState } from 'react';
import { applyFaviconToDocument } from '../lib/document-branding';
import { fetchPublicBranding } from '../lib/public-branding';

type BrandingLogoProps = {
  href?: string;
  centered?: boolean;
  fallbackName?: string;
};

export function BrandingLogo({
  href,
  centered = false,
  fallbackName = 'Africa Tourism Gate',
}: BrandingLogoProps) {
  const [branding, setBranding] = useState<{
    displayName: string;
    logoUrl: string | null;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchPublicBranding().then((result) => {
      if (!cancelled) {
        setBranding(result);
        applyFaviconToDocument(result.faviconUrl);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Logo
      name={branding?.displayName ?? fallbackName}
      href={href}
      logoUrl={branding?.logoUrl ?? null}
      centered={centered}
    />
  );
}

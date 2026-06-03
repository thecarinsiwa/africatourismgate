'use client';

import { Logo } from '@africatourismgate/ui';
import { useEffect, useState } from 'react';
import { applyFaviconToDocument } from '../lib/organization-theme';
import { fetchPublicBranding } from '../lib/public-branding';
import { useOrganizationThemeOptional } from './organization-theme-provider';

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
  const orgTheme = useOrganizationThemeOptional();
  const [publicBranding, setPublicBranding] = useState<{
    displayName: string;
    logoUrl: string | null;
    faviconUrl: string | null;
  } | null>(null);

  useEffect(() => {
    if (orgTheme?.branding) return;
    let cancelled = false;
    void fetchPublicBranding().then((branding) => {
      if (!cancelled) {
        setPublicBranding(branding);
        applyFaviconToDocument(branding.faviconUrl);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [orgTheme?.branding]);

  const displayName =
    orgTheme?.branding?.displayName ??
    publicBranding?.displayName ??
    fallbackName;
  const logoUrl = orgTheme?.branding?.logoUrl ?? publicBranding?.logoUrl ?? null;

  return (
    <Logo
      name={displayName}
      href={href}
      logoUrl={logoUrl}
      centered={centered}
    />
  );
}

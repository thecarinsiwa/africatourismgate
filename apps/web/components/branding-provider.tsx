'use client';

import { createContext, useContext, type ReactNode } from 'react';

export type PublicBrandingValue = {
  displayName: string;
  logoUrl: string | null;
};

const BrandingContext = createContext<PublicBrandingValue | null>(null);

export function BrandingProvider({
  branding,
  children,
}: {
  branding: PublicBrandingValue;
  children: ReactNode;
}) {
  return (
    <BrandingContext.Provider value={branding}>{children}</BrandingContext.Provider>
  );
}

export function usePublicBranding(): PublicBrandingValue | null {
  return useContext(BrandingContext);
}

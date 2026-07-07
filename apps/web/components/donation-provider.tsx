'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { PublicDonation, PublicDonationsPayload } from '@africatourismgate/types';

const DonationContext = createContext<PublicDonationsPayload | null>(null);

export function DonationProvider({
  donations,
  children,
}: {
  donations: PublicDonationsPayload | null;
  children: ReactNode;
}) {
  return <DonationContext.Provider value={donations}>{children}</DonationContext.Provider>;
}

export function usePublicDonations(): PublicDonationsPayload | null {
  return useContext(DonationContext);
}

export function useNavbarDonation(): PublicDonation | null {
  const donations = usePublicDonations();
  return donations?.navbarFeatured ?? null;
}

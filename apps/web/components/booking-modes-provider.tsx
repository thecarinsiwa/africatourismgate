'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  DEFAULT_BOOKING_ITEM_TYPE_MODES,
  normalizeBookingItemTypeModes,
  type ResolvedBookingItemTypeModes,
} from '@africatourismgate/types/tour-guide';

declare global {
  interface Window {
    /** Playwright E2E only — see tests/e2e/helpers/mock-booking-modes.ts */
    __ATG_E2E_BOOKING_MODES__?: Partial<ResolvedBookingItemTypeModes>;
  }
}

const BookingModesContext = createContext<ResolvedBookingItemTypeModes>(
  DEFAULT_BOOKING_ITEM_TYPE_MODES,
);

export function BookingModesProvider({
  modes,
  children,
}: {
  modes: ResolvedBookingItemTypeModes;
  children: ReactNode;
}) {
  const [resolved, setResolved] = useState(modes);

  useEffect(() => {
    const override = window.__ATG_E2E_BOOKING_MODES__;
    setResolved(override ? normalizeBookingItemTypeModes(override) : modes);
  }, [modes]);

  return (
    <BookingModesContext.Provider value={resolved}>{children}</BookingModesContext.Provider>
  );
}

export function useBookingItemTypeModes(): ResolvedBookingItemTypeModes {
  return useContext(BookingModesContext);
}

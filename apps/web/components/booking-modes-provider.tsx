'use client';

import { createContext, useContext, type ReactNode } from 'react';
import {
  DEFAULT_BOOKING_ITEM_TYPE_MODES,
  type ResolvedBookingItemTypeModes,
} from '@africatourismgate/types/tour-guide';

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
  return (
    <BookingModesContext.Provider value={modes}>{children}</BookingModesContext.Provider>
  );
}

export function useBookingItemTypeModes(): ResolvedBookingItemTypeModes {
  return useContext(BookingModesContext);
}

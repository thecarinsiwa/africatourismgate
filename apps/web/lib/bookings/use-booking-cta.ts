'use client';

import { useMemo } from 'react';
import type { ReservationDraft } from '../reservations/flow';
import { getBookingCtaLabel } from './booking-mode';
import { useBookingItemTypeModes } from '../../components/booking-modes-provider';
import { useTranslations } from '../i18n/locale-provider';

export function useBookingCtaLabel(kind: ReservationDraft['kind']): string {
  const modes = useBookingItemTypeModes();
  const t = useTranslations();
  return useMemo(
    () =>
      getBookingCtaLabel(
        kind,
        { bookNow: t.hotels.bookNow, requestBooking: t.checkout.requestBooking },
        modes,
      ),
    [kind, modes, t.checkout.requestBooking, t.hotels.bookNow],
  );
}

'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import type { ReservationDraft } from '../reservations/flow';
import { getBookingCtaLabel } from './booking-mode';
import { useBookingItemTypeModes } from '../../components/booking-modes-provider';
import { useTranslations as useLegacyTranslations } from '../i18n/locale-provider';

export function useBookingCtaLabel(kind: ReservationDraft['kind']): string {
  const modes = useBookingItemTypeModes();
  const tHotels = useTranslations('hotels');
  const legacy = useLegacyTranslations();
  const bookNow = tHotels('bookNow');
  const requestBooking = legacy.checkout.requestBooking;
  return useMemo(
    () => getBookingCtaLabel(kind, { bookNow, requestBooking }, modes),
    [kind, modes, bookNow, requestBooking],
  );
}

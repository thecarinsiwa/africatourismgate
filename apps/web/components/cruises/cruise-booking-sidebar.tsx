'use client';

import { formatDisplayDate } from '../../lib/hotels/dates';
import { formatCruisePrice } from '../../lib/cruises/listings';
import { resolveCabinDeck } from '../../lib/cruises/cabins';
import { formatCruisePortLabel } from '../../lib/cruises/ports';
import type { CruiseCabinOffer, CruiseSailingDetail } from '../../lib/cruises/types';
import { useBookingCtaLabel } from '../../lib/bookings/use-booking-cta';
import { useTranslations } from '../../lib/i18n/locale-provider';
import type { Translations } from '../../lib/i18n/translations';
import { useState } from 'react';
import {
  BookingSidebarBody,
  BookingSidebarCta,
  BookingSidebarDateCard,
  BookingSidebarDesktop,
  BookingSidebarField,
  BookingSidebarHint,
  BookingSidebarMobileBar,
  BookingSidebarMobileDrawer,
  BookingSidebarPriceBlock,
  BookingSidebarSummary,
  BookingSidebarTrustHints,
  bookingSidebarInputClass,
  useBookingDrawerOpenListener,
  useBookingSidebarTrustHints,
} from '../shared/booking-sidebar-shell';

type CruiseBookingSidebarProps = {
  detail: CruiseSailingDetail;
  selectedCabin: CruiseCabinOffer | null;
  guests: number;
  onGuestsChange: (value: number) => void;
  onReserve: () => void;
  t: Translations['cruises'];
  locale?: string;
};

function CruiseBookingContent({
  detail,
  selectedCabin,
  guests,
  onGuestsChange,
  onReserve,
  t,
  locale,
}: CruiseBookingSidebarProps) {
  const trustHints = useBookingSidebarTrustHints();
  const ctaLabel = useBookingCtaLabel('cabin');
  const canReserve =
    selectedCabin != null &&
    selectedCabin.availableCount > 0 &&
    selectedCabin.maxGuests >= guests;

  const guestsLabel =
    guests === 1 ? `1 ${t.guestSingular}` : t.guestPlural.replace('{n}', String(guests));

  const nightsLabel =
    detail.durationNights === 1
      ? `1 ${t.nightSingular}`
      : `${detail.durationNights} ${t.nightPlural}`;

  return (
    <BookingSidebarBody title={t.reserveSection}>
      <BookingSidebarDateCard
        label={t.departure}
        value={formatDisplayDate(detail.departureDate, locale)}
        detail={`${t.arrival}: ${formatDisplayDate(detail.returnDate, locale)} · ${nightsLabel}`}
      />

      <BookingSidebarField label={t.guests}>
        <input
          type="number"
          min={1}
          max={20}
          value={guests}
          onChange={(event) =>
            onGuestsChange(Math.max(1, Number.parseInt(event.target.value, 10) || 1))
          }
          className={bookingSidebarInputClass}
        />
      </BookingSidebarField>

      {!selectedCabin && (
        <BookingSidebarHint tone="warning">{t.selectCabinHint}</BookingSidebarHint>
      )}

      {selectedCabin && selectedCabin.availableCount <= 0 && (
        <BookingSidebarHint tone="error">{t.unavailable}</BookingSidebarHint>
      )}

      {selectedCabin && selectedCabin.maxGuests < guests && (
        <BookingSidebarHint tone="error">{t.insufficientCabins}</BookingSidebarHint>
      )}

      <BookingSidebarSummary>
        {formatCruisePortLabel(detail.sailFromPortCode, detail.sailFromPortName)} →{' '}
        {formatCruisePortLabel(detail.sailToPortCode, detail.sailToPortName)} · {guestsLabel}
      </BookingSidebarSummary>

      {selectedCabin ? (
        <BookingSidebarPriceBlock
          sublabel={selectedCabin.categoryName}
          label={t.totalCruise}
          amount={formatCruisePrice(selectedCabin.priceCents, detail.currency)}
          detail={`${t.deckLabel}: ${t.deck[resolveCabinDeck(selectedCabin.categoryName)]}`}
        />
      ) : null}

      {!selectedCabin && detail.minPriceCents > 0 && (
        <BookingSidebarHint>
          {t.fromPrice} {formatCruisePrice(detail.minPriceCents, detail.currency)} {t.perGuest}
        </BookingSidebarHint>
      )}

      <BookingSidebarCta label={ctaLabel} disabled={!canReserve} onClick={onReserve} />
      <BookingSidebarTrustHints items={trustHints} />
    </BookingSidebarBody>
  );
}

export function CruiseBookingSidebar(props: CruiseBookingSidebarProps) {
  return (
    <BookingSidebarDesktop>
      <CruiseBookingContent {...props} />
    </BookingSidebarDesktop>
  );
}

export function CruiseBookingMobileBar(props: CruiseBookingSidebarProps) {
  const { bookingSidebar } = useTranslations();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { detail, selectedCabin, guests, onReserve, t } = props;
  const ctaLabel = useBookingCtaLabel('cabin');
  const canReserve =
    selectedCabin != null &&
    selectedCabin.availableCount > 0 &&
    selectedCabin.maxGuests >= guests;

  useBookingDrawerOpenListener(() => setDrawerOpen(true));

  return (
    <>
      <BookingSidebarMobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={t.reserveSection}
      >
        <CruiseBookingContent {...props} />
      </BookingSidebarMobileDrawer>
      <BookingSidebarMobileBar
        priceLabel={selectedCabin ? t.totalCruise : undefined}
        priceAmount={
          selectedCabin
            ? formatCruisePrice(selectedCabin.priceCents, detail.currency)
            : undefined
        }
        hint={selectedCabin ? undefined : t.selectCabinHint}
        ctaLabel={ctaLabel}
        ctaDisabled={!canReserve}
        onCtaClick={onReserve}
        configureLabel={bookingSidebar.mobileConfigure}
        onConfigureClick={() => setDrawerOpen(true)}
      />
    </>
  );
}

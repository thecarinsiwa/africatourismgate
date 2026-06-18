'use client';

import type { PropertyDetail, PropertyType } from '@africatourismgate/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getAccommodationDetail } from '../../lib/api/public';
import { currentYearMonth } from '../../lib/hotels/dates';
import {
  buildHotelDetailHref,
  parseGuestsParam,
  type HotelDetailSearchParams,
} from '../../lib/hotels/listings';
import { buildReservationQuery } from '../../lib/reservations/flow';
import { localeToBcp47 } from '../../lib/i18n/locale-tag';
import { useLocale, useTranslations } from '../../lib/i18n/locale-provider';
import { HomeFooter } from '../home/home-footer';
import { HomeHeader } from '../home/home-header';
import { HotelAmenitiesSection } from './hotel-amenities-section';
import { HotelBookingMobileBar, HotelBookingSidebar } from './hotel-booking-sidebar';
import { HotelGallery } from './hotel-gallery';
import { HotelReviewsSection } from './hotel-reviews-section';
import { HotelRoomsSection } from './hotel-rooms-section';
import { HotelStayCalendar } from './hotel-stay-calendar';
import { StarRating } from './star-rating';

export type HotelDetailPageSearch = HotelDetailSearchParams;

type HotelDetailPageContentProps = {
  propertyId: string;
  initialSearch: HotelDetailPageSearch;
};

export function HotelDetailPageContent({
  propertyId,
  initialSearch,
}: HotelDetailPageContentProps) {
  const t = useTranslations();
  const h = t.hotels;
  const { locale } = useLocale();
  const localeTag = localeToBcp47(locale);
  const router = useRouter();

  const [detail, setDetail] = useState<PropertyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(false);
  const [fetchId, setFetchId] = useState(0);

  const [checkIn, setCheckIn] = useState(initialSearch.checkIn ?? '');
  const [checkOut, setCheckOut] = useState(initialSearch.checkOut ?? '');
  const [guests, setGuests] = useState(parseGuestsParam(initialSearch.guests));
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(
    initialSearch.roomId ?? null,
  );
  const [calendarMonth, setCalendarMonth] = useState(
    initialSearch.checkIn?.slice(0, 7) ?? currentYearMonth(),
  );

  const syncUrl = useCallback(
    (overrides: Partial<HotelDetailPageSearch> = {}) => {
      const href = buildHotelDetailHref(propertyId, {
        checkIn: (overrides.checkIn ?? checkIn) || undefined,
        checkOut: (overrides.checkOut ?? checkOut) || undefined,
        guests: String(overrides.guests !== undefined ? overrides.guests : guests),
        roomId: overrides.roomId ?? selectedRoomId ?? undefined,
      });
      router.replace(href, { scroll: false });
    },
    [propertyId, checkIn, checkOut, guests, selectedRoomId, router],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    setNotFound(false);

    void getAccommodationDetail(propertyId, {
      checkIn: checkIn || undefined,
      checkOut: checkOut || undefined,
      guests,
      month: calendarMonth,
    })
      .then((data) => {
        if (!cancelled) setDetail(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setDetail(null);
          const msg = err instanceof Error ? err.message : String(err);
          if (msg.includes('404')) setNotFound(true);
          else setError(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [propertyId, checkIn, checkOut, guests, calendarMonth, fetchId]);

  const selectedRoom = useMemo(
    () => detail?.rooms.find((r) => r.id === selectedRoomId) ?? null,
    [detail, selectedRoomId],
  );

  function applyDates(nextCheckIn: string, nextCheckOut: string | null) {
    setCheckIn(nextCheckIn);
    setCheckOut(nextCheckOut ?? '');
    if (nextCheckIn) setCalendarMonth(nextCheckIn.slice(0, 7));
    syncUrl({
      checkIn: nextCheckIn || undefined,
      checkOut: nextCheckOut || undefined,
    });
  }

  function handleCheckInChange(value: string) {
    setCheckIn(value);
    if (value) setCalendarMonth(value.slice(0, 7));
    syncUrl({ checkIn: value || undefined, checkOut: checkOut || undefined });
  }

  function handleCheckOutChange(value: string) {
    setCheckOut(value);
    syncUrl({ checkIn: checkIn || undefined, checkOut: value || undefined });
  }

  function handleGuestsChange(value: number) {
    setGuests(value);
    syncUrl({ guests: String(value) });
  }

  function handleSelectRoom(roomId: string) {
    setSelectedRoomId(roomId);
    syncUrl({ roomId });
  }

  function handleReserve() {
    if (!selectedRoomId) {
      document.getElementById('rooms')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (!checkIn || !checkOut || checkOut <= checkIn) {
      document.getElementById('reserve')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    const query = buildReservationQuery({
      kind: 'room',
      propertyId,
      roomId: selectedRoomId,
      checkIn,
      checkOut,
      guests,
    });
    router.push(`/booking/cart?${query}`);
  }

  if (loading && !detail) {
    return (
      <div className="flex min-h-screen flex-col bg-atg-surface dark:bg-atg-surface">
        <HomeHeader />
        <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-24 text-center sm:px-6 lg:px-8">
          <p className="text-sm font-medium text-atg-muted">{h.loading}</p>
        </div>
        <HomeFooter />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex min-h-screen flex-col bg-atg-surface dark:bg-atg-surface">
        <HomeHeader />
        <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-24 text-center sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-atg-fg">{h.notFound}</h1>
          <p className="mt-2 text-sm text-atg-muted">{h.notFoundHint}</p>
          <Link
            href="/hotels"
            className="mt-6 inline-flex min-h-[44px] items-center rounded-lg bg-primary px-6 py-2 text-sm font-bold text-white hover:bg-primary-hover"
          >
            {h.backToList}
          </Link>
        </div>
        <HomeFooter />
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="flex min-h-screen flex-col bg-atg-surface dark:bg-atg-surface">
        <HomeHeader />
        <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-24 text-center sm:px-6 lg:px-8">
          <p className="text-sm text-red-700 dark:text-red-300">{h.loadError}</p>
          <button
            type="button"
            onClick={() => setFetchId((k) => k + 1)}
            className="mt-4 min-h-[44px] rounded-lg bg-primary px-6 py-2 text-sm font-bold text-white hover:bg-primary-hover"
          >
            {h.retry}
          </button>
        </div>
        <HomeFooter />
      </div>
    );
  }

  const typeLabel = h.types[detail.propertyType as PropertyType] ?? detail.propertyType;
  const locationLine = detail.addressLine
    ? `${detail.addressLine}, ${detail.destinationName}`
    : detail.destinationName;
  const stars = detail.starRating ?? 0;
  const hasGuestReviews = detail.reviewCount > 0 && detail.averageRating != null;

  const sidebarProps = {
    detail,
    selectedRoom,
    checkIn,
    checkOut,
    guests,
    onCheckInChange: handleCheckInChange,
    onCheckOutChange: handleCheckOutChange,
    onGuestsChange: handleGuestsChange,
    onReserve: handleReserve,
    t: h,
    locale,
  };

  return (
    <div className="flex min-h-screen flex-col bg-atg-surface dark:bg-atg-surface">
      <HomeHeader />

      <div className="border-b border-atg-border bg-atg-elevated dark:border-atg-border dark:bg-atg-elevated">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <nav className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-atg-muted" aria-label="Breadcrumb">
            <Link href="/" className="transition-colors hover:text-primary">
              {h.breadcrumbHome}
            </Link>
            <span className="text-atg-muted/60" aria-hidden>
              ›
            </span>
            <Link href="/hotels" className="transition-colors hover:text-primary">
              {h.breadcrumbHotelsDetail}
            </Link>
            <span className="text-atg-muted/60" aria-hidden>
              ›
            </span>
            <span className="font-medium text-atg-fg">{detail.name}</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 pb-28 sm:px-6 lg:px-8 lg:pb-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          <div className="min-w-0 space-y-8 lg:col-span-2">
            <HotelGallery
              images={detail.images}
              name={detail.name}
              labels={{
                ariaLabel: h.galleryAria,
                openLightbox: h.galleryOpenLightbox,
                close: h.galleryClose,
                previous: h.galleryPrevious,
                next: h.galleryNext,
                counter: h.galleryCounter,
              }}
            />

            <header>
              <p className="text-sm font-medium text-primary">{typeLabel}</p>
              <h1 className="mt-1 text-2xl font-bold text-atg-fg sm:text-3xl">
                {detail.name}
              </h1>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-atg-muted">
                <svg className="h-4 w-4 shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                {locationLine}
              </p>
              {stars > 0 && (
                <div className="mt-3 flex items-center gap-2">
                  <StarRating value={stars} />
                  <span className="text-sm text-atg-muted">
                    {stars} {h.stars}
                  </span>
                </div>
              )}
              {hasGuestReviews && (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <StarRating value={detail.averageRating!} />
                  <span className="text-sm font-semibold text-atg-fg">
                    {detail.averageRating!.toFixed(1)}
                  </span>
                  <span className="text-sm text-atg-muted">
                    · {detail.reviewCount} {h.reviews}
                  </span>
                  <span className="text-xs text-atg-muted/80">
                    ({h.guestRating})
                  </span>
                </div>
              )}
            </header>

            {detail.description && (
              <section>
                <h2 className="mb-3 text-lg font-bold text-atg-fg">
                  {h.descriptionTitle}
                </h2>
                <p className="whitespace-pre-line text-sm leading-relaxed text-atg-muted">
                  {detail.description}
                </p>
              </section>
            )}

            <HotelAmenitiesSection
              amenities={detail.amenities}
              title={h.amenitiesTitle}
              amenityLabels={h.amenities}
            />

            <HotelReviewsSection
              propertyId={propertyId}
              averageRating={detail.averageRating}
              reviewCount={detail.reviewCount}
              localeTag={localeTag}
              labels={{
                reviewsTitle: h.reviewsTitle,
                guestRating: h.guestRating,
                reviews: h.reviews,
                noReviews: h.noReviews,
                reviewsLoading: h.reviewsLoading,
                reviewsLoadError: h.reviewsLoadError,
                loadMoreReviews: h.loadMoreReviews,
                anonymousGuest: h.anonymousGuest,
              }}
            />

            <HotelStayCalendar
              calendarDays={detail.calendarDays}
              month={calendarMonth}
              onMonthChange={setCalendarMonth}
              checkIn={checkIn || null}
              checkOut={checkOut || null}
              onDatesChange={applyDates}
              title={h.calendarTitle}
              prevMonthLabel={h.prevMonth}
              nextMonthLabel={h.nextMonth}
              unavailableLabel={h.unavailable}
              legendLabels={{
                title: h.calendarLegendTitle,
                available: h.calendarLegendAvailable,
                selected: h.calendarLegendSelected,
                unavailable: h.calendarLegendUnavailable,
              }}
              locale={locale}
            />

            <HotelRoomsSection
              rooms={detail.rooms}
              title={h.roomsTitle}
              selectedRoomId={selectedRoomId}
              onSelectRoom={handleSelectRoom}
              selectRoomLabel={h.selectRoom}
              unavailableLabel={h.unavailable}
              perNightLabel={h.perNight}
              maxGuestsLabel={h.maxGuests}
              bedConfigLabel={h.bedConfig}
              nights={detail.stay.nights}
            />
          </div>

          <div className="mt-8 lg:col-span-1 lg:mt-0">
            <HotelBookingSidebar {...sidebarProps} />
          </div>
        </div>
      </div>

      <HotelBookingMobileBar {...sidebarProps} />
      <HomeFooter />
    </div>
  );
}

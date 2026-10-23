'use client';

import {
  formatActivityPrice,
  formatDurationMinutes,
  formatScheduleTime,
} from '../../lib/activities/listings';
import { shouldShowActivityBookingRequestForm } from '../../lib/activities/booking-request';
import type { ActivityDetail, ActivityScheduleOffer } from '../../lib/activities/types';
import { formatDisplayDate } from '../../lib/hotels/dates';
import type { Translations } from '../../lib/i18n/message-types';
import { useState } from 'react';
import { useBookingCtaLabel } from '../../lib/bookings/use-booking-cta';
import { useTranslations } from 'next-intl';
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
import { ActivityBookingRequestForm } from './activity-booking-request-form';

type ActivityBookingSidebarProps = {
  detail: ActivityDetail;
  selectedSchedule: ActivityScheduleOffer | null;
  participants: number;
  onParticipantsChange: (value: number) => void;
  onReserve: () => void;
  preferBookingRequest?: boolean;
  t: Translations['activities'];
  locale?: string;
};

function ActivityBookingContent({
  detail,
  selectedSchedule,
  participants,
  onParticipantsChange,
  onReserve,
  preferBookingRequest = false,
  t,
  locale,
}: ActivityBookingSidebarProps) {
  const trustHints = useBookingSidebarTrustHints();
  const ctaLabel = useBookingCtaLabel('activity_schedule');
  const showRequestForm = shouldShowActivityBookingRequestForm(
    detail,
    participants,
    preferBookingRequest,
  );
  const canReserve =
    selectedSchedule != null && selectedSchedule.remainingPlaces >= participants;

  const participantsLabel =
    participants === 1
      ? `1 ${t.participantSingular}`
      : t.participantPlural.replace('{n}', String(participants));

  const durationLabel = formatDurationMinutes(detail.durationMinutes, {
    hourSingular: t.hourSingular,
    hourPlural: t.hourPlural,
    minuteSingular: t.minuteSingular,
    minutePlural: t.minutePlural,
  });

  const hasDate = Boolean(detail.date);

  if (showRequestForm) {
    return (
      <BookingSidebarBody title={t.bookingRequestSection}>
        <BookingSidebarSummary>
          {detail.destination}
          {durationLabel ? ` · ${durationLabel}` : ''}
        </BookingSidebarSummary>
        <ActivityBookingRequestForm
          activityId={detail.id}
          initialParticipants={participants}
          initialPreferredDate={detail.date || undefined}
          t={t}
        />
        <BookingSidebarTrustHints items={trustHints} />
      </BookingSidebarBody>
    );
  }

  return (
    <BookingSidebarBody title={t.reserveSection}>
      {hasDate ? (
        <BookingSidebarDateCard
          label={t.date}
          value={formatDisplayDate(detail.date, locale)}
          detail={
            selectedSchedule
              ? formatScheduleTime(selectedSchedule.startDatetime, locale)
              : undefined
          }
        />
      ) : (
        <BookingSidebarHint tone="warning">{t.noSchedulesHint}</BookingSidebarHint>
      )}

      <BookingSidebarField label={t.participants}>
        <input
          type="number"
          min={1}
          max={50}
          value={participants}
          onChange={(event) =>
            onParticipantsChange(Math.max(1, Number.parseInt(event.target.value, 10) || 1))
          }
          className={bookingSidebarInputClass}
        />
      </BookingSidebarField>

      {hasDate && !selectedSchedule && (
        <BookingSidebarHint tone="warning">{t.selectScheduleHint}</BookingSidebarHint>
      )}

      {selectedSchedule && selectedSchedule.remainingPlaces <= 0 && (
        <BookingSidebarHint tone="error">{t.unavailable}</BookingSidebarHint>
      )}

      {selectedSchedule && selectedSchedule.remainingPlaces < participants && (
        <BookingSidebarHint tone="error">{t.insufficientPlaces}</BookingSidebarHint>
      )}

      {!canReserve && hasDate && detail.allowBookingRequestsWhenUnavailable === false ? (
        <BookingSidebarHint tone="error">{t.bookingRequestUnavailable}</BookingSidebarHint>
      ) : null}

      <BookingSidebarSummary>
        {detail.destination} · {participantsLabel}
        {durationLabel ? ` · ${durationLabel}` : ''}
      </BookingSidebarSummary>

      {selectedSchedule ? (
        <BookingSidebarPriceBlock
          label={t.totalActivity}
          amount={formatActivityPrice(selectedSchedule.priceCents * participants, detail.currency)}
        />
      ) : null}

      {!selectedSchedule && detail.priceCents > 0 && (
        <BookingSidebarHint>
          {t.fromPrice} {formatActivityPrice(detail.priceCents, detail.currency)} {t.perParticipant}
        </BookingSidebarHint>
      )}

      <BookingSidebarCta label={ctaLabel} disabled={!canReserve} onClick={onReserve} />
      <BookingSidebarTrustHints items={trustHints} />
    </BookingSidebarBody>
  );
}

export function ActivityBookingSidebar(props: ActivityBookingSidebarProps) {
  return (
    <BookingSidebarDesktop>
      <ActivityBookingContent {...props} />
    </BookingSidebarDesktop>
  );
}

export function ActivityBookingMobileBar(props: ActivityBookingSidebarProps) {
  const tBooking = useTranslations('bookingSidebar');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { detail, selectedSchedule, participants, onReserve, preferBookingRequest, t } = props;
  const ctaLabel = useBookingCtaLabel('activity_schedule');
  const showRequestForm = shouldShowActivityBookingRequestForm(
    detail,
    participants,
    preferBookingRequest ?? false,
  );
  const canReserve =
    selectedSchedule != null && selectedSchedule.remainingPlaces >= participants;

  useBookingDrawerOpenListener(() => setDrawerOpen(true));

  return (
    <>
      <BookingSidebarMobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={showRequestForm ? t.bookingRequestSection : t.reserveSection}
      >
        <ActivityBookingContent {...props} />
      </BookingSidebarMobileDrawer>
      <BookingSidebarMobileBar
        priceLabel={!showRequestForm && selectedSchedule ? t.totalActivity : undefined}
        priceAmount={
          !showRequestForm && selectedSchedule
            ? formatActivityPrice(selectedSchedule.priceCents * participants, detail.currency)
            : undefined
        }
        hint={
          showRequestForm
            ? t.bookingRequestSubtitle
            : selectedSchedule
              ? undefined
              : t.selectScheduleHint
        }
        ctaLabel={showRequestForm ? t.bookingRequestSubmit : ctaLabel}
        ctaDisabled={showRequestForm ? false : !canReserve}
        onCtaClick={showRequestForm ? () => setDrawerOpen(true) : onReserve}
        configureLabel={tBooking('mobileConfigure')}
        onConfigureClick={() => setDrawerOpen(true)}
      />
    </>
  );
}

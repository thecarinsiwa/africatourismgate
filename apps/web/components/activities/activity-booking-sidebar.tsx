'use client';

import {
  formatActivityPrice,
  formatDurationMinutes,
  formatScheduleTime,
} from '../../lib/activities/listings';
import type { ActivityDetail, ActivityScheduleOffer } from '../../lib/activities/types';
import { formatDisplayDate } from '../../lib/hotels/dates';
import type { Translations } from '../../lib/i18n/translations';
import {
  BookingSidebarBody,
  BookingSidebarCta,
  BookingSidebarDateCard,
  BookingSidebarDesktop,
  BookingSidebarField,
  BookingSidebarHint,
  BookingSidebarMobileBar,
  BookingSidebarPriceBlock,
  BookingSidebarSummary,
  BookingSidebarTrustHints,
  bookingSidebarInputClass,
  useBookingSidebarTrustHints,
} from '../shared/booking-sidebar-shell';

type ActivityBookingSidebarProps = {
  detail: ActivityDetail;
  selectedSchedule: ActivityScheduleOffer | null;
  participants: number;
  onParticipantsChange: (value: number) => void;
  onReserve: () => void;
  t: Translations['activities'];
  locale?: string;
};

function ActivityBookingContent({
  detail,
  selectedSchedule,
  participants,
  onParticipantsChange,
  onReserve,
  t,
  locale,
}: ActivityBookingSidebarProps) {
  const trustHints = useBookingSidebarTrustHints();
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

  return (
    <BookingSidebarBody title={t.reserveSection}>
      <BookingSidebarDateCard
        label={t.date}
        value={formatDisplayDate(detail.date, locale)}
        detail={
          selectedSchedule
            ? formatScheduleTime(selectedSchedule.startDatetime, locale)
            : undefined
        }
      />

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

      {!selectedSchedule && (
        <BookingSidebarHint tone="warning">{t.selectScheduleHint}</BookingSidebarHint>
      )}

      {selectedSchedule && selectedSchedule.remainingPlaces <= 0 && (
        <BookingSidebarHint tone="error">{t.unavailable}</BookingSidebarHint>
      )}

      {selectedSchedule && selectedSchedule.remainingPlaces < participants && (
        <BookingSidebarHint tone="error">{t.insufficientPlaces}</BookingSidebarHint>
      )}

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

      <BookingSidebarCta label={t.bookNow} disabled={!canReserve} onClick={onReserve} />
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
  const { detail, selectedSchedule, participants, onReserve, t } = props;
  const canReserve =
    selectedSchedule != null && selectedSchedule.remainingPlaces >= participants;

  return (
    <BookingSidebarMobileBar
      priceLabel={selectedSchedule ? t.totalActivity : undefined}
      priceAmount={
        selectedSchedule
          ? formatActivityPrice(selectedSchedule.priceCents * participants, detail.currency)
          : undefined
      }
      hint={selectedSchedule ? undefined : t.selectScheduleHint}
      ctaLabel={t.bookNow}
      ctaDisabled={!canReserve}
      onCtaClick={onReserve}
    />
  );
}

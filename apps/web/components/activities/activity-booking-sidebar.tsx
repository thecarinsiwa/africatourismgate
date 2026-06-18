'use client';

import {
  formatActivityPrice,
  formatDurationMinutes,
  formatScheduleTime,
} from '../../lib/activities/listings';
import type { ActivityDetail, ActivityScheduleOffer } from '../../lib/activities/types';
import { formatDisplayDate } from '../../lib/hotels/dates';
import type { Translations } from '../../lib/i18n/translations';

type ActivityBookingSidebarProps = {
  detail: ActivityDetail;
  selectedSchedule: ActivityScheduleOffer | null;
  participants: number;
  onParticipantsChange: (value: number) => void;
  onReserve: () => void;
  t: Translations['activities'];
  locale?: string;
};

function SidebarContent({
  detail,
  selectedSchedule,
  participants,
  onParticipantsChange,
  onReserve,
  t,
  locale,
}: ActivityBookingSidebarProps) {
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
    <div className="space-y-4" id="reserve">
      <h2 className="text-lg font-bold text-atg-fg">{t.reserveSection}</h2>

      <div className="rounded-lg bg-atg-surface px-4 py-3 text-sm dark:bg-white/5">
        <p className="text-xs uppercase tracking-wide text-atg-muted">
          {t.date}
        </p>
        <p className="mt-1 font-medium text-atg-fg">
          {formatDisplayDate(detail.date, locale)}
        </p>
        {selectedSchedule && (
          <p className="mt-2 text-xs text-atg-muted">
            {formatScheduleTime(selectedSchedule.startDatetime, locale)}
          </p>
        )}
      </div>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-atg-muted">
          {t.participants}
        </span>
        <input
          type="number"
          min={1}
          max={50}
          value={participants}
          onChange={(event) =>
            onParticipantsChange(Math.max(1, Number.parseInt(event.target.value, 10) || 1))
          }
          className="min-h-[44px] w-full rounded-lg border border-atg-border px-3 py-2 text-sm dark:border-atg-border dark:bg-atg-surface dark:text-white"
        />
      </label>

      {!selectedSchedule && (
        <p className="text-sm text-amber-700 dark:text-amber-300">{t.selectScheduleHint}</p>
      )}

      {selectedSchedule && selectedSchedule.remainingPlaces <= 0 && (
        <p className="text-sm text-red-600 dark:text-red-400">{t.unavailable}</p>
      )}

      {selectedSchedule && selectedSchedule.remainingPlaces < participants && (
        <p className="text-sm text-red-600 dark:text-red-400">{t.insufficientPlaces}</p>
      )}

      <p className="text-sm text-atg-muted">
        {detail.destination} · {participantsLabel}
        {durationLabel ? ` · ${durationLabel}` : ''}
      </p>

      {selectedSchedule && (
        <div className="rounded-lg bg-atg-surface px-4 py-3 dark:bg-white/5">
          <p className="text-xs uppercase tracking-wide text-atg-muted">
            {t.totalActivity}
          </p>
          <p className="text-2xl font-bold text-atg-fg">
            {formatActivityPrice(selectedSchedule.priceCents * participants, detail.currency)}
          </p>
        </div>
      )}

      {!selectedSchedule && detail.priceCents > 0 && (
        <p className="text-sm text-atg-muted">
          {t.fromPrice} {formatActivityPrice(detail.priceCents, detail.currency)} {t.perParticipant}
        </p>
      )}

      <button
        type="button"
        disabled={!canReserve}
        onClick={onReserve}
        className="w-full min-h-[48px] rounded-lg bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
      >
        {t.bookNow}
      </button>
    </div>
  );
}

export function ActivityBookingSidebar(props: ActivityBookingSidebarProps) {
  return (
    <aside className="hidden rounded-2xl border border-atg-border bg-atg-elevated p-6 shadow-lg dark:border-atg-border dark:bg-atg-elevated lg:block lg:sticky lg:top-24">
      <SidebarContent {...props} />
    </aside>
  );
}

export function ActivityBookingMobileBar(props: ActivityBookingSidebarProps) {
  const { detail, selectedSchedule, participants, onReserve, t } = props;
  const canReserve =
    selectedSchedule != null && selectedSchedule.remainingPlaces >= participants;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-atg-border bg-atg-elevated/95 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-md dark:border-atg-border dark:bg-atg-elevated/95 lg:hidden pb-safe">
      <div className="mx-auto flex max-w-lg items-center gap-4">
        <div className="min-w-0 flex-1">
          {selectedSchedule ? (
            <>
              <p className="text-xs text-atg-muted">{t.totalActivity}</p>
              <p className="text-lg font-bold text-atg-fg">
                {formatActivityPrice(
                  selectedSchedule.priceCents * participants,
                  detail.currency,
                )}
              </p>
            </>
          ) : (
            <p className="text-sm text-atg-muted">{t.selectScheduleHint}</p>
          )}
        </div>
        <button
          type="button"
          disabled={!canReserve}
          onClick={onReserve}
          className="min-h-[48px] shrink-0 rounded-lg bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wide text-white hover:bg-primary-hover disabled:opacity-50"
        >
          {t.bookNow}
        </button>
      </div>
    </div>
  );
}

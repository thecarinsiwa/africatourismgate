'use client';

import { useEffect, useState } from 'react';
import { getActivityDetail } from '../../lib/api/public';
import { toActivityDetailQuery } from '../../lib/activities/listings';
import type { ActivityDetail } from '../../lib/activities/types';
import type { Translations } from '../../lib/i18n/translations';
import { ActivitySchedulesSection } from '../activities/activity-schedules-section';

type PackageActivityConfigItemProps = {
  activityId: string;
  label: string;
  date: string;
  participants: number;
  selectedScheduleId: string | null;
  onSelectSchedule: (scheduleId: string) => void;
  t: Translations['packages'];
  a: Translations['activities'];
  locale?: string;
};

export function PackageActivityConfigItem({
  activityId,
  label,
  date,
  participants,
  selectedScheduleId,
  onSelectSchedule,
  t,
  a,
  locale,
}: PackageActivityConfigItemProps) {
  const [detail, setDetail] = useState<ActivityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!date) {
      setDetail(null);
      setLoading(false);
      setError(false);
      return;
    }

    setLoading(true);
    setError(false);

    void getActivityDetail(activityId, toActivityDetailQuery({ date, participants: String(participants) }))
      .then((data) => {
        if (!cancelled) setDetail(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setDetail(null);
          const msg = err instanceof Error ? err.message : String(err);
          setError(!msg.includes('404'));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activityId, date, participants]);

  return (
    <article className="rounded-2xl border border-atg-border bg-atg-elevated p-5 dark:border-atg-border dark:bg-atg-elevated">
      <header className="mb-4 border-b border-atg-border pb-4 dark:border-atg-border">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          {t.itemTypes.activity}
        </p>
        <h3 className="mt-1 text-lg font-bold text-atg-fg">{label}</h3>
      </header>

      {!date && (
        <p className="text-sm text-amber-700 dark:text-amber-300">{t.selectDateHint}</p>
      )}

      {date && loading && (
        <p className="text-sm text-atg-muted">{t.loadingActivitySchedules}</p>
      )}

      {date && error && (
        <p className="text-sm text-red-700 dark:text-red-300">{t.activitySchedulesError}</p>
      )}

      {date && !loading && !error && detail && detail.schedules.length > 0 && (
        <ActivitySchedulesSection
          schedules={detail.schedules}
          currency={detail.currency}
          selectedScheduleId={selectedScheduleId}
          participants={participants}
          onSelectSchedule={onSelectSchedule}
          t={a}
          locale={locale}
          hideTitle
        />
      )}

      {date && !loading && !error && detail && detail.schedules.length === 0 && (
        <p className="text-sm text-amber-700 dark:text-amber-300">{t.noActivitySchedules}</p>
      )}
    </article>
  );
}

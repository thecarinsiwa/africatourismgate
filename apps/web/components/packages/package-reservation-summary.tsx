'use client';

import { formatScheduleTime } from '../../lib/activities/listings';
import type { ActivityDetail } from '../../lib/activities/types';
import { formatDisplayDate } from '../../lib/hotels/dates';
import type { PackageDetail } from '../../lib/packages/types';
import type { PackageReservationDraft } from '../../lib/reservations/flow';
import type { Translations } from '../../lib/i18n/translations';

type PackageReservationSummaryProps = {
  draft: PackageReservationDraft;
  packageDetail: PackageDetail;
  packageActivities: ActivityDetail[];
  t: Translations['packages'];
  participantSingular: string;
  participantPlural: string;
  locale?: string;
  showPricing?: boolean;
};

export function PackageReservationSummary({
  draft,
  packageDetail,
  packageActivities,
  t,
  participantSingular,
  participantPlural,
  locale,
  showPricing = false,
}: PackageReservationSummaryProps) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-primary">{t.cardBadge}</p>
        <h2 className="text-xl font-bold text-[#0f1a16] dark:text-white">
          {packageDetail.package.name}
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-atg-muted">
          {formatDisplayDate(draft.date, locale)} ·{' '}
          {t.schedulesProgress
            .replace('{selected}', String(draft.lines.length))
            .replace('{total}', String(draft.lines.length))}
          {' · '}
          {draft.participants === 1
            ? `1 ${participantSingular}`
            : participantPlural.replace('{n}', String(draft.participants))}
        </p>
      </div>

      <ul className="space-y-3 border-t border-gray-100 pt-4 dark:border-atg-border">
        {draft.lines.map((line, index) => {
          const activity = packageActivities.find((item) => item.id === line.activityId);
          const schedule = activity?.schedules.find((item) => item.scheduleId === line.scheduleId);
          if (!activity) return null;

          return (
            <li
              key={line.activityId}
              className="rounded-xl border border-gray-100 px-4 py-3 dark:border-atg-border"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                {t.itemTypes.activity} {index + 1}
              </p>
              <p className="font-medium text-[#0f1a16] dark:text-white">{activity.title}</p>
              <p className="mt-1 text-sm text-gray-600 dark:text-atg-muted">
                {activity.providerName}
                {schedule ? (
                  <>
                    {' · '}
                    {formatScheduleTime(schedule.startDatetime, locale)}
                  </>
                ) : null}
              </p>
            </li>
          );
        })}
      </ul>

      {showPricing && packageDetail.pricing.discountAmountCents > 0 ? (
        <p className="text-sm text-emerald-700 dark:text-emerald-300">
          {t.youSave.replace(
            '{amount}',
            `${(packageDetail.pricing.discountAmountCents / 100).toFixed(0)} ${packageDetail.pricing.currency}`,
          )}
        </p>
      ) : null}
    </div>
  );
}

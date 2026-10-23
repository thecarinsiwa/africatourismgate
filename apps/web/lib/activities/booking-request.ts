import type { ActivityDetail, ActivitySearchResult } from './types';

export const ACTIVITY_BOOKING_REQUEST_HASH = '#booking-request';

export type ActivityListingCtaMode = 'book' | 'request' | 'unavailable';

/** Listing card/table CTA when slots are zero vs bookable. */
export function getActivityListingCtaMode(
  activity: Pick<
    ActivitySearchResult,
    'availableSchedulesCount' | 'allowBookingRequestsWhenUnavailable' | 'nextStartDatetime'
  >,
  searchDate?: string,
): ActivityListingCtaMode {
  const effectiveDate =
    searchDate ??
    (activity.nextStartDatetime ? activity.nextStartDatetime.slice(0, 10) : undefined);

  if (effectiveDate && activity.availableSchedulesCount > 0) {
    return 'book';
  }

  if (
    activity.availableSchedulesCount === 0 &&
    activity.allowBookingRequestsWhenUnavailable
  ) {
    return 'request';
  }

  return 'unavailable';
}

/** Detail sidebar: show inquiry form instead of checkout CTA. */
export function shouldShowActivityBookingRequestForm(
  detail: Pick<ActivityDetail, 'date' | 'schedules' | 'allowBookingRequestsWhenUnavailable'>,
  participants: number,
  preferRequest: boolean,
): boolean {
  if (!detail.allowBookingRequestsWhenUnavailable) {
    return false;
  }

  const hasBookable = detail.schedules.some(
    (schedule) => schedule.remainingPlaces >= participants,
  );
  if (hasBookable) {
    return false;
  }

  if (preferRequest) {
    return true;
  }

  // Date selected (or schedules returned) but nothing left to book.
  if (detail.date) {
    return true;
  }

  return false;
}

export function todayDateInputValue(now = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

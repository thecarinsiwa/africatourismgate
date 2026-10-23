import type { ActivityBookingRequestStatus } from '@africatourismgate/types';

export type ActivityBookingRequestsListFilter = {
  status?: ActivityBookingRequestStatus;
};

export const activityBookingRequestsKpis = [
  {
    key: 'total',
    labelKey: 'bookingRequests.stats.total.label',
    subtitleKey: 'bookingRequests.stats.total.subtitle',
    iconClass: 'bg-atg-info-light text-atg-info',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
        />
      </svg>
    ),
  },
  {
    key: 'pending',
    labelKey: 'bookingRequests.stats.pending.label',
    subtitleKey: 'bookingRequests.stats.pending.subtitle',
    iconClass: 'bg-atg-warning-light text-atg-warning',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    key: 'contacted',
    labelKey: 'bookingRequests.stats.contacted.label',
    subtitleKey: 'bookingRequests.stats.contacted.subtitle',
    iconClass: 'bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    key: 'confirmed',
    labelKey: 'bookingRequests.stats.confirmed.label',
    subtitleKey: 'bookingRequests.stats.confirmed.subtitle',
    iconClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    key: 'cancelled',
    labelKey: 'bookingRequests.stats.cancelled.label',
    subtitleKey: 'bookingRequests.stats.cancelled.subtitle',
    iconClass: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
        />
      </svg>
    ),
  },
] as const;

export type ActivityBookingRequestsKpiKey =
  (typeof activityBookingRequestsKpis)[number]['key'];

export const activityBookingRequestsKpiListFilter: Record<
  ActivityBookingRequestsKpiKey,
  ActivityBookingRequestsListFilter
> = {
  total: {},
  pending: { status: 'pending' },
  contacted: { status: 'contacted' },
  confirmed: { status: 'confirmed' },
  cancelled: { status: 'cancelled' },
};

export function activityBookingRequestsFiltersMatch(
  a: ActivityBookingRequestsListFilter,
  b: ActivityBookingRequestsListFilter,
): boolean {
  return (a.status ?? '') === (b.status ?? '');
}

import type { LegalPagesListQuery } from '@africatourismgate/types';

/** Days used by “Recently updated” / “Outdated” KPIs and list filters. */
export const LEGAL_RECENTLY_UPDATED_DAYS = 30;
export const LEGAL_OUTDATED_DAYS = 365;

export type LegalListFilter = Pick<
  LegalPagesListQuery,
  'status' | 'updatedWithinDays' | 'updatedOlderThanDays'
>;

export const legalKpis = [
  {
    key: 'total',
    labelKey: 'stats.total.label',
    subtitleKey: 'stats.total.subtitle',
    iconClass: 'bg-atg-info-light text-atg-info',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
  },
  {
    key: 'published',
    labelKey: 'stats.published.label',
    subtitleKey: 'stats.published.subtitle',
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
    key: 'draft',
    labelKey: 'stats.draft.label',
    subtitleKey: 'stats.draft.subtitle',
    iconClass: 'bg-atg-muted/20 text-atg-muted',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
      </svg>
    ),
  },
  {
    key: 'recentlyUpdated',
    labelKey: 'stats.recentlyUpdated.label',
    subtitleKey: 'stats.recentlyUpdated.subtitle',
    iconClass: 'bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300',
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
    key: 'outdated',
    labelKey: 'stats.outdated.label',
    subtitleKey: 'stats.outdated.subtitle',
    iconClass: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
        />
      </svg>
    ),
  },
] as const;

export type LegalKpiKey = (typeof legalKpis)[number]['key'];

export const legalKpiListFilter: Record<LegalKpiKey, LegalListFilter> = {
  total: {},
  published: { status: 'published' },
  draft: { status: 'draft' },
  recentlyUpdated: { updatedWithinDays: LEGAL_RECENTLY_UPDATED_DAYS },
  outdated: { updatedOlderThanDays: LEGAL_OUTDATED_DAYS },
};

export function legalFiltersMatch(a: LegalListFilter, b: LegalListFilter): boolean {
  return (
    a.status === b.status &&
    a.updatedWithinDays === b.updatedWithinDays &&
    a.updatedOlderThanDays === b.updatedOlderThanDays
  );
}

export const treasuryKpis = [
  {
    key: 'entries',
    labelKey: 'stats.entries.label',
    subtitleKey: 'stats.entries.subtitle',
    href: '/tresorerie/entrees',
    iconClass: 'bg-atg-success-light text-atg-success',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M12 4v16m8-8H4"
        />
      </svg>
    ),
  },
  {
    key: 'exits',
    labelKey: 'stats.exits.label',
    subtitleKey: 'stats.exits.subtitle',
    href: '/tresorerie/sorties',
    iconClass: 'bg-atg-warning-light text-atg-warning',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M20 12H4"
        />
      </svg>
    ),
  },
  {
    key: 'pendingRequests',
    labelKey: 'stats.pendingRequests.label',
    subtitleKey: 'stats.pendingRequests.subtitle',
    href: '/tresorerie/besoins',
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
    key: 'net',
    labelKey: 'stats.net.label',
    subtitleKey: 'stats.net.subtitle',
    href: '/tresorerie/rapports',
    iconClass: 'bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
  },
] as const;

export type TreasuryKpiKey = (typeof treasuryKpis)[number]['key'];

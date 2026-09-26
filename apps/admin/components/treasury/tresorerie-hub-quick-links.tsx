'use client';

import { Card, cn } from '@africatourismgate/ui';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useMemo, type ReactNode } from 'react';
import { usePermissions } from '../../lib/auth/use-permissions';

type HubLinkKey =
  | 'entries'
  | 'exits'
  | 'expenseRequests'
  | 'budgets'
  | 'reports'
  | 'externals'
  | 'audit'
  | 'accounting';

type HubLinkDef = {
  key: HubLinkKey;
  href: string;
  permission?: string;
  anyOf?: string[];
  iconClass: string;
  icon: ReactNode;
};

const linkDefs: HubLinkDef[] = [
  {
    key: 'entries',
    href: '/tresorerie/entrees',
    permission: 'treasury.read',
    iconClass: 'bg-atg-success-light text-atg-success',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
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
    href: '/tresorerie/sorties',
    permission: 'treasury.read',
    iconClass: 'bg-atg-warning-light text-atg-warning',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
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
    key: 'expenseRequests',
    href: '/tresorerie/besoins',
    permission: 'treasury.read',
    iconClass: 'bg-atg-info-light text-atg-info',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
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
    key: 'budgets',
    href: '/tresorerie/budgets',
    permission: 'treasury.read',
    iconClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
        />
      </svg>
    ),
  },
  {
    key: 'reports',
    href: '/tresorerie/rapports',
    permission: 'treasury.reports.read',
    iconClass: 'bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
  },
  {
    key: 'externals',
    href: '/tresorerie/externes',
    anyOf: ['treasury.externals.manage', 'treasury.read'],
    iconClass: 'bg-primary/10 text-primary',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
  {
    key: 'audit',
    href: '/tresorerie/audit',
    permission: 'treasury.audit.read',
    iconClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    ),
  },
  {
    key: 'accounting',
    href: '/tresorerie/comptabilite',
    permission: 'treasury.accounting_link.read',
    iconClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M9 7h6m-6 4h6m-6 4h4m-7 5h10a2 2 0 002-2V6a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
  },
];

export function TresorerieHubQuickLinks({ className }: { className?: string }) {
  const t = useTranslations('modules.treasury.hub.quickLinks');
  const tSubnav = useTranslations('modules.treasury.subnav');
  const { hasPermission, hasAnyPermission, loading: permissionsLoading } =
    usePermissions();

  const links = useMemo(
    () =>
      linkDefs.filter((link) => {
        if (link.anyOf) return hasAnyPermission(link.anyOf);
        if (link.permission) return hasPermission(link.permission);
        return true;
      }),
    [hasAnyPermission, hasPermission],
  );

  if (permissionsLoading || links.length === 0) {
    return null;
  }

  return (
    <Card variant="dashboard" padding="sm" className={className}>
      <h2 className="text-base font-semibold text-atg-fg">{t('title')}</h2>
      <p className="mt-1 text-sm text-atg-muted">{t('subtitle')}</p>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'flex flex-col items-center justify-center rounded-xl border border-atg-border bg-atg-surface/50 p-5',
              'text-center transition-colors hover:border-primary/30 hover:bg-atg-surface',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
            )}
          >
            <span
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-xl',
                link.iconClass,
              )}
              aria-hidden
            >
              {link.icon}
            </span>
            <span className="mt-3 text-sm font-semibold text-atg-fg">
              {tSubnav(link.key)}
            </span>
            <span className="mt-0.5 text-xs text-atg-muted">
              {t(`${link.key}.description`)}
            </span>
          </Link>
        ))}
      </div>
    </Card>
  );
}

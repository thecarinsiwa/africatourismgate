'use client';

import { Card, cn } from '@africatourismgate/ui';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

type QuickActionKey = 'users' | 'organizations' | 'properties' | 'bookings';

type QuickActionDef = {
  key: QuickActionKey;
  href: string;
  iconClass: string;
  icon: React.ReactNode;
};

const actionDefs: QuickActionDef[] = [
  {
    key: 'users',
    href: '/utilisateurs',
    iconClass: 'bg-primary/10 text-primary',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
        />
      </svg>
    ),
  },
  {
    key: 'organizations',
    href: '/organisations',
    iconClass: 'bg-primary/10 text-primary',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    ),
  },
  {
    key: 'properties',
    href: '/hebergements',
    iconClass: 'bg-primary/10 text-primary',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
  {
    key: 'bookings',
    href: '/reservations',
    iconClass: 'bg-primary/10 text-primary',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
  },
];

export function DashboardQuickActions({ className }: { className?: string }) {
  const t = useTranslations('dashboard.quickActions');

  const actions = useMemo(
    () =>
      actionDefs.map((action) => ({
        ...action,
        label: t(`${action.key}.label`),
        description: t(`${action.key}.description`),
      })),
    [t],
  );

  return (
    <Card variant="dashboard" padding="sm" className={className}>
      <h2 className="text-base font-semibold text-atg-fg">{t('title')}</h2>
      <p className="mt-1 text-sm text-atg-muted">{t('subtitle')}</p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className={cn(
              'flex flex-col items-center justify-center rounded-xl border border-atg-border bg-atg-surface/50 p-5',
              'text-center transition-colors hover:border-primary/30 hover:bg-atg-surface',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
            )}
          >
            <span
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-xl',
                action.iconClass,
              )}
              aria-hidden
            >
              {action.icon}
            </span>
            <span className="mt-3 text-sm font-semibold text-atg-fg">{action.label}</span>
            <span className="mt-0.5 text-xs text-atg-muted">{action.description}</span>
          </Link>
        ))}
      </div>
    </Card>
  );
}

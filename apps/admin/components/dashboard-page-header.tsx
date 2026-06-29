'use client';

import { Button, PageHeader } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { AUTH_CHANGED_EVENT, getSession } from '../lib/auth/session';
import {
  DASHBOARD_PERIODS,
  useDashboardPeriod,
  type DashboardPeriod,
} from './dashboard-period-context';

export function DashboardPageHeader() {
  const t = useTranslations('dashboard');
  const { period, setPeriod } = useDashboardPeriod();
  const [firstName, setFirstName] = useState<string | null>(null);

  useEffect(() => {
    function syncSession() {
      const session = getSession();
      const name = session?.user.firstName?.trim();
      setFirstName(name || null);
    }

    syncSession();
    window.addEventListener(AUTH_CHANGED_EVENT, syncSession);
    window.addEventListener('storage', syncSession);
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, syncSession);
      window.removeEventListener('storage', syncSession);
    };
  }, []);

  const title = firstName ? t('greeting', { firstName }) : t('greetingFallback');

  return (
    <PageHeader
      title={title}
      description={t('description')}
      actions={
        <div
          role="tablist"
          aria-label={t('period.label')}
          className="inline-flex rounded-lg border border-atg-border bg-atg-surface/50 p-1"
        >
          {DASHBOARD_PERIODS.map((value) => (
            <Button
              key={value}
              type="button"
              role="tab"
              aria-selected={period === value}
              variant={period === value ? 'primary' : 'ghost'}
              size="sm"
              className="min-w-[4.5rem]"
              onClick={() => setPeriod(value as DashboardPeriod)}
            >
              {t(`period.${value}`)}
            </Button>
          ))}
        </div>
      }
    />
  );
}

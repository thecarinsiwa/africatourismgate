'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export type DashboardPeriod = '7d' | '30d' | '90d';

export const DASHBOARD_PERIODS: DashboardPeriod[] = ['7d', '30d', '90d'];

type DashboardPeriodContextValue = {
  period: DashboardPeriod;
  setPeriod: (period: DashboardPeriod) => void;
};

const DashboardPeriodContext = createContext<DashboardPeriodContextValue | null>(null);

export function DashboardPeriodProvider({ children }: { children: ReactNode }) {
  const [period, setPeriod] = useState<DashboardPeriod>('30d');
  const value = useMemo(() => ({ period, setPeriod }), [period]);

  return (
    <DashboardPeriodContext.Provider value={value}>{children}</DashboardPeriodContext.Provider>
  );
}

export function useDashboardPeriod(): DashboardPeriodContextValue {
  const context = useContext(DashboardPeriodContext);
  if (!context) {
    throw new Error('useDashboardPeriod must be used within DashboardPeriodProvider');
  }
  return context;
}

'use client';

import { Card, Skeleton } from '@africatourismgate/ui';
import type { AnalyticsTopPages } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { formatCount } from '../../lib/format-money';

export function AnalyticsTopPagesTable({
  status,
  topPages,
  errorMessage,
  className,
}: {
  status: 'loading' | 'error' | 'ready';
  topPages: AnalyticsTopPages | null;
  errorMessage?: string;
  className?: string;
}) {
  const t = useTranslations('modules.analytics.topPages');
  const items = topPages?.items ?? [];

  return (
    <Card variant="dashboard" padding="sm" className={className}>
      <h2 className="text-base font-semibold text-atg-fg">{t('title')}</h2>

      <div className="mt-4">
        {status === 'loading' ? (
          <div className="space-y-2" aria-busy="true">
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
            <p className="text-sm text-atg-muted">{t('loading')}</p>
          </div>
        ) : status === 'error' ? (
          <p className="py-10 text-center text-sm text-atg-danger" role="alert">
            {errorMessage ?? t('error')}
          </p>
        ) : items.length === 0 ? (
          <p className="py-10 text-center text-sm text-atg-muted">{t('empty')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-atg-border text-atg-muted">
                  <th scope="col" className="px-2 py-2 font-medium">
                    {t('path')}
                  </th>
                  <th scope="col" className="px-2 py-2 text-right font-medium">
                    {t('pageViews')}
                  </th>
                  <th scope="col" className="px-2 py-2 text-right font-medium">
                    {t('visitors')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.path} className="border-b border-atg-border/60 last:border-0">
                    <td className="max-w-[20rem] truncate px-2 py-2.5 font-mono text-xs text-atg-fg">
                      {item.path}
                    </td>
                    <td className="px-2 py-2.5 text-right tabular-nums text-atg-fg">
                      {formatCount(item.pageViews)}
                    </td>
                    <td className="px-2 py-2.5 text-right tabular-nums text-atg-fg">
                      {formatCount(item.visitors)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Card>
  );
}

'use client';

import { useAdminErrorMessages } from '../lib/i18n/use-admin-error-messages';

import { Card, DataTableBadge, Skeleton } from '@africatourismgate/ui';
import type { SupportTicketStatus } from '@africatourismgate/types';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import {
  fetchDashboardRecentActivity,
  hasDashboardActivityAccess,
  type DashboardActivityItem,
} from '../lib/dashboard-recent-activity-data';
import { getBookingStatusVariant } from '../lib/booking-status';
import { isApiForbidden } from '../lib/auth/is-api-forbidden';
import { usePermissions } from '../lib/auth/use-permissions';
import { formatMoney } from '../lib/format-money';
import {
  useBookingStatusLabels,
  useFormatDateTime,
  useReviewStatusLabels,
  useSupportTicketStatusLabels,
} from '../lib/i18n/use-module-labels';
import { reviewStatusVariants } from '../lib/review-display';
import { supportTicketStatusVariants } from '../lib/support-ticket-display';

function activityIcon(type: DashboardActivityItem['type']): string {
  if (type === 'booking') return '📅';
  if (type === 'review') return '⭐';
  return '🎫';
}

function activityAccentClass(type: DashboardActivityItem['type']): string {
  if (type === 'booking') {
    return 'bg-violet-100 text-violet-700 ring-violet-500/20 dark:bg-violet-950/50 dark:text-violet-300';
  }
  if (type === 'review') {
    return 'bg-atg-warning-light text-atg-warning-fg ring-atg-warning/25';
  }
  return 'bg-atg-info-light text-atg-info-fg ring-atg-info/25';
}

type ActivityTimelineItemProps = {
  item: DashboardActivityItem;
  typeLabel: string;
  title: string;
  subtitle: string | null;
  badgeLabel: string;
  badgeVariant: 'success' | 'warning' | 'muted' | 'default' | 'danger';
  timestamp: string;
};

function ActivityTimelineItem({
  item,
  typeLabel,
  title,
  subtitle,
  badgeLabel,
  badgeVariant,
  timestamp,
}: ActivityTimelineItemProps) {
  return (
    <li className="relative pl-10">
      <span
        className={`absolute left-0 top-0.5 flex h-8 w-8 items-center justify-center rounded-full text-sm ring-1 ring-inset ${activityAccentClass(item.type)}`}
        aria-hidden
      >
        {activityIcon(item.type)}
      </span>
      <Link
        href={item.href}
        className="block rounded-lg border border-atg-border bg-atg-surface/40 px-3 py-2.5 transition-colors hover:border-primary/30 hover:bg-atg-elevated/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-atg-muted">
              {typeLabel}
            </p>
            <p className="mt-0.5 truncate text-sm font-medium text-atg-fg">{title}</p>
            {subtitle ? (
              <p className="mt-0.5 truncate text-xs text-atg-muted">{subtitle}</p>
            ) : null}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <time className="text-xs tabular-nums text-atg-muted" dateTime={item.createdAt}>
              {timestamp}
            </time>
            <DataTableBadge variant={badgeVariant}>{badgeLabel}</DataTableBadge>
          </div>
        </div>
      </Link>
    </li>
  );
}

export function DashboardRecentActivity({ className }: { className?: string }) {
  const { dashboardKpi: getDashboardKpiErrorMessage } = useAdminErrorMessages();
  const { hasPermission, loading: permissionsLoading } = usePermissions();
  const t = useTranslations('dashboard.activity');
  const formatDateTime = useFormatDateTime('mediumTime');
  const bookingStatusLabels = useBookingStatusLabels();
  const reviewStatusLabels = useReviewStatusLabels();
  const ticketStatusLabels = useSupportTicketStatusLabels();

  const access = {
    canReadBookings: hasPermission('bookings.read'),
    canReadReviews: hasPermission('reviews.read'),
    canReadSupportTickets: hasPermission('support_tickets.read'),
  };

  const canShow = hasDashboardActivityAccess(access);

  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; items: DashboardActivityItem[] }
  >({ status: 'loading' });

  useEffect(() => {
    if (permissionsLoading || !canShow) {
      return;
    }

    let cancelled = false;

    void fetchDashboardRecentActivity(access)
      .then((items) => {
        if (!cancelled) {
          setState({ status: 'ready', items });
        }
      })
      .catch((error) => {
        if (cancelled) return;
        if (isApiForbidden(error)) {
          setState({ status: 'ready', items: [] });
          return;
        }
        setState({ status: 'error', message: getDashboardKpiErrorMessage(error) });
      });

    return () => {
      cancelled = true;
    };
  }, [
    access,
    canShow,
    getDashboardKpiErrorMessage,
    permissionsLoading,
  ]);

  if (permissionsLoading || !canShow) {
    return null;
  }

  function renderItem(item: DashboardActivityItem) {
    const timestamp = formatDateTime(item.createdAt);

    if (item.type === 'booking') {
      return (
        <ActivityTimelineItem
          key={`${item.type}-${item.id}`}
          item={item}
          typeLabel={t('types.booking')}
          title={item.clientLabel}
          subtitle={formatMoney(item.amountCents, item.currency)}
          badgeLabel={bookingStatusLabels[item.status]}
          badgeVariant={getBookingStatusVariant(item.status)}
          timestamp={timestamp}
        />
      );
    }

    if (item.type === 'review') {
      return (
        <ActivityTimelineItem
          key={`${item.type}-${item.id}`}
          item={item}
          typeLabel={t('types.review')}
          title={t('reviewTitle', { author: item.authorLabel, rating: item.rating })}
          subtitle={item.preview}
          badgeLabel={reviewStatusLabels[item.status]}
          badgeVariant={reviewStatusVariants[item.status]}
          timestamp={timestamp}
        />
      );
    }

    return (
      <ActivityTimelineItem
        key={`${item.type}-${item.id}`}
        item={item}
        typeLabel={t('types.ticket')}
        title={item.subject}
        subtitle={item.customerLabel}
        badgeLabel={ticketStatusLabels[item.status as SupportTicketStatus]}
        badgeVariant={supportTicketStatusVariants[item.status as SupportTicketStatus]}
        timestamp={timestamp}
      />
    );
  }

  return (
    <Card variant="dashboard" padding="sm" className={className}>
      <h2 className="text-base font-semibold text-atg-fg">{t('title')}</h2>
      <p className="mt-1 text-sm text-atg-muted">{t('subtitle')}</p>

      {state.status === 'loading' ? (
        <ul className="mt-5 space-y-4" aria-busy="true">
          {Array.from({ length: 3 }).map((_, index) => (
            <li key={index} className="relative pl-10">
              <Skeleton className="absolute left-0 top-0.5 h-8 w-8 rounded-full" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </li>
          ))}
        </ul>
      ) : state.status === 'error' ? (
        <p className="mt-5 text-sm text-red-600 dark:text-red-400" role="alert">
          {state.message}
        </p>
      ) : state.items.length === 0 ? (
        <p className="mt-5 text-sm text-atg-muted">{t('empty')}</p>
      ) : (
        <ul className="mt-5 space-y-3">{state.items.map(renderItem)}</ul>
      )}
    </Card>
  );
}

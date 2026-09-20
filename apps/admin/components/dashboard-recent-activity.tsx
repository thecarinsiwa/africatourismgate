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

function ActivityTypeIcon({
  type,
  className,
}: {
  type: DashboardActivityItem['type'];
  className?: string;
}) {
  if (type === 'booking') {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    );
  }
  if (type === 'review') {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
        />
      </svg>
    );
  }
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  );
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
        className={`absolute left-0 top-0.5 flex h-8 w-8 items-center justify-center rounded-full ring-1 ring-inset ${activityAccentClass(item.type)}`}
        aria-hidden
      >
        <ActivityTypeIcon type={item.type} className="h-4 w-4" />
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

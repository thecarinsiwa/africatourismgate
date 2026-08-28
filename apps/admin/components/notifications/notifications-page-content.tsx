'use client';

import { useId, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button, Card, EmptyState, Input, PageHeader, cn } from '@africatourismgate/ui';
import type {
  AdminNotificationCategory,
  AdminNotificationItem,
  AdminNotificationPriority,
} from '../../lib/notifications/types';
import { useAdminNotifications } from '../../lib/notifications/use-admin-notifications';

function BellIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      />
    </svg>
  );
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

function CategoryIcon({
  category,
  className,
}: {
  category: Exclude<AdminNotificationCategory, 'all'>;
  className?: string;
}) {
  switch (category) {
    case 'booking':
      return (
        <svg
          className={className}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      );
    case 'message':
      return (
        <svg
          className={className}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      );
    case 'review':
      return (
        <svg
          className={className}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      );
    case 'support':
      return (
        <svg
          className={className}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      );
  }
}

function formatRelativeTime(
  dateString: string,
  t: (key: string, values?: Record<string, number | string>) => string,
): string {
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMin < 2) return t('justNow');
  if (diffMin < 60) return t('minutesAgo', { count: diffMin });
  if (diffHours < 24) return t('hoursAgo', { count: diffHours });
  return t('daysAgo', { count: diffDays });
}

function formatFullDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function NotificationsPageContent() {
  const t = useTranslations('common.notifications');
  const tPage = useTranslations('pages.notifications');
  const router = useRouter();
  const searchInputId = useId();

  const [activeCategory, setActiveCategory] = useState<AdminNotificationCategory>('all');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    items,
    unreadCount,
    counts,
    loading,
    refresh,
    markAsRead,
    markAsUnread,
    toggleRead,
    markAllAsRead,
  } = useAdminNotifications();

  const filteredItems = useMemo(() => {
    let result = items;

    if (activeCategory !== 'all') {
      result = result.filter((item) => item.category === activeCategory);
    }

    if (unreadOnly) {
      result = result.filter((item) => item.unread);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          (item.meta?.authorName && item.meta.authorName.toLowerCase().includes(q)) ||
          (item.meta?.bookingId && item.meta.bookingId.toLowerCase().includes(q)) ||
          (item.meta?.ticketId && item.meta.ticketId.toLowerCase().includes(q)),
      );
    }

    return result;
  }, [items, activeCategory, unreadOnly, searchQuery]);

  const tabs: { key: AdminNotificationCategory; label: string; count?: number }[] = useMemo(
    () => [
      { key: 'all', label: t('tabs.all'), count: counts.total },
      { key: 'booking', label: t('tabs.booking'), count: counts.byCategory.booking },
      { key: 'message', label: t('tabs.message'), count: counts.byCategory.message },
      { key: 'review', label: t('tabs.review'), count: counts.byCategory.review },
      { key: 'support', label: t('tabs.support'), count: counts.byCategory.support },
    ],
    [t, counts],
  );

  const handleItemNavigate = (item: AdminNotificationItem) => {
    if (item.unread) {
      markAsRead(item.id);
    }
    router.push(item.href);
  };

  const getPriorityBadge = (priority: AdminNotificationPriority) => {
    if (priority === 'high') {
      return (
        <span className="inline-flex items-center rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-600 dark:text-rose-400">
          {t('priority.high')}
        </span>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={tPage('title')}
        description={tPage('description')}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {unreadCount > 0 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="gap-1.5 text-xs font-medium"
              >
                <CheckCircleIcon className="h-4 w-4 text-primary" />
                <span>{t('markAllAsRead')}</span>
              </Button>
            ) : null}
            <Button
              variant="outline"
              size="sm"
              onClick={() => void refresh()}
              disabled={loading}
              className="gap-1.5 text-xs font-medium"
            >
              <RefreshIcon className={cn('h-4 w-4', loading && 'animate-spin text-primary')} />
              <span>{t('refresh')}</span>
            </Button>
          </div>
        }
      />

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <div
          onClick={() => {
            setActiveCategory('all');
            setUnreadOnly(false);
          }}
          className={cn(
            'cursor-pointer rounded-2xl border p-4 transition-all',
            activeCategory === 'all' && !unreadOnly
              ? 'border-primary bg-primary/[0.04] shadow-sm'
              : 'border-atg-border bg-atg-surface hover:border-primary/50',
          )}
        >
          <div className="flex items-center justify-between text-xs font-medium text-atg-muted">
            <span>{t('stats.total')}</span>
            <BellIcon className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-atg-fg">{counts.total}</span>
            {unreadCount > 0 ? (
              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                ({unreadCount} {t('unreadBadge')})
              </span>
            ) : null}
          </div>
        </div>

        <div
          onClick={() => {
            setActiveCategory('booking');
          }}
          className={cn(
            'cursor-pointer rounded-2xl border p-4 transition-all',
            activeCategory === 'booking'
              ? 'border-blue-500 bg-blue-500/[0.04] shadow-sm'
              : 'border-atg-border bg-atg-surface hover:border-blue-400',
          )}
        >
          <div className="flex items-center justify-between text-xs font-medium text-atg-muted">
            <span>{t('stats.booking')}</span>
            <CategoryIcon category="booking" className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-atg-fg">
            {counts.byCategory.booking}
          </div>
        </div>

        <div
          onClick={() => {
            setActiveCategory('message');
          }}
          className={cn(
            'cursor-pointer rounded-2xl border p-4 transition-all',
            activeCategory === 'message'
              ? 'border-emerald-500 bg-emerald-500/[0.04] shadow-sm'
              : 'border-atg-border bg-atg-surface hover:border-emerald-400',
          )}
        >
          <div className="flex items-center justify-between text-xs font-medium text-atg-muted">
            <span>{t('stats.message')}</span>
            <CategoryIcon category="message" className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-atg-fg">
            {counts.byCategory.message}
          </div>
        </div>

        <div
          onClick={() => {
            setActiveCategory('review');
          }}
          className={cn(
            'cursor-pointer rounded-2xl border p-4 transition-all',
            activeCategory === 'review'
              ? 'border-amber-500 bg-amber-500/[0.04] shadow-sm'
              : 'border-atg-border bg-atg-surface hover:border-amber-400',
          )}
        >
          <div className="flex items-center justify-between text-xs font-medium text-atg-muted">
            <span>{t('stats.review')}</span>
            <CategoryIcon category="review" className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-atg-fg">
            {counts.byCategory.review}
          </div>
        </div>

        <div
          onClick={() => {
            setActiveCategory('support');
          }}
          className={cn(
            'col-span-2 cursor-pointer rounded-2xl border p-4 transition-all sm:col-span-1',
            activeCategory === 'support'
              ? 'border-purple-500 bg-purple-500/[0.04] shadow-sm'
              : 'border-atg-border bg-atg-surface hover:border-purple-400',
          )}
        >
          <div className="flex items-center justify-between text-xs font-medium text-atg-muted">
            <span>{t('stats.support')}</span>
            <CategoryIcon category="support" className="h-4 w-4 text-purple-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-atg-fg">
            {counts.byCategory.support}
          </div>
        </div>
      </div>

      {/* Main Filter & List Container */}
      <Card className="overflow-hidden border border-atg-border p-0 shadow-sm">
        {/* Controls Toolbar */}
        <div className="flex flex-col gap-3 border-b border-atg-border bg-atg-surface/50 p-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {tabs.map((tab) => {
              const active = activeCategory === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveCategory(tab.key)}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all',
                    active
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-atg-surface text-atg-muted hover:bg-atg-border/50 hover:text-atg-fg',
                  )}
                >
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 ? (
                    <span
                      className={cn(
                        'rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                        active
                          ? 'bg-white/20 text-white'
                          : 'bg-atg-border text-atg-fg',
                      )}
                    >
                      {tab.count}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Search and Unread Toggle */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative min-w-[200px] flex-1 sm:w-64 sm:flex-none">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-atg-muted" />
              <input
                id={searchInputId}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full rounded-xl border border-atg-border bg-atg-surface py-1.5 pl-9 pr-3 text-xs text-atg-fg placeholder:text-atg-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-atg-muted hover:text-atg-fg"
                >
                  ✕
                </button>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => setUnreadOnly((prev) => !prev)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all',
                unreadOnly
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-atg-border bg-atg-surface text-atg-muted hover:bg-atg-border/40 hover:text-atg-fg',
              )}
            >
              <span
                className={cn(
                  'h-2 w-2 rounded-full',
                  unreadOnly ? 'bg-primary' : 'bg-atg-muted/50',
                )}
              />
              <span>{t('filterUnreadOnly')}</span>
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="divide-y divide-atg-border/60">
          {filteredItems.length === 0 ? (
            <div className="py-12">
              <EmptyState
                title={searchQuery || unreadOnly ? t('emptyFiltered') : t('empty')}
                description={
                  searchQuery || unreadOnly
                    ? undefined
                    : t('emptyHint')
                }
                action={
                  searchQuery || unreadOnly || activeCategory !== 'all' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchQuery('');
                        setUnreadOnly(false);
                        setActiveCategory('all');
                      }}
                      className="mt-2 text-xs"
                    >
                      {t('resetFilters')}
                    </Button>
                  ) : undefined
                }
              />
            </div>
          ) : (
            filteredItems.map((item) => {
              const categoryColor =
                item.category === 'booking'
                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                  : item.category === 'message'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : item.category === 'review'
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                      : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';

              return (
                <div
                  key={item.id}
                  className={cn(
                    'group flex flex-col gap-3 p-4 transition-colors sm:flex-row sm:items-center sm:justify-between',
                    item.unread ? 'bg-primary/[0.025]' : 'bg-transparent opacity-85 hover:opacity-100',
                    'hover:bg-atg-surface/80',
                  )}
                >
                  {/* Left & Content */}
                  <div
                    onClick={() => handleItemNavigate(item)}
                    className="flex flex-1 cursor-pointer items-start gap-3.5"
                  >
                    {/* Icon */}
                    <div
                      className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border shadow-sm transition-transform group-hover:scale-105',
                        categoryColor,
                      )}
                    >
                      <CategoryIcon category={item.category} className="h-5 w-5" />
                    </div>

                    {/* Content Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            'inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold',
                            categoryColor,
                          )}
                        >
                          {t(`categories.${item.category}`)}
                        </span>

                        {getPriorityBadge(item.priority)}

                        {item.unread ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            {t('unreadBadge')}
                          </span>
                        ) : null}

                        <span className="text-[11px] text-atg-muted">
                          · {formatRelativeTime(item.createdAt, t)}
                        </span>
                      </div>

                      <h4
                        className={cn(
                          'mt-1.5 text-sm font-semibold',
                          item.unread ? 'text-atg-fg' : 'text-atg-fg/90',
                        )}
                      >
                        {item.description}
                      </h4>

                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-atg-muted">
                        <span>{formatFullDate(item.createdAt)}</span>
                        {item.meta?.bookingId ? (
                          <span className="font-mono text-[11px]">
                            ID: #{item.meta.bookingId.slice(0, 8)}
                          </span>
                        ) : null}
                        {item.meta?.ticketId ? (
                          <span className="font-mono text-[11px]">
                            Ticket: #{item.meta.ticketId.slice(0, 8)}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex shrink-0 items-center gap-2 pl-13 sm:pl-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleItemNavigate(item)}
                      className="gap-1.5 text-xs font-semibold"
                    >
                      <span>{t('openAction')}</span>
                      <span>→</span>
                    </Button>

                    <button
                      type="button"
                      onClick={() => toggleRead(item.id)}
                      title={item.unread ? t('markAsRead') : t('markAsUnread')}
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-xl border transition-colors',
                        item.unread
                          ? 'border-atg-border bg-atg-surface text-atg-muted hover:border-primary hover:text-primary'
                          : 'border-primary/30 bg-primary/10 text-primary hover:bg-primary/20',
                      )}
                    >
                      <CheckCircleIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}

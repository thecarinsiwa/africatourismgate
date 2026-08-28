'use client';

import { cn } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type {
  AdminNotificationCategory,
  AdminNotificationItem,
} from '../../lib/notifications/types';
import { useAdminNotifications } from '../../lib/notifications/use-admin-notifications';

function BellIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
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

function CategoryIcon({
  category,
  className,
}: {
  category: AdminNotificationItem['category'];
  className?: string;
}) {
  switch (category) {
    case 'booking':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

export function AdminNotificationsMenu() {
  const t = useTranslations('common.notifications');
  const router = useRouter();
  const menuId = useId();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminNotificationCategory>('all');
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    items,
    unreadCount,
    counts,
    loading,
    refresh,
    markAsRead,
    markAllAsRead,
  } = useAdminNotifications();

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const filteredItems = useMemo(() => {
    if (activeTab === 'all') return items;
    return items.filter((item) => item.category === activeTab);
  }, [items, activeTab]);

  const tabs: { key: AdminNotificationCategory; label: string; count?: number }[] = useMemo(
    () => [
      { key: 'all', label: t('tabs.all'), count: counts.unread },
      { key: 'booking', label: t('tabs.booking'), count: counts.byCategory.booking },
      { key: 'message', label: t('tabs.message'), count: counts.byCategory.message },
      { key: 'review', label: t('tabs.review'), count: counts.byCategory.review },
      { key: 'support', label: t('tabs.support'), count: counts.byCategory.support },
    ],
    [t, counts],
  );

  function handleItemClick(item: AdminNotificationItem) {
    markAsRead(item.id);
    setOpen(false);
    router.push(item.href);
  }

  return (
    <div ref={containerRef} className="relative inline-flex items-center">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-atg-border bg-atg-elevated',
          'text-atg-fg transition-colors hover:bg-atg-surface',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        )}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        aria-label={t('openLabel')}
      >
        <BellIcon className="h-5 w-5" />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white shadow-sm ring-2 ring-atg-elevated">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          id={menuId}
          className="absolute right-0 top-full z-50 mt-2 w-[calc(100vw-2rem)] max-w-md rounded-2xl border border-atg-border bg-atg-elevated shadow-2xl transition-all sm:w-[26rem]"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-atg-border px-4 py-3">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-atg-fg">{t('title')}</h3>
              {unreadCount > 0 ? (
                <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-semibold text-red-600 dark:text-red-400">
                  {unreadCount} {t('unreadBadge')}
                </span>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void refresh()}
                disabled={loading}
                className="rounded-lg p-1 text-atg-muted hover:bg-atg-surface hover:text-atg-fg disabled:opacity-50"
                title={t('refresh')}
              >
                <svg
                  className={cn('h-4 w-4', loading && 'animate-spin')}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
              {unreadCount > 0 ? (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  {t('markAllAsRead')}
                </button>
              ) : null}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex overflow-x-auto border-b border-atg-border px-2 py-1.5 no-scrollbar">
            {tabs.map((tab) => {
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors',
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-atg-muted hover:bg-atg-surface hover:text-atg-fg',
                  )}
                >
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 ? (
                    <span
                      className={cn(
                        'rounded-full px-1.5 py-0.2 text-[10px] font-bold',
                        active
                          ? 'bg-primary text-white'
                          : 'bg-atg-surface text-atg-muted',
                      )}
                    >
                      {tab.count}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* List */}
          <div className="max-h-[22rem] overflow-y-auto divide-y divide-atg-border/50">
            {filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-atg-surface text-atg-muted">
                  <BellIcon className="h-6 w-6" />
                </span>
                <p className="mt-3 text-sm font-semibold text-atg-fg">{t('empty')}</p>
                <p className="mt-1 text-xs text-atg-muted">{t('emptyHint')}</p>
              </div>
            ) : (
              filteredItems.map((item) => {
                const categoryColor =
                  item.category === 'booking'
                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                    : item.category === 'message'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : item.category === 'review'
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        : 'bg-purple-500/10 text-purple-600 dark:text-purple-400';

                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={cn(
                      'group flex cursor-pointer items-start gap-3 p-3.5 transition-colors hover:bg-atg-surface/70',
                      item.unread ? 'bg-primary/[0.03]' : 'opacity-80',
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                        categoryColor,
                      )}
                    >
                      <CategoryIcon category={item.category} className="h-4.5 w-4.5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={cn(
                            'truncate text-xs font-semibold',
                            item.unread ? 'text-atg-fg' : 'text-atg-muted',
                          )}
                        >
                          {t(`categories.${item.category}`)}
                        </p>
                        <span className="shrink-0 text-[11px] text-atg-muted">
                          {formatRelativeTime(item.createdAt, t)}
                        </span>
                      </div>

                      <p className="mt-0.5 line-clamp-2 text-xs text-atg-muted">
                        {item.description}
                      </p>
                    </div>

                    {item.unread ? (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    ) : null}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-atg-border bg-atg-surface/30 px-4 py-2.5 text-center">
            <Link
              href="/reservations"
              onClick={() => setOpen(false)}
              className="text-xs font-semibold text-primary hover:underline"
            >
              {t('viewAll')} →
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}

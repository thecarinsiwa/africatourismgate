'use client';

import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  buildActivityDetailHref,
  formatActivityPrice,
  formatDurationMinutes,
} from '../../lib/activities/listings';
import { getActivityDifficultyLabel } from '../../lib/activities/difficulty';
import type { ActivityDetail } from '../../lib/activities/types';
import { getActivityDetail } from '../../lib/api/public';
import { formatPackagePrice } from '../../lib/packages/listings';
import type { PackageItemEnriched } from '../../lib/packages/types';
import type { Translations } from '../../lib/i18n/translations';
import { ProductGallery } from '../shared';

type PackageItemDetailModalProps = {
  item: PackageItemEnriched | null;
  open: boolean;
  onClose: () => void;
  startDate?: string;
  travelers?: number;
  t: Translations['packages'];
  a: Translations['activities'];
};

function defaultPreviewDate(): string {
  const date = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

const PRODUCT_PATHS: Record<PackageItemEnriched['itemType'], string | null> = {
  property: '/hotels',
  flight: '/flights',
  vehicle: '/cars',
  cruise: '/cruises',
  activity: '/activities',
};

export function PackageItemDetailModal({
  item,
  open,
  onClose,
  startDate,
  travelers = 1,
  t,
  a,
}: PackageItemDetailModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  const [activityDetail, setActivityDetail] = useState<ActivityDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!open || !item || item.itemType !== 'activity') {
      setActivityDetail(null);
      setLoading(false);
      setError(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(false);

    void getActivityDetail(item.itemId, {
      date: startDate || defaultPreviewDate(),
      participants: travelers,
    })
      .then((data) => {
        if (!cancelled) setActivityDetail(data);
      })
      .catch(() => {
        if (!cancelled) {
          setActivityDetail(null);
          setError(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, item, startDate, travelers]);

  useEffect(() => {
    if (!open) return;

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const frame = window.requestAnimationFrame(() => {
      panelRef.current?.focus();
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocusedRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open || !item || typeof document === 'undefined') return null;

  const typeLabel = t.itemTypes[item.itemType];
  const fullPageHref =
    item.itemType === 'activity'
      ? buildActivityDetailHref(item.itemId, {
          date: startDate,
          participants: String(travelers),
        })
      : PRODUCT_PATHS[item.itemType]
        ? `${PRODUCT_PATHS[item.itemType]}/${encodeURIComponent(item.itemId)}`
        : null;

  const durationLabel = activityDetail
    ? formatDurationMinutes(activityDetail.durationMinutes, {
        hourSingular: a.hourSingular,
        hourPlural: a.hourPlural,
        minuteSingular: a.minuteSingular,
        minutePlural: a.minutePlural,
      })
    : null;

  const difficultyLabel = activityDetail?.difficultyLevel
    ? getActivityDifficultyLabel(activityDetail.difficultyLevel, {
        easy: a.difficultyEasy,
        moderate: a.difficultyModerate,
        hard: a.difficultyHard,
        expert: a.difficultyExpert,
      })
    : null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="flex max-h-[min(92vh,820px)] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-atg-border bg-atg-elevated shadow-xl outline-none dark:border-atg-border dark:bg-atg-elevated sm:rounded-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 border-b border-atg-border px-5 py-4 dark:border-atg-border">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">{typeLabel}</p>
            <h2 id={titleId} className="mt-1 text-xl font-bold text-atg-fg">
              {activityDetail?.title ?? item.label}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-lg border border-atg-border text-lg font-semibold text-atg-fg transition-colors hover:border-primary dark:border-atg-border"
            aria-label={t.itemDetailClose}
          >
            <span aria-hidden>×</span>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {item.itemType === 'activity' && loading ? (
            <p className="text-sm text-atg-muted">{t.itemDetailLoading}</p>
          ) : null}

          {item.itemType === 'activity' && error ? (
            <p className="text-sm text-red-700 dark:text-red-300">{t.itemDetailError}</p>
          ) : null}

          {item.itemType === 'activity' && activityDetail && !loading ? (
            <div className="space-y-5">
              {activityDetail.images && activityDetail.images.length > 0 ? (
                <ProductGallery
                  images={activityDetail.images}
                  name={activityDetail.title}
                  labels={{
                    ariaLabel: t.galleryAria,
                    openLightbox: t.galleryOpenLightbox,
                    close: t.galleryClose,
                    previous: t.galleryPrevious,
                    next: t.galleryNext,
                    counter: t.galleryCounter,
                  }}
                />
              ) : null}

              {activityDetail.description ? (
                <p className="text-sm leading-relaxed text-atg-muted">
                  {activityDetail.description}
                </p>
              ) : null}

              <dl className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-atg-surface px-4 py-3 dark:bg-atg-surface/60">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-atg-muted">
                    {a.destination}
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-atg-fg">
                    {activityDetail.destination}
                  </dd>
                </div>
                <div className="rounded-xl bg-atg-surface px-4 py-3 dark:bg-atg-surface/60">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-atg-muted">
                    {a.providerLabel}
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-atg-fg">
                    {activityDetail.providerName}
                  </dd>
                </div>
                {durationLabel ? (
                  <div className="rounded-xl bg-atg-surface px-4 py-3 dark:bg-atg-surface/60">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-atg-muted">
                      {a.durationLabel}
                    </dt>
                    <dd className="mt-1 text-sm font-medium text-atg-fg">{durationLabel}</dd>
                  </div>
                ) : null}
                {difficultyLabel ? (
                  <div className="rounded-xl bg-atg-surface px-4 py-3 dark:bg-atg-surface/60">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-atg-muted">
                      {a.difficultyLabel}
                    </dt>
                    <dd className="mt-1 text-sm font-medium text-atg-fg">{difficultyLabel}</dd>
                  </div>
                ) : null}
                <div className="rounded-xl bg-atg-surface px-4 py-3 dark:bg-atg-surface/60">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-atg-muted">
                    {t.itemDetailPriceLabel}
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-atg-fg">
                    {formatActivityPrice(activityDetail.priceCents, activityDetail.currency)}
                  </dd>
                </div>
              </dl>
            </div>
          ) : null}

          {item.itemType !== 'activity' ? (
            <div className="space-y-4">
              <p className="text-sm text-atg-muted">{t.itemDetailGenericHint}</p>
              <p className="text-sm font-semibold text-atg-fg">
                {formatPackagePrice(item.unitPriceCents, item.currency)}
              </p>
            </div>
          ) : null}
        </div>

        {fullPageHref ? (
          <footer className="border-t border-atg-border px-5 py-4 dark:border-atg-border">
            <Link
              href={fullPageHref}
              className="inline-flex min-h-[44px] w-full items-center justify-center rounded-lg border border-atg-border px-4 py-2 text-sm font-semibold text-primary transition-colors hover:border-primary dark:border-atg-border sm:w-auto"
            >
              {t.itemDetailViewFullPage}
            </Link>
          </footer>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}

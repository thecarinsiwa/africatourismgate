'use client';

import type { PackageDetail } from '../../lib/packages/types';
import type { Translations } from '../../lib/i18n/translations';
import { formatDisplayDate } from '../../lib/hotels/dates';
import { PackagePriceDisplay } from './package-price-display';
import {
  BookingSidebarBody,
  BookingSidebarCta,
  BookingSidebarDesktop,
  BookingSidebarHint,
  BookingSidebarMobileBar,
  BookingSidebarSummary,
  BookingSidebarTrustHints,
  useBookingSidebarTrustHints,
} from '../shared/booking-sidebar-shell';

type PackageBookingSidebarProps = {
  detail: PackageDetail;
  startDate: string;
  endDate: string;
  durationDays: number;
  resolving: boolean;
  canAddToCart: boolean;
  onAddToCart: () => void;
  t: Translations['packages'];
  locale?: string;
};

function PackageBookingContent({
  detail,
  startDate,
  endDate,
  durationDays,
  resolving,
  canAddToCart,
  onAddToCart,
  t,
  locale,
}: PackageBookingSidebarProps) {
  const trustHints = useBookingSidebarTrustHints();

  return (
    <BookingSidebarBody title={t.pricingTitle}>
      <PackagePriceDisplay
        pricing={detail.pricing}
        priceLabel={t.packagePrice}
        discountBadgeTemplate={t.discountBadge}
        className="text-left [&_div]:justify-start"
      />

      {detail.pricing.discountAmountCents > 0 ? (
        <p className="text-sm text-emerald-700 dark:text-emerald-300">
          {t.youSave.replace(
            '{amount}',
            `${(detail.pricing.discountAmountCents / 100).toFixed(0)} ${detail.pricing.currency}`,
          )}
        </p>
      ) : null}

      {startDate ? (
        <div className="space-y-1 border-t border-atg-border pt-4 text-sm dark:border-atg-border">
          <BookingSidebarSummary>
            <span className="font-medium text-atg-fg">{t.departureDateLabel}:</span>{' '}
            {formatDisplayDate(startDate, locale)}
          </BookingSidebarSummary>
          <BookingSidebarSummary>
            <span className="font-medium text-atg-fg">{t.returnDateLabel}:</span>{' '}
            {formatDisplayDate(endDate, locale)}
          </BookingSidebarSummary>
          <BookingSidebarSummary>
            {t.durationDaysLabel.replace('{days}', String(durationDays))}
          </BookingSidebarSummary>
        </div>
      ) : null}

      {resolving ? <BookingSidebarHint>{t.resolvingPackage}</BookingSidebarHint> : null}

      {!startDate && (
        <BookingSidebarHint tone="warning">{t.selectDepartureHint}</BookingSidebarHint>
      )}

      <BookingSidebarCta label={t.addToCart} disabled={!canAddToCart} onClick={onAddToCart} />
      <BookingSidebarTrustHints items={trustHints} />
    </BookingSidebarBody>
  );
}

export function PackageBookingSidebar(props: PackageBookingSidebarProps) {
  return (
    <BookingSidebarDesktop>
      <PackageBookingContent {...props} />
    </BookingSidebarDesktop>
  );
}

export function PackageBookingMobileBar({
  detail,
  startDate,
  endDate,
  durationDays,
  resolving,
  canAddToCart,
  onAddToCart,
  t,
  locale,
}: PackageBookingSidebarProps) {
  const secondaryLine = startDate
    ? `${formatDisplayDate(startDate, locale)} → ${formatDisplayDate(endDate, locale)} · ${t.durationDaysLabel.replace('{days}', String(durationDays))}`
    : resolving
      ? t.resolvingPackage
      : t.selectDepartureHint;

  return (
    <BookingSidebarMobileBar
      priceLabel={t.packagePrice}
      priceAmount={`${(detail.pricing.totalCents / 100).toFixed(0)} ${detail.pricing.currency}`}
      secondaryLine={secondaryLine}
      ctaLabel={t.addToCart}
      ctaDisabled={!canAddToCart}
      onCtaClick={onAddToCart}
    />
  );
}

'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  getBookingItemCatalogHref,
  getBookingItemTypeLabel,
} from '../../lib/booking-item-catalog';
import { useBookingItemTypeLabels } from '../../lib/i18n/use-module-labels';

type BookingItemCatalogLinkProps = {
  itemType: string;
  referenceId: string;
  title: string;
  showReference?: boolean;
};

export function BookingItemCatalogLink({
  itemType,
  referenceId,
  title,
  showReference = false,
}: BookingItemCatalogLinkProps) {
  const t = useTranslations('modules.bookings');
  const itemTypeLabels = useBookingItemTypeLabels();
  const href = getBookingItemCatalogHref(itemType, referenceId);
  const typeLabel = getBookingItemTypeLabel(itemType, itemTypeLabels);

  const titleContent = href ? (
    <Link
      href={href}
      className="font-medium text-primary hover:underline"
      aria-label={t('catalogLink.ariaLabel', { typeLabel, title })}
    >
      {title}
    </Link>
  ) : (
    <span className="font-medium text-atg-fg">{title}</span>
  );

  if (!showReference) {
    return titleContent;
  }

  return (
    <div>
      {titleContent}
      <p className="text-xs text-atg-muted">
        {t('catalogLink.referencePrefix', { idPrefix: referenceId.slice(0, 8) })}
      </p>
    </div>
  );
}

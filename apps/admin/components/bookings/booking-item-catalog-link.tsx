'use client';

import Link from 'next/link';
import {
  getBookingItemCatalogHref,
  getBookingItemCatalogLinkLabel,
} from '../../lib/booking-item-catalog';

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
  const href = getBookingItemCatalogHref(itemType, referenceId);

  const titleContent = href ? (
    <Link
      href={href}
      className="font-medium text-primary hover:underline"
      aria-label={getBookingItemCatalogLinkLabel(itemType, title)}
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
      <p className="text-xs text-atg-muted">Réf. {referenceId.slice(0, 8)}</p>
    </div>
  );
}

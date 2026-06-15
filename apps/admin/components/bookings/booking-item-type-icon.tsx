'use client';

import { cn } from '@africatourismgate/ui';
import type { BookingItemType } from '@africatourismgate/types';
import {
  getBookingItemTypeIcon,
  getBookingItemTypeLabel,
} from '../../lib/booking-item-catalog';

type BookingItemTypeIconProps = {
  itemType: BookingItemType | string;
  size?: 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
};

const sizeClasses = {
  sm: { wrapper: 'h-7 w-7', icon: 'h-3.5 w-3.5', label: 'text-xs' },
  md: { wrapper: 'h-9 w-9', icon: 'h-4 w-4', label: 'text-sm' },
} as const;

export function BookingItemTypeIcon({
  itemType,
  size = 'md',
  showLabel = false,
  className,
}: BookingItemTypeIconProps) {
  const Icon = getBookingItemTypeIcon(itemType);
  const label = getBookingItemTypeLabel(itemType);
  const sizes = sizeClasses[size];

  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary',
          sizes.wrapper,
        )}
        aria-hidden={showLabel || undefined}
        aria-label={showLabel ? undefined : label}
        title={label}
      >
        <Icon className={sizes.icon} />
      </span>
      {showLabel ? (
        <span className={cn('font-medium text-atg-fg', sizes.label)}>{label}</span>
      ) : null}
    </span>
  );
}

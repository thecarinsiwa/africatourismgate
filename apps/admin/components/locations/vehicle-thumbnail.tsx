'use client';

import { cn, SidebarCarIcon } from '@africatourismgate/ui';
import { getVehicleCategoryIcon } from '../../lib/vehicle-category-icon-map';

type VehicleThumbnailProps = {
  label: string;
  categoryName?: string | null;
  size?: 'sm' | 'md';
  className?: string;
};

const sizeClasses = {
  sm: 'h-10 w-14',
  md: 'h-12 w-16',
};

export function VehicleThumbnail({
  label,
  categoryName,
  size = 'md',
  className,
}: VehicleThumbnailProps) {
  const iconClassName = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';

  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-primary/25 to-atg-surface ring-1 ring-atg-border/60',
        sizeClasses[size],
        className,
      )}
      title={label}
      aria-hidden
    >
      {categoryName ? (
        <span className="text-primary/70">
          {getVehicleCategoryIcon(categoryName, iconClassName)}
        </span>
      ) : (
        <SidebarCarIcon className={cn(iconClassName, 'text-primary/70')} />
      )}
    </div>
  );
}

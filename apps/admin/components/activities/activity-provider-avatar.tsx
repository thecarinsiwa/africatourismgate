'use client';

import { cn } from '@africatourismgate/ui';

type ActivityProviderAvatarProps = {
  name: string;
  size?: 'sm' | 'md';
  className?: string;
};

const sizeClasses = {
  sm: 'h-9 w-9 text-xs',
  md: 'h-10 w-10 text-sm',
};

function getProviderInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase();
  }
  return name.trim().slice(0, 2).toUpperCase();
}

export function ActivityProviderAvatar({
  name,
  size = 'md',
  className,
}: ActivityProviderAvatarProps) {
  const initials = getProviderInitials(name);

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-primary/10 font-semibold text-primary ring-1 ring-atg-border/60',
        sizeClasses[size],
        className,
      )}
      aria-hidden
      title={name}
    >
      {initials}
    </div>
  );
}

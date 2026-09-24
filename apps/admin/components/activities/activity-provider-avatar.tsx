'use client';

import { cn } from '@africatourismgate/ui';
import Image from 'next/image';
import { resolveMediaUrl } from '../../lib/resolve-media-url';

type ActivityProviderAvatarProps = {
  name: string;
  logoUrl?: string | null;
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
  logoUrl,
  size = 'md',
  className,
}: ActivityProviderAvatarProps) {
  const initials = getProviderInitials(name);
  const src = logoUrl?.trim() ? resolveMediaUrl(logoUrl.trim()) : null;

  if (src) {
    return (
      <div
        className={cn(
          'relative shrink-0 overflow-hidden rounded-full ring-1 ring-atg-border/60',
          sizeClasses[size],
          className,
        )}
        title={name}
      >
        <Image
          src={src}
          alt={name}
          fill
          unoptimized
          className="object-cover"
          sizes={size === 'sm' ? '36px' : '40px'}
        />
      </div>
    );
  }

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

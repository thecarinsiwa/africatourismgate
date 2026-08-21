'use client';

import { cn } from '@africatourismgate/ui';
import Image from 'next/image';
import { useState } from 'react';
import { getSession } from '../../lib/auth/session';
import { resolveMediaUrl } from '../../lib/resolve-media-url';

type AirlineLogoProps = {
  iataCode: string;
  logoUrl?: string | null;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const sizeClasses = {
  sm: 'h-10 w-10',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
} as const;

const textClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
} as const;

/** Logo compagnie : image réelle ou pastille IATA. */
export function AirlineLogo({
  iataCode,
  logoUrl,
  label,
  size = 'sm',
  className,
}: AirlineLogoProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const session = getSession();
  const imgSrc =
    logoUrl?.trim() && !imageFailed ? resolveMediaUrl(logoUrl.trim()) : null;

  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-primary/25 to-atg-surface ring-1 ring-atg-border/60',
        sizeClasses[size],
        className,
      )}
      aria-hidden={!label}
    >
      {imgSrc ? (
        <Image
          src={imgSrc}
          alt={label ?? iataCode}
          fill
          className="object-contain p-1"
          sizes={size === 'lg' ? '64px' : size === 'md' ? '48px' : '40px'}
          unoptimized
          onError={() => setImageFailed(true)}
          {...(session?.accessToken
            ? {
                loader: ({ src }) => src,
              }
            : {})}
        />
      ) : (
        <span
          className={cn(
            'font-mono font-bold uppercase text-primary/80',
            textClasses[size],
          )}
        >
          {iataCode.slice(0, 2)}
        </span>
      )}
    </div>
  );
}

/** @deprecated Prefer AirlineLogo */
export function AirlineLogoPlaceholder({
  iataCode,
  className,
}: {
  iataCode: string;
  className?: string;
}) {
  return <AirlineLogo iataCode={iataCode} className={className} />;
}

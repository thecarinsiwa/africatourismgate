'use client';

import { cn } from '@africatourismgate/ui';
import Image from 'next/image';
import { CountryFlagPlaceholder } from '../flights/country-flag-placeholder';
import { resolveMediaUrl } from '../../lib/resolve-media-url';

type DestinationHeroBannerProps = {
  name: string;
  slug?: string;
  countryCode: string;
  imageUrl?: string | null;
  className?: string;
};

export function DestinationHeroBanner({
  name,
  slug,
  countryCode,
  imageUrl,
  className,
}: DestinationHeroBannerProps) {
  const trimmedImage = imageUrl?.trim();
  const hasImage = Boolean(trimmedImage);
  const resolvedImage = hasImage ? resolveMediaUrl(trimmedImage!) : null;

  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-xl border border-atg-border shadow-sm',
        className,
      )}
      aria-label={`Destination ${name}`}
    >
      <div
        className={cn(
          'relative min-h-[180px] px-6 py-8 sm:min-h-[220px] sm:px-8 sm:py-10',
          !hasImage && 'bg-gradient-to-br from-[#0f2744] via-[#163456] to-primary/80',
        )}
      >
        {resolvedImage ? (
          <>
            <Image
              src={resolvedImage}
              alt=""
              fill
              unoptimized
              className="object-cover"
              priority
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/40 to-black/20" />
          </>
        ) : null}

        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2 text-white">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
              Destination
            </p>
            <h2 className="text-2xl font-bold leading-tight sm:text-3xl">{name}</h2>
            {slug ? (
              <p className="font-mono text-sm text-white/80">
                {slug}
                <span className="mx-2 text-white/50">·</span>
                {countryCode.toUpperCase()}
              </p>
            ) : (
              <p className="text-sm text-white/80">{countryCode.toUpperCase()}</p>
            )}
          </div>
          <CountryFlagPlaceholder
            countryCode={countryCode}
            className="h-12 w-12 bg-white/10 ring-white/20 backdrop-blur-sm"
          />
        </div>
      </div>
    </section>
  );
}

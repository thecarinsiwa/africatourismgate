'use client';

import { cn } from '@africatourismgate/ui';
import { normalizeBrandingAssetUrl } from '@africatourismgate/utils';
import Image from 'next/image';
import { getOrganizationInitial } from '../../lib/organization-display';

export type OrganizationLogoSize = 'sm' | 'md' | 'lg';

const sizeClasses: Record<OrganizationLogoSize, string> = {
  sm: 'h-9 w-9 text-sm',
  md: 'h-11 w-11 text-sm',
  lg: 'h-14 w-14 text-base',
};

const imageSizes: Record<OrganizationLogoSize, string> = {
  sm: '36px',
  md: '44px',
  lg: '56px',
};

type OrganizationLogoProps = {
  name: string;
  logoUrl?: string | null;
  size?: OrganizationLogoSize;
  className?: string;
};

export function OrganizationLogo({
  name,
  logoUrl,
  size = 'md',
  className,
}: OrganizationLogoProps) {
  const initial = getOrganizationInitial(name);
  const resolvedLogoUrl = normalizeBrandingAssetUrl(logoUrl);

  if (resolvedLogoUrl) {
    return (
      <div
        className={cn(
          'relative shrink-0 overflow-hidden rounded-lg ring-1 ring-atg-border/60',
          sizeClasses[size],
          className,
        )}
      >
        <Image
          src={resolvedLogoUrl}
          alt={name}
          fill
          className="object-cover"
          sizes={imageSizes[size]}
          unoptimized
        />
      </div>
    );
  }

  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center rounded-lg bg-primary/10 font-semibold text-primary ring-1 ring-primary/15',
        sizeClasses[size],
        className,
      )}
      aria-hidden
    >
      {initial}
    </span>
  );
}

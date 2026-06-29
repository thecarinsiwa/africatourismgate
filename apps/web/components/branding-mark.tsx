'use client';

import type { ResolvedBranding } from '../lib/branding/use-resolved-public-branding';
import { useResolvedPublicBranding } from '../lib/branding/use-resolved-public-branding';

type BrandingLogoProps = {
  branding: ResolvedBranding;
  logoBroken: boolean;
  setLogoBroken: (broken: boolean) => void;
  logoClassName?: string;
};

export function BrandingLogo({
  branding,
  logoBroken,
  setLogoBroken,
  logoClassName = 'h-10 w-10 rounded-lg object-cover',
}: BrandingLogoProps) {
  if (branding.logoUrl && !logoBroken) {
    return (
      <img
        src={branding.logoUrl}
        alt={branding.displayName}
        className={logoClassName}
        onError={() => setLogoBroken(true)}
      />
    );
  }

  return (
    <span className={`flex items-center justify-center rounded-lg bg-primary ${logoClassName}`}>
      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </span>
  );
}

type BrandingMarkProps = {
  showName?: boolean;
  className?: string;
  logoClassName?: string;
  nameClassName?: string;
};

export function BrandingMark({
  showName = false,
  className = 'flex items-center gap-2',
  logoClassName = 'h-10 w-10 rounded-lg object-cover',
  nameClassName = 'text-lg font-bold',
}: BrandingMarkProps) {
  const { branding, logoBroken, setLogoBroken } = useResolvedPublicBranding();

  return (
    <span className={className}>
      <BrandingLogo
        branding={branding}
        logoBroken={logoBroken}
        setLogoBroken={setLogoBroken}
        logoClassName={logoClassName}
      />
      {showName ? <span className={nameClassName}>{branding.displayName}</span> : null}
    </span>
  );
}

'use client';

import { cn } from '@africatourismgate/ui';

function countryCodeToFlag(countryCode: string): string | null {
  const code = countryCode.trim().toUpperCase();
  if (code.length !== 2 || !/^[A-Z]{2}$/.test(code)) return null;
  const offset = 0x1f1e6;
  const first = String.fromCodePoint(offset + code.charCodeAt(0) - 65);
  const second = String.fromCodePoint(offset + code.charCodeAt(1) - 65);
  return first + second;
}

type CountryFlagPlaceholderProps = {
  countryCode: string;
  className?: string;
};

export function CountryFlagPlaceholder({
  countryCode,
  className,
}: CountryFlagPlaceholderProps) {
  const flag = countryCodeToFlag(countryCode);

  return (
    <div
      className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-atg-surface ring-1 ring-atg-border/60',
        className,
      )}
      title={countryCode.toUpperCase()}
      aria-label={`Pays ${countryCode.toUpperCase()}`}
    >
      {flag ? (
        <span className="text-xl leading-none">{flag}</span>
      ) : (
        <span className="font-mono text-xs font-semibold text-atg-muted">
          {countryCode.slice(0, 2).toUpperCase()}
        </span>
      )}
    </div>
  );
}

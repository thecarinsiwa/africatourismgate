'use client';

import { cn } from '@africatourismgate/ui';

type AirlineLogoPlaceholderProps = {
  iataCode: string;
  className?: string;
};

export function AirlineLogoPlaceholder({ iataCode, className }: AirlineLogoPlaceholderProps) {
  return (
    <div
      className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/25 to-atg-surface ring-1 ring-atg-border/60',
        className,
      )}
      aria-hidden
    >
      <span className="font-mono text-xs font-bold uppercase text-primary/80">
        {iataCode.slice(0, 2)}
      </span>
    </div>
  );
}

'use client';

import { cn } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { useId } from 'react';

type Props = {
  variant?: 'compact' | 'full';
  className?: string;
};

function AfricaPattern({ patternId, className }: { patternId: string; className?: string }) {
  return (
    <svg
      className={cn('pointer-events-none absolute inset-0 h-full w-full opacity-[0.12]', className)}
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id={patternId} width="48" height="48" patternUnits="userSpaceOnUse">
          <rect width="48" height="48" fill="transparent" />
          <path d="M0 24h48M24 0v48" stroke="currentColor" strokeWidth="0.75" />
          <rect x="8" y="8" width="8" height="8" fill="currentColor" opacity="0.35" />
          <rect x="32" y="32" width="8" height="8" fill="currentColor" opacity="0.35" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}

function AfricaMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn('pointer-events-none text-white/25', className)}
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
    >
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
    </svg>
  );
}

export function AuthVisualPanel({ variant = 'full', className }: Props) {
  const t = useTranslations('auth.shell');
  const patternId = useId();
  const isCompact = variant === 'compact';

  return (
    <aside
      className={cn(
        'relative overflow-hidden text-white',
        'bg-gradient-to-br from-primary via-[#0d5c44] to-secondary',
        isCompact ? 'h-44 shrink-0' : 'min-h-[16rem] flex-1 lg:min-h-screen',
        className,
      )}
      aria-hidden={isCompact}
    >
      <AfricaPattern patternId={patternId} className="text-white" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />

      <AfricaMark
        className={cn(
          'absolute',
          isCompact ? 'right-6 top-1/2 h-24 w-24 -translate-y-1/2' : 'bottom-10 right-10 h-40 w-40 lg:h-52 lg:w-52',
        )}
      />
      <AfricaMark className="absolute right-32 top-16 hidden h-16 w-16 opacity-60 lg:block" />

      <div
        className={cn(
          'relative flex h-full flex-col justify-end',
          isCompact ? 'px-6 py-6' : 'px-10 py-12 lg:px-14 lg:py-16',
        )}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
          {t('visualEyebrow')}
        </p>
        <h2
          className={cn(
            'mt-2 font-bold leading-tight text-white',
            isCompact ? 'max-w-[14rem] text-lg' : 'max-w-md text-2xl lg:text-3xl',
          )}
        >
          {t('visualTitle')}
        </h2>
        {!isCompact ? (
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/80">{t('visualSubtitle')}</p>
        ) : null}
      </div>
    </aside>
  );
}

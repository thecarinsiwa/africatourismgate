'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { BrandingMark } from './branding-mark';

export type MaintenancePageProps = {
  title: string | null;
  message: string | null;
  endsAt: string | null;
};

type CountdownParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
};

function formatEndsAt(iso: string, locale: string): string | null {
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) {
    return null;
  }
  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(new Date(ms));
  } catch {
    return iso;
  }
}

function getCountdownParts(endsAtMs: number, nowMs: number): CountdownParts {
  const diff = Math.max(0, endsAtMs - nowMs);
  const totalSeconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSeconds / 86_400),
    hours: Math.floor((totalSeconds % 86_400) / 3_600),
    minutes: Math.floor((totalSeconds % 3_600) / 60),
    seconds: totalSeconds % 60,
    done: totalSeconds <= 0,
  };
}

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

function CountdownSkeleton({
  label,
  hoursLabel,
  minutesLabel,
  secondsLabel,
}: {
  label: string;
  hoursLabel: string;
  minutesLabel: string;
  secondsLabel: string;
}) {
  return (
    <div className="mt-10 w-full max-w-lg" aria-hidden>
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-atg-muted">
        {label}
      </p>
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {[hoursLabel, minutesLabel, secondsLabel].map((unitLabel) => (
          <div key={unitLabel} className="flex flex-col items-center">
            <p className="font-mono text-4xl font-bold tabular-nums leading-none tracking-tight text-atg-fg/25 sm:text-5xl">
              --
            </p>
            <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-atg-muted">
              {unitLabel}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MaintenanceCountdown({ endsAt }: { endsAt: string }) {
  const t = useTranslations('maintenance');
  const endsAtMs = Date.parse(endsAt);
  // Start null so SSR and first client paint match (no Date.now() during render).
  const [parts, setParts] = useState<CountdownParts | null>(null);

  useEffect(() => {
    if (Number.isNaN(endsAtMs)) {
      return;
    }

    let cancelled = false;
    let reloadTimer: number | undefined;

    const tick = () => {
      const next = getCountdownParts(endsAtMs, Date.now());
      if (cancelled) return;
      setParts(next);
      if (next.done && reloadTimer === undefined) {
        reloadTimer = window.setTimeout(() => {
          window.location.assign('/');
        }, 1_200);
      }
    };

    tick();
    const id = window.setInterval(tick, 1_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
      if (reloadTimer !== undefined) {
        window.clearTimeout(reloadTimer);
      }
    };
  }, [endsAtMs]);

  if (Number.isNaN(endsAtMs)) {
    return null;
  }

  if (!parts) {
    return (
      <CountdownSkeleton
        label={t('countdownLabel')}
        hoursLabel={t('countdownHours')}
        minutesLabel={t('countdownMinutes')}
        secondsLabel={t('countdownSeconds')}
      />
    );
  }

  if (parts.done) {
    return (
      <p className="mt-10 text-base font-semibold text-primary" role="status">
        {t('countdownDone')}
      </p>
    );
  }

  const units: { key: keyof Omit<CountdownParts, 'done'>; label: string; value: string }[] = [
    { key: 'days', label: t('countdownDays'), value: String(parts.days) },
    { key: 'hours', label: t('countdownHours'), value: pad2(parts.hours) },
    { key: 'minutes', label: t('countdownMinutes'), value: pad2(parts.minutes) },
    { key: 'seconds', label: t('countdownSeconds'), value: pad2(parts.seconds) },
  ];

  const visible = parts.days > 0 ? units : units.filter((u) => u.key !== 'days');

  return (
    <div className="mt-10 w-full max-w-lg" role="timer" aria-live="polite" aria-atomic="true">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-atg-muted">
        {t('countdownLabel')}
      </p>
      <div
        className={`grid gap-3 sm:gap-4 ${parts.days > 0 ? 'grid-cols-4' : 'grid-cols-3'}`}
      >
        {visible.map((unit) => (
          <div key={unit.key} className="flex flex-col items-center">
            <p className="font-mono text-4xl font-bold tabular-nums leading-none tracking-tight text-atg-fg sm:text-5xl">
              {unit.value}
            </p>
            <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-atg-muted">
              {unit.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MaintenancePage({ title, message, endsAt }: MaintenancePageProps) {
  const t = useTranslations('maintenance');
  const locale = useLocale();
  const endsAtFormatted = endsAt ? formatEndsAt(endsAt, locale) : null;
  const showCountdown = Boolean(endsAt && !Number.isNaN(Date.parse(endsAt)));

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-atg-surface text-atg-fg">
      <main className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-6 py-16 text-center sm:px-8 sm:py-20">
        <div className="pointer-events-none select-none">
          <BrandingMark
            showName
            className="flex flex-col items-center gap-5 sm:gap-6"
            logoClassName="h-28 w-28 rounded-2xl object-contain sm:h-36 sm:w-36 sm:rounded-3xl"
            nameClassName="max-w-md text-2xl font-bold tracking-tight text-atg-fg sm:text-3xl"
          />
        </div>

        <p className="mt-10 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
          {t('badge')}
        </p>
        <h1 className="mt-3 max-w-xl text-3xl font-bold tracking-tight text-atg-fg sm:text-4xl md:text-5xl">
          {title?.trim() || t('title')}
        </h1>
        <p className="mt-5 max-w-lg text-base leading-relaxed text-atg-muted sm:text-lg">
          {message?.trim() || t('message')}
        </p>

        {endsAtFormatted ? (
          <p className="mt-4 text-sm font-medium text-atg-fg/75">
            {t('endsAtLabel', { date: endsAtFormatted })}
          </p>
        ) : null}

        {showCountdown && endsAt ? <MaintenanceCountdown endsAt={endsAt} /> : null}
      </main>
    </div>
  );
}

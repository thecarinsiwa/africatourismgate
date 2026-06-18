'use client';

import type { ReactNode } from 'react';
import { useTranslations } from '../../lib/i18n/locale-provider';

/** BK1 — champs formulaire sidebar (M1 : min-h 44px). */
export const bookingSidebarInputClass =
  'min-h-[44px] w-full rounded-lg border border-atg-border bg-atg-elevated px-3 py-2 text-sm text-atg-fg transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-atg-border dark:bg-atg-surface dark:text-atg-fg';

export const bookingSidebarDateGridClass = 'grid gap-3 sm:grid-cols-2 lg:grid-cols-1';

type BookingSidebarDesktopProps = {
  id?: string;
  children: ReactNode;
  className?: string;
};

/** Sticky desktop aside — masqué sous lg. */
export function BookingSidebarDesktop({
  id = 'reserve',
  children,
  className = '',
}: BookingSidebarDesktopProps) {
  return (
    <aside
      id={id}
      className={`hidden rounded-2xl border border-atg-border bg-atg-elevated p-6 shadow-lg dark:border-atg-border dark:bg-atg-elevated lg:block lg:sticky lg:top-24 lg:self-start ${className}`.trim()}
    >
      {children}
    </aside>
  );
}

type BookingSidebarBodyProps = {
  title: string;
  children: ReactNode;
};

/** Structure BK1 : titre + sections empilées. */
export function BookingSidebarBody({ title, children }: BookingSidebarBodyProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-atg-fg">{title}</h2>
      {children}
    </div>
  );
}

type BookingSidebarFieldProps = {
  label: string;
  children: ReactNode;
  className?: string;
};

export function BookingSidebarField({ label, children, className = '' }: BookingSidebarFieldProps) {
  return (
    <label className={`block text-sm ${className}`.trim()}>
      <span className="mb-1 block font-medium text-atg-muted">{label}</span>
      {children}
    </label>
  );
}

type BookingSidebarDateCardProps = {
  label: string;
  value: string;
  detail?: ReactNode;
};

export function BookingSidebarDateCard({ label, value, detail }: BookingSidebarDateCardProps) {
  return (
    <div className="rounded-lg bg-atg-surface px-4 py-3 text-sm dark:bg-atg-surface">
      <p className="text-xs uppercase tracking-wide text-atg-muted">{label}</p>
      <p className="mt-1 font-medium text-atg-fg">{value}</p>
      {detail ? <div className="mt-2 text-xs text-atg-muted">{detail}</div> : null}
    </div>
  );
}

type BookingSidebarPriceBlockProps = {
  label: string;
  amount: string;
  detail?: string;
  sublabel?: string;
};

export function BookingSidebarPriceBlock({
  label,
  amount,
  detail,
  sublabel,
}: BookingSidebarPriceBlockProps) {
  return (
    <div className="rounded-lg bg-atg-surface px-4 py-3 dark:bg-atg-surface">
      {sublabel ? (
        <p className="text-xs uppercase tracking-wide text-atg-muted">{sublabel}</p>
      ) : null}
      <p className="text-xs uppercase tracking-wide text-atg-muted">{label}</p>
      <p className="text-2xl font-bold text-atg-fg">{amount}</p>
      {detail ? <p className="mt-1 text-xs text-atg-muted">{detail}</p> : null}
    </div>
  );
}

type BookingSidebarHintProps = {
  children: ReactNode;
  tone?: 'warning' | 'error' | 'muted';
};

export function BookingSidebarHint({ children, tone = 'muted' }: BookingSidebarHintProps) {
  const toneClass =
    tone === 'warning'
      ? 'text-amber-700 dark:text-amber-300'
      : tone === 'error'
        ? 'text-red-600 dark:text-red-400'
        : 'text-atg-muted';

  return <p className={`text-sm ${toneClass}`}>{children}</p>;
}

type BookingSidebarSummaryProps = {
  children: ReactNode;
};

export function BookingSidebarSummary({ children }: BookingSidebarSummaryProps) {
  return <p className="text-sm text-atg-muted">{children}</p>;
}

type BookingSidebarCtaProps = {
  label: string;
  disabled?: boolean;
  onClick: () => void;
};

export function BookingSidebarCta({ label, disabled = false, onClick }: BookingSidebarCtaProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="w-full min-h-[48px] rounded-lg bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
    >
      {label}
    </button>
  );
}

type BookingSidebarTrustHintsProps = {
  items: string[];
};

export function BookingSidebarTrustHints({ items }: BookingSidebarTrustHintsProps) {
  if (!items.length) return null;

  return (
    <ul className="space-y-2 border-t border-atg-border pt-4 text-xs text-atg-muted dark:border-atg-border">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span className="mt-0.5 shrink-0 text-primary" aria-hidden>
            ✓
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

type BookingSidebarMobileBarProps = {
  priceLabel?: string;
  priceAmount?: string;
  hint?: string;
  secondaryLine?: string;
  ctaLabel: string;
  ctaDisabled?: boolean;
  onCtaClick: () => void;
};

/** M1 — barre basse fixe mobile avec CTA ≥ 48px. */
export function BookingSidebarMobileBar({
  priceLabel,
  priceAmount,
  hint,
  secondaryLine,
  ctaLabel,
  ctaDisabled = false,
  onCtaClick,
}: BookingSidebarMobileBarProps) {
  const hasPrice = Boolean(priceLabel && priceAmount);

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-atg-border bg-atg-elevated/95 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-md dark:border-atg-border dark:bg-atg-elevated/95 lg:hidden pb-safe">
      <div className="mx-auto flex max-w-lg items-center gap-4">
        <div className="min-w-0 flex-1">
          {hasPrice ? (
            <>
              <p className="text-xs text-atg-muted">{priceLabel}</p>
              <p className="text-lg font-bold text-atg-fg">{priceAmount}</p>
              {secondaryLine ? (
                <p className="truncate text-xs text-atg-muted">{secondaryLine}</p>
              ) : null}
            </>
          ) : (
            <p className="text-sm text-atg-muted">{hint}</p>
          )}
        </div>
        <button
          type="button"
          disabled={ctaDisabled}
          onClick={onCtaClick}
          className="min-h-[48px] shrink-0 rounded-lg bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {ctaLabel}
        </button>
      </div>
    </div>
  );
}

export function useBookingSidebarTrustHints(): string[] {
  const { bookingSidebar } = useTranslations();
  return [
    bookingSidebar.trustDemoCatalog,
    bookingSidebar.trustTransparentPricing,
    bookingSidebar.trustSupport,
  ];
}

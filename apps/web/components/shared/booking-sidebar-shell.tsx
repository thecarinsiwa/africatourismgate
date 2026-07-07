'use client';

import type { ReactNode } from 'react';
import { useEffect, useId, useRef } from 'react';
import { useTranslations } from '../../lib/i18n/locale-provider';

export const BOOKING_DRAWER_OPEN_EVENT = 'atg:open-booking-drawer';

/** Scroll vers la sidebar desktop ou la barre mobile (M1 / parcours mobile). */
export function scrollToBookingSidebar(options?: { openDrawer?: boolean }): void {
  if (typeof window === 'undefined') return;

  const isMobile = window.matchMedia('(max-width: 1023px)').matches;
  if (isMobile) {
    document.getElementById('mobile-reserve')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    if (options?.openDrawer) {
      window.dispatchEvent(new CustomEvent(BOOKING_DRAWER_OPEN_EVENT));
    }
    return;
  }

  document.getElementById('reserve')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

export function useBookingDrawerOpenListener(onOpen: () => void): void {
  useEffect(() => {
    const handler = () => onOpen();
    window.addEventListener(BOOKING_DRAWER_OPEN_EVENT, handler);
    return () => window.removeEventListener(BOOKING_DRAWER_OPEN_EVENT, handler);
  }, [onOpen]);
}

type BookingSidebarMobileDrawerProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

/** Drawer bas mobile pour le formulaire de réservation (WEB-UX-19). */
export function BookingSidebarMobileDrawer({
  open,
  onClose,
  title,
  children,
}: BookingSidebarMobileDrawerProps) {
  const { bookingSidebar } = useTranslations();
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    const frame = window.requestAnimationFrame(() => panelRef.current?.focus());

    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-atg-fg/40 backdrop-blur-[2px]"
        aria-label={bookingSidebar.closeDrawer}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="absolute inset-x-0 bottom-0 max-h-[min(85vh,640px)] overflow-y-auto rounded-t-2xl border border-atg-border bg-atg-elevated p-5 pb-safe shadow-2xl outline-none dark:border-atg-border dark:bg-atg-elevated"
      >
        <p id={titleId} className="sr-only">
          {title}
        </p>
        <div className="mb-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-atg-border text-atg-muted transition-colors hover:border-primary hover:text-primary"
            aria-label={bookingSidebar.closeDrawer}
          >
            <span aria-hidden className="text-xl leading-none">
              ×
            </span>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

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

const guestStepperButtonClass =
  'inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-lg border border-atg-border bg-atg-elevated text-lg font-semibold text-atg-fg transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-40 dark:border-atg-border dark:bg-atg-surface';

type BookingGuestStepperProps = {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  decreaseLabel: string;
  increaseLabel: string;
};

/** Compteur voyageurs +/- (sans spinner natif type=number). */
export function BookingGuestStepper({
  value,
  min = 1,
  max = 20,
  onChange,
  decreaseLabel,
  increaseLabel,
}: BookingGuestStepperProps) {
  return (
    <div
      className="flex items-center gap-2 rounded-lg border border-atg-border bg-atg-elevated px-2 dark:border-atg-border dark:bg-atg-surface"
      role="group"
    >
      <button
        type="button"
        aria-label={decreaseLabel}
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className={guestStepperButtonClass}
      >
        −
      </button>
      <span
        className="min-w-[2ch] flex-1 text-center text-base font-semibold tabular-nums text-atg-fg"
        aria-live="polite"
        aria-atomic="true"
      >
        {value}
      </span>
      <button
        type="button"
        aria-label={increaseLabel}
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className={guestStepperButtonClass}
      >
        +
      </button>
    </div>
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
  configureLabel?: string;
  onConfigureClick?: () => void;
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
  configureLabel,
  onConfigureClick,
}: BookingSidebarMobileBarProps) {
  const hasPrice = Boolean(priceLabel && priceAmount);

  return (
    <div
      id="mobile-reserve"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-atg-border bg-atg-elevated p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.12)] dark:border-atg-border dark:bg-[#121f1a] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.45)] lg:hidden pb-safe"
    >
      <div className="mx-auto flex max-w-lg min-w-0 items-center gap-3">
        <div className="min-w-0 flex-1">
          {hasPrice ? (
            <>
              <p className="text-xs font-medium uppercase tracking-wide text-atg-muted dark:text-white/75">
                {priceLabel}
              </p>
              <p className="truncate text-lg font-bold text-atg-fg dark:text-white">{priceAmount}</p>
              {secondaryLine ? (
                <p className="truncate text-xs text-atg-muted dark:text-white/65">{secondaryLine}</p>
              ) : null}
            </>
          ) : (
            <p className="text-sm text-atg-muted dark:text-white/75">{hint}</p>
          )}
        </div>
        {configureLabel && onConfigureClick ? (
          <button
            type="button"
            onClick={onConfigureClick}
            className="inline-flex min-h-[44px] shrink-0 items-center rounded-lg border border-atg-border px-4 py-2 text-sm font-semibold text-atg-fg transition-colors hover:border-primary dark:border-white/25 dark:text-white dark:hover:border-primary"
          >
            {configureLabel}
          </button>
        ) : null}
        <button
          type="button"
          disabled={ctaDisabled}
          onClick={onCtaClick}
          className="min-h-[48px] shrink-0 rounded-lg bg-primary px-5 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50 sm:px-6"
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

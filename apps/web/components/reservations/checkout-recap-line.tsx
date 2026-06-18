'use client';

import type { ReactNode } from 'react';

export type CheckoutVerticalIcon = 'hotel' | 'flight' | 'car' | 'cruise' | 'activity' | 'package';

type CheckoutRecapLineProps = {
  icon: CheckoutVerticalIcon;
  eyebrow?: string;
  title: string;
  details: ReactNode;
  price?: string;
  className?: string;
};

function CheckoutVerticalIconGlyph({ icon }: { icon: CheckoutVerticalIcon }) {
  const className = 'h-5 w-5 shrink-0 text-primary';

  switch (icon) {
    case 'hotel':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M3 10.5 12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5Z"
          />
        </svg>
      );
    case 'flight':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M21 7.5 16.5 3 14.09 5.41 15.5 6.82 3 19.32l1.68 1.68L17.18 8.5l1.41 1.41L21 7.5Z" />
        </svg>
      );
    case 'car':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M5 17h14M6 17a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm12 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM4 12h16l-1.5-5h-13L4 12Z"
          />
        </svg>
      );
    case 'cruise':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M4 18c2 1 4 1 8 1s6 0 8-1M6 14h12l-1-6H7l-1 6ZM12 8V4"
          />
        </svg>
      );
    case 'activity':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M12 3v18M8 7l4-4 4 4M8 17l4 4 4-4"
          />
        </svg>
      );
    case 'package':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8Z"
          />
        </svg>
      );
    default:
      return null;
  }
}

/** BK3 — ligne récap avec icône vertical. */
export function CheckoutRecapLine({
  icon,
  eyebrow,
  title,
  details,
  price,
  className = '',
}: CheckoutRecapLineProps) {
  return (
    <article
      className={`flex gap-3 rounded-xl border border-atg-border bg-atg-surface/50 p-4 dark:border-atg-border dark:bg-atg-surface/40 ${className}`.trim()}
    >
      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <CheckoutVerticalIconGlyph icon={icon} />
      </div>
      <div className="min-w-0 flex-1">
        {eyebrow ? <p className="text-xs font-semibold uppercase tracking-wide text-primary">{eyebrow}</p> : null}
        <h2 className="text-lg font-bold text-atg-fg">{title}</h2>
        <div className="mt-1 space-y-1 text-sm text-atg-muted">{details}</div>
        {price ? (
          <p className="mt-3 text-xl font-bold text-atg-fg">{price}</p>
        ) : null}
      </div>
    </article>
  );
}

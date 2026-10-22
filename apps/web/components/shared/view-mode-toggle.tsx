'use client';

import { cn } from '@africatourismgate/ui';
import type { ReactNode } from 'react';

export type ViewModeOption<T extends string> = {
  value: T;
  /** Accessible name and tooltip, e.g. "Switch to grid view". */
  label: string;
  icon: ReactNode;
  /** Extra classes, e.g. `hidden md:inline-flex` to hide an option on mobile. */
  className?: string;
};

export type ViewModeToggleProps<T extends string> = {
  value: T;
  options: ViewModeOption<T>[];
  onChange: (value: T) => void;
  ariaLabel: string;
};

/** Segmented icon toggle (toggle buttons with aria-pressed). */
export function ViewModeToggle<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
}: ViewModeToggleProps<T>) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="inline-flex items-center rounded-lg border border-atg-border bg-atg-elevated p-1 dark:border-atg-border dark:bg-atg-surface"
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            aria-label={option.label}
            title={option.label}
            onClick={() => onChange(option.value)}
            className={cn(
              'inline-flex min-h-[36px] min-w-[36px] items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-atg-surface',
              active
                ? 'bg-primary text-white shadow-sm'
                : 'text-atg-muted hover:bg-primary/10 hover:text-atg-fg',
              option.className,
            )}
          >
            {option.icon}
          </button>
        );
      })}
    </div>
  );
}

const iconProps = {
  className: 'h-5 w-5',
  fill: 'none',
  viewBox: '0 0 24 24',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const;

export function GridViewIcon() {
  return (
    <svg {...iconProps}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

export function ListViewIcon() {
  return (
    <svg {...iconProps}>
      <rect x="3" y="4" width="5" height="5" rx="1" />
      <rect x="3" y="15" width="5" height="5" rx="1" />
      <path d="M11 6h10M11 9h6M11 17h10M11 20h6" />
    </svg>
  );
}

export function TableViewIcon() {
  return (
    <svg {...iconProps}>
      <rect x="3" y="4" width="18" height="16" rx="1.5" />
      <path d="M3 9.5h18M3 15h18M9 4v16" />
    </svg>
  );
}

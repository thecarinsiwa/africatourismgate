'use client';

import { Button, cn } from '@africatourismgate/ui';

export type ListViewModeOption<T extends string> = {
  value: T;
  label: string;
};

type ListViewModeToggleProps<T extends string> = {
  value: T;
  options: ListViewModeOption<T>[];
  onChange: (value: T) => void;
  ariaLabel: string;
  className?: string;
};

export function ListViewModeToggle<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  className,
}: ListViewModeToggleProps<T>) {
  return (
    <div
      className={cn(
        'inline-flex max-w-full flex-wrap gap-1 rounded-lg border border-atg-border bg-atg-surface p-1',
        className,
      )}
      role="group"
      aria-label={ariaLabel}
    >
      {options.map((option) => (
        <Button
          key={option.value}
          type="button"
          size="sm"
          variant={value === option.value ? 'primary' : 'ghost'}
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
          className="min-w-0 flex-1 sm:flex-none"
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}

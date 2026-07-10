'use client';

import { Button } from '@africatourismgate/ui';

export type ListViewModeOption<T extends string> = {
  value: T;
  label: string;
};

type ListViewModeToggleProps<T extends string> = {
  value: T;
  options: ListViewModeOption<T>[];
  onChange: (value: T) => void;
  ariaLabel: string;
};

export function ListViewModeToggle<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
}: ListViewModeToggleProps<T>) {
  return (
    <div
      className="inline-flex flex-wrap gap-1 rounded-lg border border-atg-border bg-atg-surface p-1"
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
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}

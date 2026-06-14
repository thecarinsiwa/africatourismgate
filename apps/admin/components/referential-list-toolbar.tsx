'use client';

import { Input } from '@africatourismgate/ui';
import type { ReactNode } from 'react';

type ReferentialListToolbarProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  placeholder: string;
  ariaLabel: string;
  action?: ReactNode;
};

export function ReferentialListToolbar({
  searchValue,
  onSearchChange,
  placeholder,
  ariaLabel,
  action,
}: ReferentialListToolbarProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex-1 sm:max-w-md">
        <Input
          type="search"
          placeholder={placeholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label={ariaLabel}
        />
      </div>
      {action}
    </div>
  );
}

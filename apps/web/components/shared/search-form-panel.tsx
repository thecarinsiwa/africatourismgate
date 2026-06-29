'use client';

import type { FormEvent, ReactNode } from 'react';
import { cn } from '@africatourismgate/ui';

/** Conteneur formulaire recherche sur page liste (sans onglets). */
export type SearchFormPanelProps = {
  id?: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
  className?: string;
};

export function SearchFormPanel({ id, onSubmit, children, className }: SearchFormPanelProps) {
  return (
    <form
      id={id}
      onSubmit={onSubmit}
      className={cn(
        'mt-8 rounded-xl border border-white/10 bg-white p-5 shadow-xl dark:border-atg-border dark:bg-atg-elevated sm:p-6',
        className,
      )}
    >
      {children}
    </form>
  );
}

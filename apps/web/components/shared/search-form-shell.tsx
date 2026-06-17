'use client';

import type { FormEvent, ReactNode } from 'react';
import { cn } from '@africatourismgate/ui';

/** Onglet du formulaire de recherche marketing. */
export type SearchFormTab = {
  id: string;
  label: string;
  icon?: ReactNode;
};

/** Conteneur homepage : barre d'onglets verticaux + zone formulaire. */
export type SearchFormShellProps = {
  id?: string;
  tabs: SearchFormTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  tablistAriaLabel: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
  className?: string;
};

export function SearchFormShell({
  id = 'search',
  tabs,
  activeTab,
  onTabChange,
  tablistAriaLabel,
  onSubmit,
  children,
  className,
}: SearchFormShellProps) {
  return (
    <section id={id} className={cn('relative -mt-12 z-20', className)}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl transition-colors dark:border-atg-border dark:bg-atg-elevated">
          <div
            className="flex overflow-x-auto border-b border-gray-100 dark:border-atg-border"
            role="tablist"
            aria-label={tablistAriaLabel}
          >
            {tabs.map((tab) => {
              const selected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    'flex min-w-[4.5rem] flex-1 flex-col items-center justify-center gap-1.5 border-b-[3px] px-2 py-3.5 transition-all sm:min-w-0 sm:flex-row sm:gap-2 sm:py-4',
                    selected
                      ? 'border-primary bg-primary text-white'
                      : 'border-transparent bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:bg-atg-surface dark:text-atg-muted dark:hover:bg-white/5 dark:hover:text-white',
                  )}
                >
                  {tab.icon}
                  <span className="text-[10px] font-semibold uppercase leading-tight tracking-wide sm:text-xs">
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>

          <form onSubmit={onSubmit} className="p-5 sm:p-6">
            {children}
          </form>
        </div>
      </div>
    </section>
  );
}

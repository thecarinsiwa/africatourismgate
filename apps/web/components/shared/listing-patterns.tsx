'use client';

import { EmptyState, FilterBar, DataTablePagination } from '@africatourismgate/ui';
import type { DataTablePaginationLabels } from '@africatourismgate/ui';
import { cn } from '@africatourismgate/ui';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { LISTING_PAGE_SIZE } from '../../lib/listing/pagination';
import { ListingCardsSkeleton } from './loading-skeletons';

const sortSelectClass =
  'min-h-[44px] rounded-lg border border-atg-border bg-atg-elevated px-3 py-2 text-sm font-medium text-atg-fg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60 dark:border-atg-border dark:bg-atg-surface dark:text-white';

export type ListingSortOption = {
  value: string;
  label: string;
};

export type ListingSortBarProps = {
  resultsLine: ReactNode;
  countLine: ReactNode;
  sortLabel: string;
  sortValue: string;
  sortOptions: ListingSortOption[];
  onSortChange: (value: string) => void;
  disabled?: boolean;
};

/** Barre sticky : compteur résultats + tri (pattern hôtels). */
export function ListingSortBar({
  resultsLine,
  countLine,
  sortLabel,
  sortValue,
  sortOptions,
  onSortChange,
  disabled,
}: ListingSortBarProps) {
  return (
    <div className="sticky top-0 z-30 border-b border-atg-border bg-atg-elevated/95 shadow-sm backdrop-blur-md dark:border-atg-border dark:bg-atg-elevated/95">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div>
          <p className="text-sm text-atg-muted">{resultsLine}</p>
          <p className="text-lg font-bold text-atg-fg">{countLine}</p>
        </div>
        <label className="flex items-center gap-2">
          <span className="text-sm font-medium text-atg-muted">{sortLabel}</span>
          <select
            value={sortValue}
            onChange={(event) => onSortChange(event.target.value)}
            disabled={disabled}
            className={sortSelectClass}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}

export type ListingResultsGridProps = {
  children: ReactNode;
  /** `list` : cartes horizontales pleine largeur ; `grid` : 1/2/3 colonnes. */
  variant?: 'list' | 'grid';
  className?: string;
};

/** Grille résultats unifiée (L3). */
export function ListingResultsGrid({
  children,
  variant = 'list',
  className,
}: ListingResultsGridProps) {
  return (
    <div
      className={cn(
        variant === 'grid'
          ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3'
          : 'grid grid-cols-1 gap-6',
        className,
      )}
    >
      {children}
    </div>
  );
}

export type ListingLoadingStateProps = {
  message: string;
};

export function ListingLoadingState({ message }: ListingLoadingStateProps) {
  return (
    <div className="rounded-2xl border border-atg-border bg-atg-elevated px-6 py-16 text-center dark:border-atg-border dark:bg-atg-elevated">
      <p className="text-sm font-medium text-atg-muted">{message}</p>
    </div>
  );
}

export type ListingErrorBannerProps = {
  message: string;
  retryLabel: string;
  onRetry: () => void;
};

export function ListingErrorBanner({ message, retryLabel, onRetry }: ListingErrorBannerProps) {
  return (
    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
      <p>{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-3 min-h-[44px] rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-hover"
      >
        {retryLabel}
      </button>
    </div>
  );
}

export type ListingEmptyStateProps = {
  title: string;
  description: string;
  icon?: ReactNode;
  backHomeLabel: string;
  backHomeHref?: string;
  modifySearchLabel?: string;
  modifySearchHref?: string;
};

export function ListingEmptyState({
  title,
  description,
  icon,
  backHomeLabel,
  backHomeHref = '/',
  modifySearchLabel,
  modifySearchHref,
}: ListingEmptyStateProps) {
  return (
    <EmptyState
      title={title}
      description={description}
      icon={icon ?? <ListingDefaultEmptyIcon />}
      action={
        <div className="flex flex-wrap items-center justify-center gap-3">
          {modifySearchLabel && modifySearchHref ? (
            <a
              href={modifySearchHref}
              className="inline-flex min-h-[44px] items-center rounded-lg border border-atg-border px-6 py-2 text-sm font-semibold text-atg-fg transition-colors hover:border-primary dark:border-atg-border dark:text-white"
            >
              {modifySearchLabel}
            </a>
          ) : null}
          <Link
            href={backHomeHref}
            className="inline-flex min-h-[44px] items-center rounded-lg bg-primary px-6 py-2 text-sm font-bold text-white hover:bg-primary-hover"
          >
            {backHomeLabel}
          </Link>
        </div>
      }
      className="rounded-2xl border-atg-border bg-atg-elevated dark:bg-atg-elevated"
    />
  );
}

export function ListingDefaultEmptyIcon() {
  return (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

export type ListingFiltersAsideProps = {
  title: string;
  children: ReactNode;
  /** Filtres mobiles via FilterBar (L4). */
  mobileToggleLabel: string;
  clearFiltersLabel: string;
  applyFiltersLabel: string;
  activeFilterCount?: number;
  onClearFilters?: () => void;
};

/** Panneau filtres : drawer mobile + sidebar desktop (L4). */
export function ListingFiltersAside({
  title,
  children,
  mobileToggleLabel,
  clearFiltersLabel,
  applyFiltersLabel,
  activeFilterCount = 0,
  onClearFilters,
}: ListingFiltersAsideProps) {
  const panel = (
    <div className="space-y-5">
      <h2 className="text-sm font-bold uppercase tracking-wide text-atg-fg">{title}</h2>
      {children}
    </div>
  );

  return (
    <>
      <div className="lg:hidden">
        <FilterBar
          mobileVariant="drawer"
          toggleLabel={mobileToggleLabel}
          clearLabel={clearFiltersLabel}
          applyLabel={applyFiltersLabel}
          activeCount={activeFilterCount}
          onClear={onClearFilters}
          filters={panel}
        />
      </div>
      <aside className="hidden lg:block lg:w-full lg:max-w-64 lg:shrink-0">
        <div className="rounded-2xl border border-atg-border bg-atg-elevated p-5 shadow-sm dark:border-atg-border dark:bg-atg-elevated">
          {panel}
        </div>
      </aside>
    </>
  );
}

export type ListingPageBodyProps = {
  notice?: ReactNode;
  error?: ListingErrorBannerProps | null;
  loading?: boolean;
  loadingMessage?: string;
  loadingSkeletonCount?: number;
  isEmpty?: boolean;
  empty?: ListingEmptyStateProps;
  filters?: ReactNode;
  children: ReactNode;
  resultsVariant?: 'list' | 'grid';
  pagination?: ReactNode;
};

export type ListingPaginationBarProps = {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize?: number;
  itemLabel: string;
  onPageChange: (page: number) => void;
  labels: DataTablePaginationLabels;
};

/** Pagination 10 par 10 sous la grille de résultats. */
export function ListingPaginationBar({
  page,
  totalPages,
  totalItems,
  pageSize = LISTING_PAGE_SIZE,
  itemLabel,
  onPageChange,
  labels,
}: ListingPaginationBarProps) {
  if (totalItems <= pageSize) {
    return null;
  }

  return (
    <DataTablePagination
      page={page}
      totalPages={totalPages}
      totalItems={totalItems}
      pageSize={pageSize}
      itemLabel={itemLabel}
      onPageChange={onPageChange}
      labels={labels}
      className="mt-8"
    />
  );
}

/** Corps de page liste : notice, erreur, filtres, états et grille (pattern hôtels). */
export function ListingPageBody({
  notice,
  error,
  loading,
  loadingMessage,
  loadingSkeletonCount = 6,
  isEmpty,
  empty,
  filters,
  children,
  resultsVariant = 'list',
  pagination,
}: ListingPageBodyProps) {
  return (
    <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      {notice}
      {error ? <ListingErrorBanner {...error} /> : null}

      <div className={cn('flex flex-col gap-8', filters ? 'lg:flex-row' : undefined)}>
        {filters}

        <div className="min-w-0 flex-1">
          {loading ? (
            <ListingCardsSkeleton
              count={loadingSkeletonCount}
              variant={resultsVariant}
              loadingLabel={loadingMessage ?? 'Loading results'}
            />
          ) : isEmpty && empty ? (
            <ListingEmptyState {...empty} />
          ) : (
            <>
              <ListingResultsGrid variant={resultsVariant}>{children}</ListingResultsGrid>
              {pagination}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

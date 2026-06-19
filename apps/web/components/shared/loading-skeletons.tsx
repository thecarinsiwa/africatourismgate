'use client';

import { Skeleton, cn } from '@africatourismgate/ui';
import type { ReactNode } from 'react';
import { HomeFooter } from '../home/home-footer';
import { HomeHeader } from '../home/home-header';

/** LD1 — skeleton carte produit (même gabarit que `ProductCard`). */
export function ProductCardSkeleton() {
  return (
    <article
      aria-hidden
      className="flex flex-col overflow-hidden rounded-2xl border border-atg-border bg-atg-elevated shadow-md sm:flex-row dark:border-atg-border dark:bg-atg-elevated"
    >
      <Skeleton className="h-56 shrink-0 rounded-none sm:h-[220px] sm:w-72 lg:w-80" />
      <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
        <div className="space-y-2">
          <Skeleton className="h-6 w-4/5 max-w-sm" />
          <Skeleton className="h-4 w-3/5 max-w-xs" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="mt-auto flex flex-wrap items-end justify-between gap-4 border-t border-atg-border pt-4 dark:border-atg-border">
          <div className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-8 w-28" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-11 w-28 rounded-lg" />
            <Skeleton className="h-11 w-28 rounded-lg" />
          </div>
        </div>
      </div>
    </article>
  );
}

export type ListingCardsSkeletonProps = {
  count?: number;
  variant?: 'list' | 'grid';
  /** Message lu par les lecteurs d'écran pendant le chargement. */
  loadingLabel?: string;
};

/** LD1 — grille de cartes listing. */
export function ListingCardsSkeleton({
  count = 6,
  variant = 'list',
  loadingLabel = 'Loading results',
}: ListingCardsSkeletonProps) {
  return (
    <>
      <p className="sr-only" aria-live="polite">
        {loadingLabel}
      </p>
      <div
        className={cn(
          variant === 'grid'
            ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3'
            : 'grid grid-cols-1 gap-6',
        )}
      >
        {Array.from({ length: count }, (_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    </>
  );
}

function DetailGallerySkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-[16/10] w-full rounded-2xl sm:aspect-[21/9]" />
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-[4.5rem] w-[5.5rem] shrink-0 rounded-lg sm:h-20 sm:w-28" />
        ))}
      </div>
    </div>
  );
}

function DetailHeaderSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-9 w-full max-w-xl" />
      <Skeleton className="h-4 w-full max-w-md" />
      <Skeleton className="h-5 w-40" />
    </div>
  );
}

function DetailSectionSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-3">
      <Skeleton className="h-6 w-48" />
      <div className="space-y-2">
        {Array.from({ length: lines }, (_, index) => (
          <Skeleton key={index} className={`h-4 ${index === lines - 1 ? 'w-4/5' : 'w-full'}`} />
        ))}
      </div>
    </div>
  );
}

function BookingSidebarSkeleton() {
  return (
    <aside
      aria-hidden
      className="hidden rounded-2xl border border-atg-border bg-atg-elevated p-6 shadow-lg dark:border-atg-border dark:bg-atg-elevated lg:block lg:sticky lg:top-24 lg:self-start"
    >
      <Skeleton className="mb-4 h-6 w-40" />
      <div className="space-y-4">
        <Skeleton className="h-11 w-full rounded-lg" />
        <Skeleton className="h-11 w-full rounded-lg" />
        <Skeleton className="h-11 w-full rounded-lg" />
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </aside>
  );
}

export type DetailPageSkeletonProps = {
  loadingLabel?: string;
  /** `package` : sidebar plus étroit (fiche package). */
  layout?: 'standard' | 'package';
};

function DetailMainColumnSkeleton() {
  return (
    <div className="min-w-0 space-y-8">
      <DetailGallerySkeleton />
      <DetailHeaderSkeleton />
      <DetailSectionSkeleton lines={4} />
      <DetailSectionSkeleton lines={3} />
      <DetailSectionSkeleton lines={2} />
    </div>
  );
}

/** LD1 — corps skeleton fiche détail (galerie + sections + sidebar). */
export function DetailPageSkeleton({
  loadingLabel = 'Loading details',
  layout = 'standard',
}: DetailPageSkeletonProps) {
  return (
    <>
      <p className="sr-only" aria-live="polite">
        {loadingLabel}
      </p>
      {layout === 'package' ? (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <DetailMainColumnSkeleton />
          <BookingSidebarSkeleton />
        </div>
      ) : (
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-2">
            <DetailMainColumnSkeleton />
          </div>
          <BookingSidebarSkeleton />
        </div>
      )}
    </>
  );
}

export type DetailPageSkeletonShellProps = DetailPageSkeletonProps & {
  breadcrumb?: ReactNode;
};

/** LD1 — page détail complète avec header/footer et fil d'Ariane skeleton. */
export function DetailPageSkeletonShell({
  loadingLabel,
  layout = 'standard',
  breadcrumb,
}: DetailPageSkeletonShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-atg-surface dark:bg-atg-surface">
      <HomeHeader />

      <div className="border-b border-atg-border bg-atg-elevated dark:border-atg-border dark:bg-atg-elevated">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          {breadcrumb ?? (
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-3" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-3" />
              <Skeleton className="h-4 w-40" />
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 pb-28 sm:px-6 lg:px-8 lg:pb-8">
        <DetailPageSkeleton loadingLabel={loadingLabel} layout={layout} />
      </div>

      <HomeFooter />
    </div>
  );
}

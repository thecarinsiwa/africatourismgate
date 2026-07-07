'use client';

import { Skeleton } from '@africatourismgate/ui';

export function BlogFeaturedSkeleton() {
  return (
    <div
      aria-hidden
      className="overflow-hidden rounded-2xl border border-atg-border bg-atg-elevated shadow-xl dark:border-atg-border"
    >
      <div className="grid lg:grid-cols-2">
        <Skeleton className="min-h-[280px] rounded-none lg:min-h-[420px]" />
        <div className="space-y-4 p-8 lg:p-12">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-6 w-32 rounded-full" />
          <Skeleton className="h-10 w-full max-w-md" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-11 w-36 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function BlogCardSkeleton() {
  return (
    <article
      aria-hidden
      className="overflow-hidden rounded-2xl border border-atg-border bg-atg-elevated shadow-md dark:border-atg-border"
    >
      <Skeleton className="h-56 rounded-none sm:h-60" />
      <div className="space-y-3 p-5 sm:p-6">
        <Skeleton className="h-0.5 w-10" />
        <Skeleton className="h-6 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-10/12" />
        <Skeleton className="h-4 w-24" />
      </div>
    </article>
  );
}

export function BlogGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i}>
          <BlogCardSkeleton />
        </li>
      ))}
    </ul>
  );
}

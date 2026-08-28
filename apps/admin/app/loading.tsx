import { Skeleton, Spinner } from '@africatourismgate/ui';

export default function Loading() {
  return (
    <main
      className="flex min-h-[50vh] w-full flex-col justify-center space-y-6 p-6 md:p-8"
      aria-busy="true"
      aria-label="Chargement du contenu"
    >
      {/* Header skeleton avec spinner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Spinner size="sm" variant="primary" />
            <Skeleton className="h-7 w-48 rounded-lg" />
          </div>
          <Skeleton className="h-4 w-72 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
      </div>

      {/* KPI / Stat Cards skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-atg-border/60 bg-atg-elevated p-4 shadow-sm"
          >
            <div className="flex items-center justify-between pb-2">
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton className="my-2 h-7 w-28 rounded-md" />
            <Skeleton className="h-3 w-36 rounded" />
          </div>
        ))}
      </div>

      {/* Table / Content placeholder */}
      <div className="rounded-xl border border-atg-border/60 bg-atg-elevated p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-5 w-36 rounded" />
          <Skeleton className="h-9 w-48 rounded-lg" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      </div>
    </main>
  );
}

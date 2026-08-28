import { Skeleton, Spinner } from '@africatourismgate/ui';

/** Fallback Next.js route — feedback immédiat avec spinner et squelette (LD1). */
export default function Loading() {
  return (
    <main
      className="min-h-screen bg-atg-surface px-4 py-8 dark:bg-atg-surface sm:px-6 lg:px-8"
      aria-busy="true"
      aria-label="Chargement du contenu"
    >
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex items-center gap-3">
          <Spinner size="md" variant="primary" />
          <Skeleton className="h-8 w-64 max-w-full" />
        </div>
        <Skeleton className="aspect-[16/10] w-full rounded-2xl sm:aspect-[21/9]" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-48 rounded-2xl" />
          ))}
        </div>
      </div>
    </main>
  );
}

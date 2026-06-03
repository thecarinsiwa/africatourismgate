export function SaleCatalogSkeleton() {
  return (
    <ul className="grid gap-3 sm:grid-cols-2" aria-hidden>
      {Array.from({ length: 6 }, (_, i) => (
        <li
          key={i}
          className="animate-pulse rounded-xl border border-atg-border bg-atg-surface/40 p-4"
        >
          <div className="flex gap-3">
            <div className="h-11 w-11 shrink-0 rounded-xl bg-atg-border/80" />
            <div className="flex-1 space-y-2.5 pt-0.5">
              <div className="h-4 w-2/3 rounded-md bg-atg-border/80" />
              <div className="h-3 w-full rounded-md bg-atg-border/50" />
              <div className="h-3 w-4/5 rounded-md bg-atg-border/50" />
            </div>
          </div>
          <div className="mt-4 flex justify-between border-t border-atg-border/50 pt-3">
            <div className="h-3 w-20 rounded-md bg-atg-border/50" />
            <div className="h-4 w-16 rounded-md bg-atg-border/80" />
          </div>
        </li>
      ))}
    </ul>
  );
}

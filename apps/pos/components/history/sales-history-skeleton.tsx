export function SalesHistorySkeleton() {
  return (
    <ul className="space-y-3" aria-hidden>
      {Array.from({ length: 5 }, (_, i) => (
        <li
          key={i}
          className="animate-pulse rounded-xl border border-atg-border bg-atg-surface/40 p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="h-4 w-24 rounded-md bg-atg-border/80" />
            <div className="h-5 w-20 rounded-full bg-atg-border/60" />
          </div>
          <div className="mt-3 space-y-2">
            <div className="h-4 w-3/4 rounded-md bg-atg-border/70" />
            <div className="h-3 w-1/2 rounded-md bg-atg-border/50" />
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-atg-border/50 pt-3">
            <div className="h-3 w-28 rounded-md bg-atg-border/50" />
            <div className="h-5 w-20 rounded-md bg-atg-border/80" />
          </div>
        </li>
      ))}
    </ul>
  );
}

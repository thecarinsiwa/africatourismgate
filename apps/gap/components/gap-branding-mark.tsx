type GapBrandingMarkProps = {
  showName?: boolean;
  nameClassName?: string;
};

export function GapBrandingMark({
  showName = true,
  nameClassName = 'text-lg font-bold text-atg-fg',
}: GapBrandingMarkProps) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary">
        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 3c-4.5 2.5-7.5 6.5-7.5 11a7.5 7.5 0 1015 0c0-4.5-3-8.5-7.5-11z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9.5 14.5c1.2-1.5 3.8-1.5 5 0"
          />
        </svg>
      </span>
      {showName ? (
        <span className="flex min-w-0 flex-col leading-tight">
          <span className={nameClassName}>GAP</span>
          <span className="truncate text-xs font-medium text-atg-muted">Gorilla Ambassadors</span>
        </span>
      ) : null}
    </span>
  );
}

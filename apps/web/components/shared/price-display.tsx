import { cn } from '@africatourismgate/ui';

/** Affichage prix listing — libellés et montants fournis par le parent (i18n + formatage). */
export type PriceDisplayProps = {
  /** Petit libellé au-dessus du montant (ex. « par nuit »). */
  prefixLabel?: string;
  /** Montant déjà formaté (ex. via formatHotelPrice). */
  amount: string;
  /** Suffixe inline après le montant. */
  suffixLabel?: string;
  /** Prix barré optionnel (promo). */
  compareAt?: string;
  /** Badge promotionnel optionnel (texte fourni par le parent). */
  badge?: string;
  size?: 'sm' | 'md';
  className?: string;
};

const amountSizeClass = {
  sm: 'text-xl font-bold',
  md: 'text-2xl font-bold',
} as const;

export function PriceDisplay({
  prefixLabel,
  amount,
  suffixLabel,
  compareAt,
  badge,
  size = 'md',
  className,
}: PriceDisplayProps) {
  return (
    <div className={className}>
      {prefixLabel ? (
        <p className="text-xs uppercase tracking-wide text-atg-muted">
          {prefixLabel}
        </p>
      ) : null}
      <div className={cn('flex flex-wrap items-baseline gap-2', prefixLabel && 'mt-0')}>
        {compareAt ? (
          <p
            className={cn(
              'text-sm text-atg-muted line-through',
              size === 'md' && 'text-base',
            )}
          >
            {compareAt}
          </p>
        ) : null}
        <p className={cn(amountSizeClass[size], 'text-atg-fg')}>
          {amount}
          {suffixLabel ? (
            <span className="text-sm font-normal text-atg-muted">
              {' '}
              {suffixLabel}
            </span>
          ) : null}
        </p>
        {badge ? (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">
            {badge}
          </span>
        ) : null}
      </div>
    </div>
  );
}

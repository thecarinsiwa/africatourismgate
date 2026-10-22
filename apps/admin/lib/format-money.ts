import {
  FALLBACK_TREASURY_CURRENCY,
  normalizeCurrencyCode,
} from './treasury/currency-options';

const countFormatter = new Intl.NumberFormat('fr-FR');

export function formatCount(value: number): string {
  return countFormatter.format(value);
}

/**
 * Formats cents in `currency`; when the record has no valid currency, uses
 * `fallbackCurrency` (Admin default — see `useFormatMoney`), then {@link FALLBACK_TREASURY_CURRENCY}.
 */
export function formatMoney(
  totalCents: number | null | undefined,
  currency?: string | null,
  fallbackCurrency?: string | null,
): string {
  const cents = typeof totalCents === 'number' && Number.isFinite(totalCents) ? totalCents : 0;
  const code =
    normalizeCurrencyCode(currency) ??
    normalizeCurrencyCode(fallbackCurrency) ??
    FALLBACK_TREASURY_CURRENCY;
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

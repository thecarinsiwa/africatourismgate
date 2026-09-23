const countFormatter = new Intl.NumberFormat('fr-FR');
const DEFAULT_CURRENCY = 'USD';

export function formatCount(value: number): string {
  return countFormatter.format(value);
}

export function formatMoney(
  totalCents: number | null | undefined,
  currency?: string | null,
): string {
  const cents = typeof totalCents === 'number' && Number.isFinite(totalCents) ? totalCents : 0;
  const code =
    typeof currency === 'string' && /^[A-Za-z]{3}$/.test(currency.trim())
      ? currency.trim().toUpperCase()
      : DEFAULT_CURRENCY;
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

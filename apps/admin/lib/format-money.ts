const countFormatter = new Intl.NumberFormat('fr-FR');

export function formatCount(value: number): string {
  return countFormatter.format(value);
}

export function formatMoney(totalCents: number, currency: string): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(totalCents / 100);
}

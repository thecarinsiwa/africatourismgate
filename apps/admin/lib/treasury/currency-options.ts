/** Shared ISO currency list for Treasury Admin forms & filters. */
export const TREASURY_CURRENCY_OPTIONS = [
  'XOF',
  'XAF',
  'EUR',
  'USD',
  'MAD',
  'GHS',
  'NGN',
] as const;

export type TreasuryCurrencyCode = (typeof TREASURY_CURRENCY_OPTIONS)[number];

/** Fallback when org currency is missing or invalid. */
export const FALLBACK_TREASURY_CURRENCY: TreasuryCurrencyCode = 'XOF';

export function normalizeCurrencyCode(
  value: string | null | undefined,
): string | null {
  const code = value?.trim().toUpperCase();
  if (!code || !/^[A-Z]{3}$/.test(code)) return null;
  return code;
}

export function treasuryCurrencySelectOptions(options?: {
  includeEmpty?: boolean;
  emptyLabel?: string;
  /** Codes not in the shared list (e.g. org currency) still appear in the select. */
  extraCodes?: Array<string | null | undefined>;
}): Array<{ value: string; label: string }> {
  const seen = new Set<string>();
  const items: Array<{ value: string; label: string }> = [];

  const push = (raw: string | null | undefined) => {
    const code = normalizeCurrencyCode(raw);
    if (!code || seen.has(code)) return;
    seen.add(code);
    items.push({ value: code, label: code });
  };

  for (const code of TREASURY_CURRENCY_OPTIONS) {
    push(code);
  }
  for (const code of options?.extraCodes ?? []) {
    push(code);
  }

  if (options?.includeEmpty) {
    return [{ value: '', label: options.emptyLabel ?? '—' }, ...items];
  }
  return items;
}

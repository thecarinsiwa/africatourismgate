/**
 * Fallback ISO list when GET /currencies is unavailable (offline / external token UI).
 * Prefer live catalog via {@link useActiveCurrencies}.
 */
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

export type CurrencySelectOption = { value: string; label: string };

export function treasuryCurrencySelectOptions(options?: {
  /** Active catalog codes; defaults to {@link TREASURY_CURRENCY_OPTIONS}. */
  codes?: readonly string[];
  /** Optional display labels keyed by ISO code (e.g. from API). */
  labelsByCode?: Record<string, string>;
  includeEmpty?: boolean;
  emptyLabel?: string;
  /** Codes not in the shared list (e.g. org currency) still appear in the select. */
  extraCodes?: Array<string | null | undefined>;
}): CurrencySelectOption[] {
  const seen = new Set<string>();
  const items: CurrencySelectOption[] = [];
  const labels = options?.labelsByCode;

  const push = (raw: string | null | undefined) => {
    const code = normalizeCurrencyCode(raw);
    if (!code || seen.has(code)) return;
    seen.add(code);
    const catalogLabel = labels?.[code]?.trim();
    items.push({
      value: code,
      label: catalogLabel ? `${code} — ${catalogLabel}` : code,
    });
  };

  const baseCodes = options?.codes?.length
    ? options.codes
    : TREASURY_CURRENCY_OPTIONS;

  for (const code of baseCodes) {
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

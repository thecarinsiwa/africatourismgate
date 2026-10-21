'use client';

import { useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../auth/api';
import {
  FALLBACK_TREASURY_CURRENCY,
  TREASURY_CURRENCY_OPTIONS,
  treasuryCurrencySelectOptions,
  type CurrencySelectOption,
} from './currency-options';

type UseActiveCurrenciesArgs = {
  includeEmpty?: boolean;
  emptyLabel?: string;
  extraCodes?: Array<string | null | undefined>;
};

type UseActiveCurrenciesResult = {
  /** Active ISO codes (catalog or offline fallback). */
  codes: string[];
  /** Catalog labels keyed by ISO code (empty when fallback). */
  labelsByCode: Record<string, string>;
  /** Select options (`CODE — label` when catalog labels are known). */
  options: CurrencySelectOption[];
  loading: boolean;
  /** True when using seeded offline list instead of API. */
  isFallback: boolean;
  fallbackCurrency: string;
};

/**
 * Loads active platform currencies for form/filter selects.
 * Falls back to {@link TREASURY_CURRENCY_OPTIONS} if the API fails (e.g. external token UI).
 */
export function useActiveCurrencies(
  args: UseActiveCurrenciesArgs = {},
): UseActiveCurrenciesResult {
  const { includeEmpty, emptyLabel, extraCodes } = args;
  const [codes, setCodes] = useState<string[]>([...TREASURY_CURRENCY_OPTIONS]);
  const [labelsByCode, setLabelsByCode] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    void getApiClient()
      .listCurrencies({ activeOnly: true, limit: 100 })
      .then((result) => {
        if (cancelled) return;
        const nextCodes: string[] = [];
        const nextLabels: Record<string, string> = {};
        for (const row of result.data) {
          const code = row.code.trim().toUpperCase();
          if (!/^[A-Z]{3}$/.test(code) || nextLabels[code]) continue;
          nextCodes.push(code);
          nextLabels[code] = row.label;
        }
        if (nextCodes.length === 0) {
          setCodes([...TREASURY_CURRENCY_OPTIONS]);
          setLabelsByCode({});
          setIsFallback(true);
          return;
        }
        setCodes(nextCodes);
        setLabelsByCode(nextLabels);
        setIsFallback(false);
      })
      .catch(() => {
        if (cancelled) return;
        setCodes([...TREASURY_CURRENCY_OPTIONS]);
        setLabelsByCode({});
        setIsFallback(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const extraKey = (extraCodes ?? [])
    .map((c) => (c ?? '').toString().trim().toUpperCase())
    .join('|');

  const options = useMemo(
    () =>
      treasuryCurrencySelectOptions({
        codes,
        labelsByCode,
        includeEmpty,
        emptyLabel,
        extraCodes,
      }),
    // extraKey tracks extraCodes contents without unstable array identity
    // eslint-disable-next-line react-hooks/exhaustive-deps -- extraCodes via extraKey
    [codes, labelsByCode, includeEmpty, emptyLabel, extraKey],
  );

  return {
    codes,
    labelsByCode,
    options,
    loading,
    isFallback,
    fallbackCurrency: FALLBACK_TREASURY_CURRENCY,
  };
}

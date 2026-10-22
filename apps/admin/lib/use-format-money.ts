'use client';

import { useCallback } from 'react';
import { useDefaultCurrency } from '../components/organization-currency-provider';
import { formatMoney } from './format-money';

export type FormatMoneyFn = (
  totalCents: number | null | undefined,
  currency?: string | null,
) => string;

/** {@link formatMoney} bound to the Admin default currency (organization of the session). */
export function useFormatMoney(): FormatMoneyFn {
  const defaultCurrency = useDefaultCurrency();
  return useCallback(
    (totalCents, currency) => formatMoney(totalCents, currency, defaultCurrency),
    [defaultCurrency],
  );
}

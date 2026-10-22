'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useDefaultCurrency } from '../components/organization-currency-provider';

/**
 * Keeps a create-form currency field on the Admin default currency (which loads
 * asynchronously) until the user picks a currency — call `markTouched` from the field.
 */
export function useDefaultCurrencyField(
  enabled: boolean,
  setCurrency: (currency: string) => void,
): { defaultCurrency: string; markTouched: () => void } {
  const defaultCurrency = useDefaultCurrency();
  const touchedRef = useRef(false);
  const setCurrencyRef = useRef(setCurrency);
  setCurrencyRef.current = setCurrency;

  useEffect(() => {
    if (!enabled || touchedRef.current) return;
    setCurrencyRef.current(defaultCurrency);
  }, [enabled, defaultCurrency]);

  const markTouched = useCallback(() => {
    touchedRef.current = true;
  }, []);

  return { defaultCurrency, markTouched };
}

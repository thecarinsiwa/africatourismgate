'use client';

import type { PublicMobileMoneyCountry } from '@africatourismgate/types';
import { normalizeBrandingAssetUrl } from '@africatourismgate/utils';
import { useEffect, useMemo, useState } from 'react';

export type MobileMoneyInstructionsLabels = {
  title: string;
  empty: string;
  country: string;
  operator: string;
  phone: string;
  label: string;
  referenceHint: string;
  selectCountry: string;
  selectOperator: string;
};

type Props = {
  countries: PublicMobileMoneyCountry[];
  labels: MobileMoneyInstructionsLabels;
  bookingRef?: string | null;
  loading?: boolean;
};

export function MobileMoneyInstructionsPanel({
  countries,
  labels,
  bookingRef,
  loading = false,
}: Props) {
  const [countryId, setCountryId] = useState<string>('');
  const [operatorId, setOperatorId] = useState<string>('');

  useEffect(() => {
    if (countries.length === 0) {
      setCountryId('');
      setOperatorId('');
      return;
    }
    setCountryId((prev) =>
      prev && countries.some((c) => c.id === prev) ? prev : countries[0]!.id,
    );
  }, [countries]);

  const selectedCountry = useMemo(
    () => countries.find((c) => c.id === countryId) ?? null,
    [countries, countryId],
  );

  useEffect(() => {
    const operators = selectedCountry?.operators ?? [];
    if (operators.length === 0) {
      setOperatorId('');
      return;
    }
    setOperatorId((prev) =>
      prev && operators.some((o) => o.id === prev) ? prev : operators[0]!.id,
    );
  }, [selectedCountry]);

  const selectedOperator = useMemo(
    () => selectedCountry?.operators.find((o) => o.id === operatorId) ?? null,
    [selectedCountry, operatorId],
  );

  const logoSrc = selectedOperator?.logoUrl
    ? normalizeBrandingAssetUrl(selectedOperator.logoUrl)
    : null;

  if (loading) {
    return (
      <div className="rounded-lg border border-atg-border p-4 text-sm text-atg-muted dark:border-atg-border">
        …
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border border-atg-border bg-atg-surface p-4 dark:border-atg-border dark:bg-white/5">
      <p className="text-sm font-semibold text-atg-fg">{labels.title}</p>
      {bookingRef ? (
        <p className="text-xs text-atg-muted">
          {labels.referenceHint.replace('{ref}', bookingRef.slice(0, 8))}
        </p>
      ) : null}

      {countries.length === 0 ? (
        <p className="text-sm text-amber-700 dark:text-amber-300">{labels.empty}</p>
      ) : (
        <>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-atg-muted">{labels.country}</span>
            <select
              className="w-full rounded-md border border-atg-border bg-transparent px-3 py-2 text-sm text-atg-fg"
              value={countryId}
              onChange={(e) => setCountryId(e.target.value)}
              aria-label={labels.selectCountry}
            >
              {countries.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.name} ({country.code})
                </option>
              ))}
            </select>
          </label>

          {selectedCountry && selectedCountry.operators.length > 0 ? (
            <label className="block space-y-1">
              <span className="text-xs font-medium text-atg-muted">
                {labels.operator}
              </span>
              <select
                className="w-full rounded-md border border-atg-border bg-transparent px-3 py-2 text-sm text-atg-fg"
                value={operatorId}
                onChange={(e) => setOperatorId(e.target.value)}
                aria-label={labels.selectOperator}
              >
                {selectedCountry.operators.map((operator) => (
                  <option key={operator.id} value={operator.id}>
                    {operator.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {selectedOperator ? (
            <div className="rounded-lg border border-atg-border/80 px-3 py-3 text-sm text-atg-fg dark:border-atg-border">
              <div className="flex items-center gap-3">
                {logoSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoSrc}
                    alt=""
                    className="h-10 w-10 rounded object-contain"
                  />
                ) : null}
                <p className="font-medium">{selectedOperator.name}</p>
              </div>
              <ul className="mt-3 space-y-2">
                {selectedOperator.numbers.map((number) => (
                  <li key={number.id}>
                    <p className="font-mono text-sm">
                      {labels.phone}: {number.phoneE164}
                    </p>
                    {number.label ? (
                      <p className="text-xs text-atg-muted">
                        {labels.label}: {number.label}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

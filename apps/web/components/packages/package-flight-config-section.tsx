'use client';

import { useEffect, useState } from 'react';
import { getFlightDetail } from '../../lib/api/public';
import type { FlightDetail } from '../../lib/flights/types';
import type { Translations } from '../../lib/i18n/translations';
import type { PackageFlightLineSelection } from '../../lib/packages/package-lines';
import { FlightClassesSection } from '../flights/flight-classes-section';

type PackageFlightConfigItemProps = {
  flightId: string;
  label: string;
  departureDate: string;
  passengers: number;
  selectedLine: PackageFlightLineSelection | null;
  onChange: (line: PackageFlightLineSelection | null) => void;
  t: Translations['packages'];
  f: Translations['flights'];
};

export function PackageFlightConfigItem({
  flightId,
  label,
  departureDate,
  passengers,
  selectedLine,
  onChange,
  t,
  f,
}: PackageFlightConfigItemProps) {
  const [detail, setDetail] = useState<FlightDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!departureDate) {
      setDetail(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(false);

    void getFlightDetail(flightId, { departureDate, passengers })
      .then((data) => {
        if (!cancelled) setDetail(data);
      })
      .catch(() => {
        if (!cancelled) {
          setDetail(null);
          setError(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [flightId, departureDate, passengers]);

  const selectedClassId =
    selectedLine?.itemId === flightId ? selectedLine.flightClassId : null;

  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-atg-border dark:bg-atg-elevated">
      <header className="mb-4 border-b border-gray-100 pb-4 dark:border-atg-border">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          {t.itemTypes.flight}
        </p>
        <h3 className="mt-1 text-lg font-bold text-[#0f1a16] dark:text-white">{label}</h3>
      </header>

      {!departureDate ? (
        <p className="text-sm text-amber-700 dark:text-amber-300">{t.selectDepartureDateHint}</p>
      ) : null}

      {loading && (
        <p className="text-sm text-gray-600 dark:text-atg-muted">{t.loadingFlightClasses}</p>
      )}

      {error && (
        <p className="text-sm text-red-700 dark:text-red-300">{t.flightClassesError}</p>
      )}

      {!loading && !error && detail && departureDate && (
        <FlightClassesSection
          classes={detail.classes}
          currency={detail.currency}
          selectedClassId={selectedClassId}
          onSelectClass={(flightClassId) =>
            onChange({
              lineType: 'flight',
              itemId: flightId,
              flightClassId,
              departureDate,
              passengers,
            })
          }
          t={f}
        />
      )}
    </article>
  );
}

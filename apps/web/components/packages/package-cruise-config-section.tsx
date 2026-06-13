'use client';

import { useEffect, useState } from 'react';
import { getCruiseSailingDetail } from '../../lib/api/public';
import type { CruiseSailingDetail } from '../../lib/cruises/types';
import type { Translations } from '../../lib/i18n/translations';
import type { PackageCruiseLineSelection } from '../../lib/packages/package-lines';
import { CruiseCabinsSection } from '../cruises/cruise-cabins-section';

type PackageCruiseConfigItemProps = {
  cabinId: string;
  label: string;
  sailingId: string;
  guests: number;
  selectedLine: PackageCruiseLineSelection | null;
  onChange: (line: PackageCruiseLineSelection | null) => void;
  t: Translations['packages'];
  cr: Translations['cruises'];
};

export function PackageCruiseConfigItem({
  cabinId,
  label,
  sailingId,
  guests,
  selectedLine,
  onChange,
  t,
  cr,
}: PackageCruiseConfigItemProps) {
  const [detail, setDetail] = useState<CruiseSailingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const cabinsForPackage = detail?.cabins.filter((cabin) => cabin.cabinId === cabinId) ?? [];

  useEffect(() => {
    let cancelled = false;
    if (!sailingId) {
      setDetail(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(false);

    void getCruiseSailingDetail(sailingId, { guests })
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
  }, [sailingId, guests]);

  const selectedAvailabilityId =
    selectedLine?.itemId === cabinId ? selectedLine.cabinAvailabilityId : null;

  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-atg-border dark:bg-atg-elevated">
      <header className="mb-4 border-b border-gray-100 pb-4 dark:border-atg-border">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          {t.itemTypes.cruise}
        </p>
        <h3 className="mt-1 text-lg font-bold text-[#0f1a16] dark:text-white">{label}</h3>
      </header>

      {!sailingId ? (
        <p className="text-sm text-amber-700 dark:text-amber-300">{t.selectSailingHint}</p>
      ) : null}

      {loading && (
        <p className="text-sm text-gray-600 dark:text-atg-muted">{t.loadingCruiseCabins}</p>
      )}

      {error && (
        <p className="text-sm text-red-700 dark:text-red-300">{t.cruiseCabinsError}</p>
      )}

      {!loading && !error && detail && sailingId && cabinsForPackage.length > 0 && (
        <CruiseCabinsSection
          cabins={cabinsForPackage}
          currency={detail.currency}
          selectedAvailabilityId={selectedAvailabilityId}
          guests={guests}
          onSelectCabin={(availabilityId) =>
            onChange({
              lineType: 'cruise',
              itemId: cabinId,
              sailingId,
              cabinAvailabilityId: availabilityId,
              guests,
            })
          }
          t={cr}
        />
      )}

      {!loading && !error && detail && sailingId && cabinsForPackage.length === 0 && (
        <p className="text-sm text-red-700 dark:text-red-300">{t.cruiseCabinsError}</p>
      )}
    </article>
  );
}

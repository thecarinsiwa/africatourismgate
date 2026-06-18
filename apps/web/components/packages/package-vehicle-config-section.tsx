'use client';

import { useEffect, useRef, useState } from 'react';
import { getVehicleDetail } from '../../lib/api/public';
import type { VehicleDetail } from '../../lib/cars/types';
import type { Translations } from '../../lib/i18n/translations';
import type { PackageVehicleLineSelection } from '../../lib/packages/package-lines';

type PackageVehicleConfigItemProps = {
  vehicleId: string;
  label: string;
  pickupDate: string;
  returnDate: string;
  selectedLine: PackageVehicleLineSelection | null;
  onChange: (line: PackageVehicleLineSelection | null) => void;
  t: Translations['packages'];
  c: Translations['cars'];
};

export function PackageVehicleConfigItem({
  vehicleId,
  label,
  pickupDate,
  returnDate,
  selectedLine,
  onChange,
  t,
  c,
}: PackageVehicleConfigItemProps) {
  const [detail, setDetail] = useState<VehicleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    let cancelled = false;
    if (!pickupDate || !returnDate || returnDate <= pickupDate) {
      setDetail(null);
      setLoading(false);
      setError(false);
      return;
    }

    setLoading(true);
    setError(false);

    void getVehicleDetail(vehicleId, { pickupDate, returnDate })
      .then((data) => {
        if (cancelled) return;
        setDetail(data);
        if (data.availabilitySlot?.id) {
          onChangeRef.current({
            lineType: 'vehicle',
            itemId: vehicleId,
            availabilitySlotId: data.availabilitySlot.id,
            pickupDate,
            returnDate,
          });
        } else {
          onChangeRef.current(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDetail(null);
          setError(true);
          onChangeRef.current(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [vehicleId, pickupDate, returnDate]);

  const configured =
    selectedLine?.itemId === vehicleId &&
    selectedLine.pickupDate === pickupDate &&
    selectedLine.returnDate === returnDate;

  const unavailable = Boolean(detail && !detail.availabilitySlot);

  return (
    <article className="rounded-2xl border border-atg-border bg-atg-elevated p-5 dark:border-atg-border dark:bg-atg-elevated">
      <header className="mb-4 border-b border-atg-border pb-4 dark:border-atg-border">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          {t.itemTypes.vehicle}
        </p>
        <h3 className="mt-1 text-lg font-bold text-atg-fg">{label}</h3>
      </header>

      {!pickupDate || !returnDate || returnDate <= pickupDate ? (
        <p className="text-sm text-amber-700 dark:text-amber-300">{t.selectRentalDatesHint}</p>
      ) : null}

      {pickupDate && returnDate && returnDate > pickupDate && loading && (
        <p className="text-sm text-atg-muted">{t.loadingVehicleAvailability}</p>
      )}

      {pickupDate && returnDate && returnDate > pickupDate && error && (
        <p className="text-sm text-red-700 dark:text-red-300">{t.vehicleAvailabilityError}</p>
      )}

      {pickupDate && returnDate && returnDate > pickupDate && !loading && !error && unavailable && (
        <p className="text-sm text-amber-700 dark:text-amber-300">{t.vehicleAvailabilityError}</p>
      )}

      {!loading && !error && detail && detail.availabilitySlot && configured && (
        <p className="text-sm text-emerald-700 dark:text-emerald-300">
          {t.vehicleDatesConfirmed} · {detail.rentalDays}{' '}
          {detail.rentalDays === 1 ? c.daySingular : c.dayPlural}
        </p>
      )}
    </article>
  );
}

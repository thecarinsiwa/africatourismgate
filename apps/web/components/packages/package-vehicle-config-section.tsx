'use client';

import { useEffect, useRef, useState } from 'react';
import { Spinner } from '@africatourismgate/ui';
import { getVehicleDetail } from '../../lib/api/public';
import type { VehicleDetail } from '../../lib/cars/types';
import type { Translations } from '../../lib/i18n/message-types';
import type { PackageVehicleLineSelection } from '../../lib/packages/package-lines';

type PackageVehicleConfigItemProps = {
  vehicleId: string;
  label: string;
  travelDate: string;
  selectedLine: PackageVehicleLineSelection | null;
  onChange: (line: PackageVehicleLineSelection | null) => void;
  t: Translations['packages'];
  c: Translations['cars'];
};

export function PackageVehicleConfigItem({
  vehicleId,
  label,
  travelDate,
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
    if (!travelDate) {
      setDetail(null);
      setLoading(false);
      setError(false);
      return;
    }

    setLoading(true);
    setError(false);

    void getVehicleDetail(vehicleId, { travelDate })
      .then((data) => {
        if (cancelled) return;
        setDetail(data);
        if (data.availabilitySlot?.id && data.route?.id) {
          onChangeRef.current({
            lineType: 'vehicle',
            itemId: vehicleId,
            availabilitySlotId: data.availabilitySlot.id,
            routeId: data.route.id,
            travelDate,
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
  }, [vehicleId, travelDate]);

  const configured =
    selectedLine?.itemId === vehicleId &&
    selectedLine.routeId === detail?.route.id &&
    selectedLine.travelDate === travelDate;

  const unavailable = Boolean(detail && !detail.availabilitySlot);

  return (
    <article className="rounded-2xl border border-atg-border bg-atg-elevated p-5 dark:border-atg-border dark:bg-atg-elevated">
      <header className="mb-4 border-b border-atg-border pb-4 dark:border-atg-border">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          {t.itemTypes.vehicle}
        </p>
        <h3 className="mt-1 text-lg font-bold text-atg-fg">{label}</h3>
      </header>

      {!travelDate ? (
        <p className="text-sm text-amber-700 dark:text-amber-300">{t.selectRentalDatesHint}</p>
      ) : null}

      {travelDate && loading && (
        <div className="flex items-center gap-2.5 py-3">
          <Spinner size="sm" variant="primary" />
          <span className="text-sm text-atg-muted">{t.loadingVehicleAvailability}</span>
        </div>
      )}

      {travelDate && error && (
        <p className="text-sm text-red-700 dark:text-red-300">{t.vehicleAvailabilityError}</p>
      )}

      {travelDate && !loading && !error && unavailable && (
        <p className="text-sm text-amber-700 dark:text-amber-300">{t.vehicleAvailabilityError}</p>
      )}

      {!loading && !error && detail && detail.availabilitySlot && configured && (
        <p className="text-sm text-emerald-700 dark:text-emerald-300">
          {t.vehicleDatesConfirmed} · {detail.route.departureCity} →{' '}
          {detail.route.arrivalCity} · {c.routePriceLabel}
        </p>
      )}
    </article>
  );
}

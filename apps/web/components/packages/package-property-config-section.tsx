'use client';

import type { PropertyDetail } from '@africatourismgate/types';
import { useEffect, useMemo, useState } from 'react';
import { getAccommodationDetail } from '../../lib/api/public';
import { addDays } from '../../lib/hotels/dates';
import type { Translations } from '../../lib/i18n/translations';
import type { PackagePropertyLineSelection } from '../../lib/packages/package-lines';
import { HotelRoomsSection } from '../hotels/hotel-rooms-section';

type PackagePropertyConfigItemProps = {
  propertyId: string;
  label: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  selectedLine: PackagePropertyLineSelection | null;
  onChange: (line: PackagePropertyLineSelection | null) => void;
  t: Translations['packages'];
  h: Translations['hotels'];
};

export function PackagePropertyConfigItem({
  propertyId,
  label,
  checkIn,
  checkOut,
  guests,
  selectedLine,
  onChange,
  t,
  h,
}: PackagePropertyConfigItemProps) {
  const [detail, setDetail] = useState<PropertyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!checkIn || !checkOut || checkOut <= checkIn) {
      setDetail(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(false);

    void getAccommodationDetail(propertyId, { checkIn, checkOut, guests })
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
  }, [propertyId, checkIn, checkOut, guests]);

  const nights = useMemo(() => {
    if (!checkIn || !checkOut || checkOut <= checkIn) return 0;
    let count = 0;
    let cursor = checkIn;
    while (cursor < checkOut) {
      count += 1;
      cursor = addDays(cursor, 1);
    }
    return count;
  }, [checkIn, checkOut]);

  const selectedRoomId =
    selectedLine?.itemId === propertyId ? selectedLine.roomId : null;

  return (
    <article className="rounded-2xl border border-atg-border bg-atg-elevated p-5 dark:border-atg-border dark:bg-atg-elevated">
      <header className="mb-4 border-b border-atg-border pb-4 dark:border-atg-border">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          {t.itemTypes.property}
        </p>
        <h3 className="mt-1 text-lg font-bold text-atg-fg">{label}</h3>
      </header>

      {!checkIn || !checkOut || checkOut <= checkIn ? (
        <p className="text-sm text-amber-700 dark:text-amber-300">{t.selectStayDatesHint}</p>
      ) : null}

      {loading && (
        <p className="text-sm text-atg-muted">{t.loadingPropertyRooms}</p>
      )}

      {error && (
        <p className="text-sm text-red-700 dark:text-red-300">{t.propertyRoomsError}</p>
      )}

      {!loading && !error && detail && checkIn && checkOut && checkOut > checkIn && (
        <HotelRoomsSection
          rooms={detail.rooms}
          title={h.roomsTitle}
          selectedRoomId={selectedRoomId}
          onSelectRoom={(roomId) =>
            onChange({
              lineType: 'property',
              itemId: propertyId,
              roomId,
              checkIn,
              checkOut,
              guests,
            })
          }
          selectRoomLabel={h.selectRoom}
          unavailableLabel={h.unavailable}
          perNightLabel={h.perNight}
          maxGuestsLabel={h.maxGuests}
          bedConfigLabel={h.bedConfig}
          nights={nights}
        />
      )}
    </article>
  );
}

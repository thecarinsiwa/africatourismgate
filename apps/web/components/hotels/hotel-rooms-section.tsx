'use client';

import type { PropertyDetailRoom } from '@africatourismgate/types';
import { formatHotelPrice } from '../../lib/hotels/listings';

type HotelRoomsSectionProps = {
  rooms: PropertyDetailRoom[];
  title: string;
  selectedRoomId: string | null;
  onSelectRoom: (roomId: string) => void;
  selectRoomLabel: string;
  unavailableLabel: string;
  perNightLabel: string;
  maxGuestsLabel: string;
  bedConfigLabel: string;
  nights: number;
};

export function HotelRoomsSection({
  rooms,
  title,
  selectedRoomId,
  onSelectRoom,
  selectRoomLabel,
  unavailableLabel,
  perNightLabel,
  maxGuestsLabel,
  bedConfigLabel,
  nights,
}: HotelRoomsSectionProps) {
  if (!rooms.length) return null;

  return (
    <section id="rooms">
      <h2 className="mb-4 text-lg font-bold text-atg-fg">{title}</h2>
      <div className="space-y-4">
        {rooms.map((room) => {
          const selected = selectedRoomId === room.id;
          const nightly =
            room.totalPriceCents != null && nights > 0
              ? Math.round(room.totalPriceCents / nights)
              : room.basePriceCents;

          return (
            <article
              key={room.id}
              className={`rounded-2xl border p-5 transition-colors ${
                selected
                  ? 'border-primary bg-primary/5 dark:border-primary dark:bg-primary/10'
                  : 'border-atg-border bg-atg-elevated dark:border-atg-border dark:bg-atg-elevated'
              } ${!room.available ? 'opacity-60' : ''}`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold text-atg-fg">{room.name}</h3>
                  {room.roomType && (
                    <p className="mt-0.5 text-sm text-atg-muted">{room.roomType}</p>
                  )}
                  <ul className="mt-2 flex flex-wrap gap-3 text-sm text-atg-muted">
                    <li>{maxGuestsLabel.replace('{n}', String(room.maxGuests))}</li>
                    {room.bedConfig && (
                      <li>
                        {bedConfigLabel}: {room.bedConfig}
                      </li>
                    )}
                  </ul>
                </div>

                <div className="shrink-0 text-right">
                  {room.totalPriceCents != null && nights > 0 ? (
                    <>
                      <p className="text-xl font-bold text-atg-fg">
                        {formatHotelPrice(room.totalPriceCents, room.currency)}
                      </p>
                      <p className="text-xs text-atg-muted">
                        {formatHotelPrice(nightly, room.currency)} {perNightLabel}
                      </p>
                    </>
                  ) : (
                    <p className="text-lg font-bold text-atg-fg">
                      {formatHotelPrice(room.basePriceCents, room.currency)}
                      <span className="text-sm font-normal text-atg-muted">
                        {' '}
                        {perNightLabel}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-atg-border pt-4 dark:border-atg-border">
                {!room.available && (
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">
                    {unavailableLabel}
                  </span>
                )}
                <button
                  type="button"
                  disabled={!room.available}
                  onClick={() => onSelectRoom(room.id)}
                  className={`ml-auto min-h-[44px] rounded-lg px-5 py-2 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                    selected
                      ? 'bg-primary text-white'
                      : 'border border-atg-border text-atg-fg hover:border-primary hover:text-primary dark:border-atg-border dark:text-white'
                  }`}
                >
                  {selectRoomLabel}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

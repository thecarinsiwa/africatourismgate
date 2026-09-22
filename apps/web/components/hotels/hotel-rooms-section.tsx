'use client';

import { useState } from 'react';
import type { PropertyDetailRoom } from '@africatourismgate/types';
import { formatHotelPrice } from '../../lib/hotels/listings';
import {
  SwipeableGalleryLightbox,
  type SwipeableGalleryLabels,
} from '../shared/swipeable-image-gallery';

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
  galleryLabels: SwipeableGalleryLabels;
};

function RoomImagesThumb({
  room,
  galleryLabels,
}: {
  room: PropertyDetailRoom;
  galleryLabels: SwipeableGalleryLabels;
}) {
  const images = [...room.images].sort((a, b) => a.sortOrder - b.sortOrder);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (!images.length) return null;

  return (
    <>
      <div
        className="flex max-w-full gap-1 overflow-x-auto pb-0.5 [-webkit-overflow-scrolling:touch]"
        role="group"
        aria-label={galleryLabels.ariaLabel}
      >
        {images.map((img, index) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setLightboxIndex(index)}
            className="relative h-11 w-14 shrink-0 overflow-hidden rounded-md border border-atg-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:border-atg-border sm:h-14 sm:w-[4.25rem] sm:rounded-lg"
            aria-label={
              img.caption ??
              `${galleryLabels.openLightbox} (${galleryLabels.counter(index + 1, images.length)})`
            }
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url("${img.url}")` }}
            />
          </button>
        ))}
      </div>

      {lightboxIndex != null ? (
        <SwipeableGalleryLightbox
          images={images.map((img) => ({
            id: img.id,
            url: img.url,
            caption: img.caption,
            sortOrder: img.sortOrder,
          }))}
          name={room.name}
          index={lightboxIndex}
          labels={galleryLabels}
          onClose={() => setLightboxIndex(null)}
          onIndexChange={setLightboxIndex}
        />
      ) : null}
    </>
  );
}

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
  galleryLabels,
}: HotelRoomsSectionProps) {
  if (!rooms.length) return null;

  return (
    <section id="rooms">
      <h2 className="mb-3 text-base font-bold text-atg-fg sm:mb-4 sm:text-lg">{title}</h2>
      <div className="space-y-2.5 sm:space-y-4">
        {rooms.map((room) => {
          const selected = selectedRoomId === room.id;
          const nightly =
            room.totalPriceCents != null && nights > 0
              ? Math.round(room.totalPriceCents / nights)
              : room.basePriceCents;
          const hasImages = room.images.length > 0;

          return (
            <article
              key={room.id}
              className={`rounded-xl border p-3 transition-colors sm:rounded-2xl sm:p-5 ${
                selected
                  ? 'border-primary bg-primary/5 dark:border-primary dark:bg-primary/10'
                  : 'border-atg-border bg-atg-elevated dark:border-atg-border dark:bg-atg-elevated'
              } ${!room.available ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-atg-fg sm:text-base">{room.name}</h3>
                  <p className="mt-0.5 text-xs text-atg-muted sm:text-sm">
                    {[
                      room.roomType,
                      maxGuestsLabel.replace('{n}', String(room.maxGuests)),
                      room.bedConfig
                        ? `${bedConfigLabel}: ${room.bedConfig}`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  {room.totalPriceCents != null && nights > 0 ? (
                    <>
                      <p className="text-base font-bold text-atg-fg sm:text-xl">
                        {formatHotelPrice(room.totalPriceCents, room.currency)}
                      </p>
                      <p className="text-[11px] text-atg-muted sm:text-xs">
                        {formatHotelPrice(nightly, room.currency)} {perNightLabel}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm font-bold text-atg-fg sm:text-lg">
                      {formatHotelPrice(room.basePriceCents, room.currency)}
                      <span className="text-xs font-normal text-atg-muted sm:text-sm">
                        {' '}
                        {perNightLabel}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {hasImages ? (
                <div className="mt-2 sm:mt-3">
                  <RoomImagesThumb room={room} galleryLabels={galleryLabels} />
                </div>
              ) : null}

              <div className="mt-2.5 flex items-center justify-between gap-2 sm:mt-4 sm:border-t sm:border-atg-border sm:pt-4 dark:sm:border-atg-border">
                {!room.available ? (
                  <span className="text-xs font-medium text-red-600 dark:text-red-400 sm:text-sm">
                    {unavailableLabel}
                  </span>
                ) : (
                  <span className="sr-only" />
                )}
                <button
                  type="button"
                  disabled={!room.available}
                  onClick={() => onSelectRoom(room.id)}
                  className={`ml-auto min-h-10 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-[44px] sm:px-5 sm:py-2 sm:text-sm ${
                    selected
                      ? 'bg-primary text-white'
                      : 'border border-atg-border text-atg-fg hover:border-primary hover:text-primary dark:border-atg-border dark:text-atg-fg'
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

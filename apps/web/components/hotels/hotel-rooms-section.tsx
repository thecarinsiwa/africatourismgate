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
  const cover = images[0];

  if (!cover) return null;

  return (
    <>
      <div className="flex w-full shrink-0 flex-col gap-2 sm:w-44">
        <button
          type="button"
          onClick={() => setLightboxIndex(0)}
          className="group relative aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-xl bg-atg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-atg-surface dark:bg-atg-surface"
          aria-label={galleryLabels.openLightbox}
        >
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-[1.03]"
            style={{ backgroundImage: `url("${cover.url}")` }}
            role="img"
            aria-label={cover.caption ?? room.name}
          />
          {images.length > 1 ? (
            <span className="pointer-events-none absolute bottom-2 right-2 rounded-md bg-atg-fg/65 px-2 py-0.5 text-xs font-medium text-atg-elevated backdrop-blur-sm">
              {galleryLabels.counter(1, images.length)}
            </span>
          ) : null}
        </button>

        {images.length > 1 ? (
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 [-webkit-overflow-scrolling:touch]">
            {images.slice(0, 4).map((img, index) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setLightboxIndex(index)}
                className="relative h-12 w-14 shrink-0 overflow-hidden rounded-md border border-atg-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:border-atg-border"
                aria-label={img.caption ?? `${room.name} ${index + 1}`}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url("${img.url}")` }}
                />
              </button>
            ))}
          </div>
        ) : null}
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
      <h2 className="mb-4 text-lg font-bold text-atg-fg">{title}</h2>
      <div className="space-y-4">
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
              className={`rounded-2xl border p-5 transition-colors ${
                selected
                  ? 'border-primary bg-primary/5 dark:border-primary dark:bg-primary/10'
                  : 'border-atg-border bg-atg-elevated dark:border-atg-border dark:bg-atg-elevated'
              } ${!room.available ? 'opacity-60' : ''}`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-start">
                  {hasImages ? (
                    <RoomImagesThumb room={room} galleryLabels={galleryLabels} />
                  ) : null}
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

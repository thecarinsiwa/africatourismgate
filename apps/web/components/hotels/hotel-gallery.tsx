'use client';

import { useState } from 'react';
import type { PropertyDetailImage } from '@africatourismgate/types';

type HotelGalleryProps = {
  images: PropertyDetailImage[];
  name: string;
  ariaLabel: string;
};

export function HotelGallery({ images, name, ariaLabel }: HotelGalleryProps) {
  const sorted = [...images].sort((a, b) => a.sortOrder - b.sortOrder);
  const [activeIndex, setActiveIndex] = useState(0);
  const active = sorted[activeIndex] ?? sorted[0];

  if (!active) return null;

  return (
    <section aria-label={ariaLabel}>
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-atg-surface dark:bg-atg-surface sm:aspect-[21/9]">
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-300"
          style={{ backgroundImage: `url("${active.url}")` }}
          role="img"
          aria-label={active.caption ?? name}
        />
        {active.caption && (
          <p className="absolute bottom-3 left-3 rounded-md bg-black/50 px-2 py-1 text-xs text-white">
            {active.caption}
          </p>
        )}
      </div>

      {sorted.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory [-webkit-overflow-scrolling:touch]">
          {sorted.map((img, index) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`relative h-16 w-24 shrink-0 snap-start overflow-hidden rounded-lg border-2 transition-colors sm:h-20 sm:w-28 ${
                index === activeIndex
                  ? 'border-primary'
                  : 'border-transparent opacity-80 hover:opacity-100'
              }`}
              aria-label={img.caption ?? `${name} ${index + 1}`}
              aria-current={index === activeIndex ? 'true' : undefined}
            >
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url("${img.url}")` }}
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

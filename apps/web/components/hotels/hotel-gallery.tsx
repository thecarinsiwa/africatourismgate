'use client';

import type { PropertyDetailImage } from '@africatourismgate/types';
import {
  SwipeableImageGallery,
  type SwipeableGalleryLabels,
} from '../shared/swipeable-image-gallery';

export type HotelGalleryLabels = SwipeableGalleryLabels;

type HotelGalleryProps = {
  images: PropertyDetailImage[];
  name: string;
  labels: HotelGalleryLabels;
};

export function HotelGallery({ images, name, labels }: HotelGalleryProps) {
  return (
    <SwipeableImageGallery
      images={images.map((img) => ({
        id: img.id,
        url: img.url,
        caption: img.caption,
        sortOrder: img.sortOrder,
      }))}
      name={name}
      labels={labels}
    />
  );
}

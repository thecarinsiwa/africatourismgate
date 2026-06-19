'use client';

import type { ProductGalleryImage } from '../../lib/shared/product-images';
import {
  SwipeableImageGallery,
  type SwipeableGalleryLabels,
} from './swipeable-image-gallery';

export type ProductGalleryLabels = SwipeableGalleryLabels;

type ProductGalleryProps = {
  images: ProductGalleryImage[];
  name: string;
  labels: ProductGalleryLabels;
};

export function ProductGallery({ images, name, labels }: ProductGalleryProps) {
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

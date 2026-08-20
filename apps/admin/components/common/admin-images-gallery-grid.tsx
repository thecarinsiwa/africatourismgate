'use client';

import {
  DataTableActionButton,
  DataTableActions,
  cn,
} from '@africatourismgate/ui';
import Image from 'next/image';

export type AdminGalleryImage = {
  id: string;
  url: string;
  caption?: string | null;
  sortOrder?: number;
};

type AdminImagesGalleryGridProps<T extends AdminGalleryImage> = {
  images: T[];
  ariaLabel: string;
  emptyMessage: string;
  isLoading?: boolean;
  loadingMessage?: string;
  deletingId?: string | null;
  emptyDash?: string;
  editLabel?: string;
  deleteLabel?: string;
  onEdit: (image: T) => void;
  onDelete: (image: T) => void;
  className?: string;
};

export function AdminImagesGalleryGrid<T extends AdminGalleryImage>({
  images,
  ariaLabel,
  emptyMessage,
  isLoading = false,
  loadingMessage,
  deletingId = null,
  emptyDash = '—',
  editLabel,
  deleteLabel,
  onEdit,
  onDelete,
  className,
}: AdminImagesGalleryGridProps<T>) {
  if (isLoading) {
    return (
      <p className="text-sm text-atg-muted" aria-busy="true">
        {loadingMessage ?? emptyMessage}
      </p>
    );
  }

  if (images.length === 0) {
    return <p className="text-sm text-atg-muted">{emptyMessage}</p>;
  }

  return (
    <ul
      role="list"
      aria-label={ariaLabel}
      className={cn(
        'grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6',
        className,
      )}
    >
      {images.map((image) => {
        const isDeleting = deletingId === image.id;
        const alt = image.caption?.trim() || ariaLabel;

        return (
          <li
            key={image.id}
            className="group overflow-hidden rounded-lg border border-atg-border bg-atg-elevated"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden">
              <Image
                src={image.url}
                alt={alt}
                fill
                unoptimized
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div
                className={cn(
                  'absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-gradient-to-t from-black/70 to-transparent p-2',
                  'opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:group-focus-within:opacity-100',
                )}
              >
                <DataTableActions className="rounded-lg bg-black/40 p-0.5 backdrop-blur-sm">
                  <DataTableActionButton
                    action="edit"
                    label={editLabel}
                    onClick={() => onEdit(image)}
                    disabled={isDeleting}
                    className="text-white hover:bg-white/20 hover:text-white"
                  />
                  <DataTableActionButton
                    action="delete"
                    label={deleteLabel}
                    onClick={() => onDelete(image)}
                    disabled={isDeleting}
                    loading={isDeleting}
                    className="text-white hover:bg-white/20 hover:text-red-300"
                  />
                </DataTableActions>
              </div>
            </div>
            <div className="space-y-1 p-2">
              <p className="truncate text-xs text-atg-fg">
                {image.caption?.trim() || emptyDash}
              </p>
              {image.sortOrder !== undefined ? (
                <p className="text-[11px] tabular-nums text-atg-muted">#{image.sortOrder}</p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

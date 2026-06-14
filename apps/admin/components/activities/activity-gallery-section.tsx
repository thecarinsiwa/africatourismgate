'use client';

import { Card } from '@africatourismgate/ui';

const PLACEHOLDER_COUNT = 4;

type ActivityGallerySectionProps = {
  embedded?: boolean;
};

function GalleryPlaceholder({ index }: { index: number }) {
  return (
    <div
      className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-atg-border/80 bg-atg-surface/50 p-4 text-center"
      aria-hidden={index > 0}
    >
      <svg
        className="h-8 w-8 text-atg-muted/70"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      <span className="text-xs font-medium text-atg-muted">Photo à venir</span>
    </div>
  );
}

export function ActivityGallerySection({ embedded }: ActivityGallerySectionProps) {
  return (
    <section
      className={
        embedded ? 'space-y-4' : 'mt-12 space-y-4 border-t border-atg-border pt-10'
      }
    >
      <div>
        <h2 className="text-lg font-semibold text-atg-fg">Galerie photos</h2>
        <p className="mt-1 text-sm text-atg-muted">
          L’upload sera disponible prochainement. Les emplacements ci-dessous préparent la
          future galerie de l’activité.
        </p>
      </div>

      <Card variant="dashboard" padding="md">
        <div
          className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4"
          role="list"
          aria-label="Emplacements galerie photos (à venir)"
        >
          {Array.from({ length: PLACEHOLDER_COUNT }, (_, index) => (
            <div key={index} role="listitem">
              <GalleryPlaceholder index={index} />
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}

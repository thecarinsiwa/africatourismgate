'use client';

import type { ProductGalleryImage } from '../../lib/shared/product-images';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => !el.hasAttribute('disabled') && el.offsetParent !== null,
  );
}

function trapFocus(container: HTMLElement, event: KeyboardEvent): void {
  if (event.key !== 'Tab') return;

  const focusable = getFocusableElements(container);
  if (focusable.length === 0) {
    event.preventDefault();
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = document.activeElement as HTMLElement | null;

  if (event.shiftKey) {
    if (active === first || !container.contains(active)) {
      event.preventDefault();
      last.focus();
    }
  } else if (active === last) {
    event.preventDefault();
    first.focus();
  }
}

export type ProductGalleryLabels = {
  ariaLabel: string;
  openLightbox: string;
  close: string;
  previous: string;
  next: string;
  counter: (current: number, total: number) => string;
};

type ProductGalleryProps = {
  images: ProductGalleryImage[];
  name: string;
  labels: ProductGalleryLabels;
};

type LightboxProps = {
  images: ProductGalleryImage[];
  name: string;
  index: number;
  labels: ProductGalleryLabels;
  onClose: () => void;
  onIndexChange: (index: number) => void;
};

function GalleryLightbox({
  images,
  name,
  index,
  labels,
  onClose,
  onIndexChange,
}: LightboxProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const active = images[index];
  const hasMultiple = images.length > 1;

  const goPrevious = useCallback(() => {
    onIndexChange((index - 1 + images.length) % images.length);
  }, [images.length, index, onIndexChange]);

  const goNext = useCallback(() => {
    onIndexChange((index + 1) % images.length);
  }, [images.length, index, onIndexChange]);

  useEffect(() => {
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const frame = window.requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const focusable = getFocusableElements(panel);
      if (focusable.length > 0) {
        focusable[0].focus();
      } else {
        panel.focus();
      }
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === 'ArrowLeft' && hasMultiple) {
        event.preventDefault();
        goPrevious();
        return;
      }
      if (event.key === 'ArrowRight' && hasMultiple) {
        event.preventDefault();
        goNext();
        return;
      }
      const panel = panelRef.current;
      if (panel) trapFocus(panel, event);
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocusedRef.current?.focus?.();
    };
  }, [goNext, goPrevious, hasMultiple, onClose]);

  if (!active || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 sm:p-8"
      role="presentation"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative flex max-h-full w-full max-w-6xl flex-col outline-none"
        onClick={(event) => event.stopPropagation()}
      >
        <p id={titleId} className="sr-only">
          {labels.counter(index + 1, images.length)}
        </p>

        <div className="mb-3 flex items-center justify-between gap-3 text-white">
          <p className="text-sm font-medium text-white/90" aria-live="polite">
            {labels.counter(index + 1, images.length)}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-white/20 bg-white/10 text-sm font-semibold text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label={labels.close}
          >
            <span aria-hidden>×</span>
          </button>
        </div>

        <div className="relative flex min-h-0 flex-1 items-center justify-center">
          {hasMultiple ? (
            <button
              type="button"
              onClick={goPrevious}
              className="absolute left-0 z-10 inline-flex min-h-[44px] min-w-[44px] -translate-x-1 items-center justify-center rounded-lg border border-white/20 bg-black/40 text-2xl text-white backdrop-blur-sm transition-colors hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:translate-x-0"
              aria-label={labels.previous}
            >
              ‹
            </button>
          ) : null}

          <img
            src={active.url}
            alt={active.caption ?? `${name} ${index + 1}`}
            className="max-h-[min(80vh,720px)] w-full rounded-lg object-contain"
          />

          {hasMultiple ? (
            <button
              type="button"
              onClick={goNext}
              className="absolute right-0 z-10 inline-flex min-h-[44px] min-w-[44px] translate-x-1 items-center justify-center rounded-lg border border-white/20 bg-black/40 text-2xl text-white backdrop-blur-sm transition-colors hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:translate-x-0"
              aria-label={labels.next}
            >
              ›
            </button>
          ) : null}
        </div>

        {active.caption ? (
          <p className="mt-3 text-center text-sm text-white/80">{active.caption}</p>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}

export function ProductGallery({ images, name, labels }: ProductGalleryProps) {
  const sorted = [...images].sort((a, b) => a.sortOrder - b.sortOrder);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const active = sorted[activeIndex] ?? sorted[0];

  const openLightbox = useCallback((index: number) => {
    setActiveIndex(index);
    setLightboxOpen(true);
  }, []);

  if (!active) return null;

  return (
    <section aria-label={labels.ariaLabel}>
      <button
        type="button"
        onClick={() => openLightbox(activeIndex)}
        className="group relative aspect-[16/10] w-full cursor-zoom-in overflow-hidden rounded-2xl bg-atg-surface dark:bg-atg-surface sm:aspect-[21/9]"
        aria-label={labels.openLightbox}
      >
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-[1.02]"
          style={{ backgroundImage: `url("${active.url}")` }}
          role="img"
          aria-label={active.caption ?? name}
        />
        {active.caption ? (
          <p className="absolute bottom-3 left-3 rounded-md bg-atg-fg/70 px-2 py-1 text-xs text-atg-elevated backdrop-blur-sm">
            {active.caption}
          </p>
        ) : null}
      </button>

      {sorted.length > 1 ? (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory [-webkit-overflow-scrolling:touch]">
          {sorted.map((img, index) => (
            <button
              key={img.id}
              type="button"
              onClick={() => {
                setActiveIndex(index);
                openLightbox(index);
              }}
              className={`relative h-[4.5rem] w-[5.5rem] shrink-0 snap-start overflow-hidden rounded-lg border-2 transition-colors sm:h-20 sm:w-28 ${
                index === activeIndex
                  ? 'border-primary ring-2 ring-primary/30'
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
      ) : null}

      {lightboxOpen ? (
        <GalleryLightbox
          images={sorted}
          name={name}
          index={activeIndex}
          labels={labels}
          onClose={() => setLightboxOpen(false)}
          onIndexChange={setActiveIndex}
        />
      ) : null}
    </section>
  );
}

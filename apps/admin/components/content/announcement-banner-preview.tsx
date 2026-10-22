'use client';

import type {
  AnnouncementBannerColor,
  AnnouncementBannerIntensity,
} from '@africatourismgate/types/organization-settings';

/** Keep in sync with apps/web/components/announcement-banner.tsx (full class strings for Tailwind). */
export const ANNOUNCEMENT_BANNER_PREVIEW_CLASSES: Record<
  AnnouncementBannerColor,
  Record<AnnouncementBannerIntensity, string>
> = {
  red: {
    high: 'bg-red-600 text-white',
    low: 'bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-100',
  },
  yellow: {
    high: 'bg-yellow-400 text-yellow-950',
    low: 'bg-yellow-100 text-yellow-900 dark:bg-yellow-950 dark:text-yellow-100',
  },
  green: {
    high: 'bg-green-700 text-white',
    low: 'bg-green-100 text-green-900 dark:bg-green-950 dark:text-green-100',
  },
  blue: {
    high: 'bg-blue-600 text-white',
    low: 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-100',
  },
  gray: {
    high: 'bg-gray-800 text-white dark:bg-gray-700',
    low: 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100',
  },
};

/** Swatch shown in the color picker (solid tone of each theme). */
export const ANNOUNCEMENT_BANNER_SWATCH_CLASSES: Record<AnnouncementBannerColor, string> = {
  red: 'bg-red-600',
  yellow: 'bg-yellow-400',
  green: 'bg-green-700',
  blue: 'bg-blue-600',
  gray: 'bg-gray-800',
};

type AnnouncementBannerPreviewProps = {
  text: string;
  color: AnnouncementBannerColor;
  intensity: AnnouncementBannerIntensity;
  ctaLabel?: string;
  emptyText: string;
  ariaLabel: string;
};

export function AnnouncementBannerPreview({
  text,
  color,
  intensity,
  ctaLabel,
  emptyText,
  ariaLabel,
}: AnnouncementBannerPreviewProps) {
  const trimmed = text.trim();
  return (
    <div
      aria-label={ariaLabel}
      className={`overflow-hidden rounded-lg border border-atg-border ${ANNOUNCEMENT_BANNER_PREVIEW_CLASSES[color][intensity]}`}
    >
      <div className="flex items-center gap-2 px-4 py-2">
        <p className="min-w-0 flex-1 text-center text-xs font-medium leading-snug sm:text-sm">
          {trimmed ? (
            <>
              <span>{trimmed}</span>
              {ctaLabel?.trim() ? (
                <span className="ml-2 font-semibold underline underline-offset-2">
                  {ctaLabel.trim()}
                </span>
              ) : null}
            </>
          ) : (
            <span className="italic opacity-70">{emptyText}</span>
          )}
        </p>
        <span aria-hidden className="inline-flex h-6 w-6 items-center justify-center opacity-70">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </span>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import type {
  AnnouncementBannerColor,
  AnnouncementBannerIntensity,
} from '@africatourismgate/types/organization-settings';
import { useAnnouncementBanner } from './announcement-banner-provider';

const DISMISS_STORAGE_KEY = 'atg-banner-dismissed';

type BannerTheme = { container: string; cta: string; dismiss: string };

/**
 * Full class strings (no interpolation) so Tailwind keeps them.
 * Yellow stays dark-on-light at high intensity: white on yellow fails WCAG contrast.
 */
export const ANNOUNCEMENT_BANNER_THEMES: Record<
  AnnouncementBannerColor,
  Record<AnnouncementBannerIntensity, BannerTheme>
> = {
  red: {
    high: {
      container: 'bg-red-600 text-white',
      cta: 'text-white decoration-white/70 hover:decoration-white',
      dismiss: 'text-white/80 hover:bg-white/15 hover:text-white focus-visible:ring-white',
    },
    low: {
      container: 'bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-100',
      cta: 'text-red-900 decoration-red-900/50 hover:decoration-red-900 dark:text-red-100 dark:decoration-red-100/60',
      dismiss:
        'text-red-800 hover:bg-red-200 focus-visible:ring-red-700 dark:text-red-200 dark:hover:bg-red-900',
    },
  },
  yellow: {
    high: {
      container: 'bg-yellow-400 text-yellow-950',
      cta: 'text-yellow-950 decoration-yellow-950/60 hover:decoration-yellow-950',
      dismiss: 'text-yellow-900 hover:bg-yellow-300 focus-visible:ring-yellow-900',
    },
    low: {
      container: 'bg-yellow-100 text-yellow-900 dark:bg-yellow-950 dark:text-yellow-100',
      cta: 'text-yellow-900 decoration-yellow-900/50 hover:decoration-yellow-900 dark:text-yellow-100 dark:decoration-yellow-100/60',
      dismiss:
        'text-yellow-800 hover:bg-yellow-200 focus-visible:ring-yellow-700 dark:text-yellow-200 dark:hover:bg-yellow-900',
    },
  },
  green: {
    high: {
      container: 'bg-green-700 text-white',
      cta: 'text-white decoration-white/70 hover:decoration-white',
      dismiss: 'text-white/80 hover:bg-white/15 hover:text-white focus-visible:ring-white',
    },
    low: {
      container: 'bg-green-100 text-green-900 dark:bg-green-950 dark:text-green-100',
      cta: 'text-green-900 decoration-green-900/50 hover:decoration-green-900 dark:text-green-100 dark:decoration-green-100/60',
      dismiss:
        'text-green-800 hover:bg-green-200 focus-visible:ring-green-700 dark:text-green-200 dark:hover:bg-green-900',
    },
  },
  blue: {
    high: {
      container: 'bg-blue-600 text-white',
      cta: 'text-white decoration-white/70 hover:decoration-white',
      dismiss: 'text-white/80 hover:bg-white/15 hover:text-white focus-visible:ring-white',
    },
    low: {
      container: 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-100',
      cta: 'text-blue-900 decoration-blue-900/50 hover:decoration-blue-900 dark:text-blue-100 dark:decoration-blue-100/60',
      dismiss:
        'text-blue-800 hover:bg-blue-200 focus-visible:ring-blue-700 dark:text-blue-200 dark:hover:bg-blue-900',
    },
  },
  gray: {
    high: {
      container: 'bg-gray-800 text-white dark:bg-gray-700',
      cta: 'text-white decoration-white/70 hover:decoration-white',
      dismiss: 'text-white/80 hover:bg-white/15 hover:text-white focus-visible:ring-white',
    },
    low: {
      container: 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100',
      cta: 'text-gray-900 decoration-gray-900/50 hover:decoration-gray-900 dark:text-gray-100 dark:decoration-gray-100/60',
      dismiss:
        'text-gray-700 hover:bg-gray-200 focus-visible:ring-gray-600 dark:text-gray-300 dark:hover:bg-gray-700',
    },
  },
};

export type AnnouncementBannerProps = {
  text: string;
  isVisible: boolean;
  themeColor: AnnouncementBannerColor;
  intensity: AnnouncementBannerIntensity;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  ctaNewTab?: boolean;
  regionLabel: string;
  newTabHint?: string;
  dismissLabel?: string;
  onDismiss?: () => void;
};

const MARQUEE_PX_PER_SECOND = 40;
const MARQUEE_MIN_SECONDS = 6;
const MARQUEE_MAX_SECONDS = 40;

function BannerMessage({
  text,
  ctaLabel,
  ctaUrl,
  ctaNewTab,
  ctaClass,
  newTabHint,
}: {
  text: string;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  ctaNewTab?: boolean;
  ctaClass: string;
  newTabHint?: string;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLParagraphElement>(null);
  const [overflowPx, setOverflowPx] = useState(0);

  const showCta = Boolean(ctaLabel && ctaUrl);
  const ctaContent = (
    <>
      {ctaLabel}
      {ctaNewTab && newTabHint ? <span className="sr-only"> ({newTabHint})</span> : null}
    </>
  );

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const measure = () => {
      const overflow = Math.max(0, Math.ceil(track.scrollWidth - viewport.clientWidth));
      setOverflowPx(overflow);
    };

    measure();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(track);
    return () => observer.disconnect();
  }, [text, ctaLabel, ctaUrl, ctaNewTab]);

  const scrolling = overflowPx > 4;
  const durationSec = scrolling
    ? Math.min(
        MARQUEE_MAX_SECONDS,
        Math.max(MARQUEE_MIN_SECONDS, (overflowPx * 2) / MARQUEE_PX_PER_SECOND + 3),
      )
    : 0;

  return (
    <div ref={viewportRef} className="min-w-0 flex-1 overflow-hidden">
      <p
        ref={trackRef}
        title={scrolling ? text : undefined}
        className={`inline-flex max-w-none items-center whitespace-nowrap text-xs font-medium leading-none sm:text-sm ${
          scrolling ? 'atg-banner-marquee' : 'w-full justify-center'
        }`}
        style={
          scrolling
            ? ({
                '--atg-banner-overflow': `${overflowPx}px`,
                '--atg-banner-duration': `${durationSec}s`,
              } as CSSProperties)
            : undefined
        }
      >
        <span>{text}</span>
        {showCta ? (
          ctaUrl!.startsWith('/') && !ctaNewTab ? (
            <Link href={ctaUrl!} className={ctaClass}>
              {ctaContent}
            </Link>
          ) : (
            <a
              href={ctaUrl!}
              className={ctaClass}
              {...(ctaNewTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              {ctaContent}
            </a>
          )
        ) : null}
      </p>
    </div>
  );
}

export function AnnouncementBanner({
  text,
  isVisible,
  themeColor,
  intensity,
  ctaLabel,
  ctaUrl,
  ctaNewTab = false,
  regionLabel,
  newTabHint,
  dismissLabel,
  onDismiss,
}: AnnouncementBannerProps) {
  if (!isVisible || !text.trim()) return null;

  const theme = ANNOUNCEMENT_BANNER_THEMES[themeColor][intensity];
  const ctaClass = `ml-2 inline-block whitespace-nowrap font-semibold underline underline-offset-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-1 rounded-sm ${theme.cta}`;

  return (
    <div
      role="region"
      aria-label={regionLabel}
      data-color={themeColor}
      data-intensity={intensity}
      className={`banner--${themeColor}-${intensity} ${theme.container}`}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-2 sm:px-6 lg:px-8">
        <BannerMessage
          text={text}
          ctaLabel={ctaLabel}
          ctaUrl={ctaUrl}
          ctaNewTab={ctaNewTab}
          ctaClass={ctaClass}
          newTabHint={newTabHint}
        />
        {onDismiss && dismissLabel ? (
          <button
            type="button"
            onClick={onDismiss}
            aria-label={dismissLabel}
            className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 ${theme.dismiss}`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        ) : null}
      </div>
    </div>
  );
}

function readDismissedVersion(): string | null {
  try {
    return window.sessionStorage.getItem(DISMISS_STORAGE_KEY);
  } catch {
    return null;
  }
}

/** Banner configured in the admin (Contenu › Site), dismissible for the browser session. */
export function SiteAnnouncementBanner() {
  const banner = useAnnouncementBanner();
  const t = useTranslations('announcement');
  const [dismissed, setDismissed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDismissed(Boolean(banner.version) && readDismissedVersion() === banner.version);
  }, [banner.version]);

  const visible = banner.enabled && !dismissed;

  useEffect(() => {
    const root = document.documentElement;
    const node = containerRef.current;
    if (!visible || !node) {
      root.style.removeProperty('--atg-banner-h');
      return;
    }
    const sync = () => root.style.setProperty('--atg-banner-h', `${node.offsetHeight}px`);
    sync();
    if (typeof ResizeObserver === 'undefined') {
      return () => root.style.removeProperty('--atg-banner-h');
    }
    const observer = new ResizeObserver(sync);
    observer.observe(node);
    return () => {
      observer.disconnect();
      root.style.removeProperty('--atg-banner-h');
    };
  }, [visible]);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    try {
      window.sessionStorage.setItem(DISMISS_STORAGE_KEY, banner.version);
    } catch {
      // Storage unavailable (private mode): dismissal only lasts for this page view.
    }
  }, [banner.version]);

  if (!visible) return null;

  return (
    <div ref={containerRef}>
      <AnnouncementBanner
        text={banner.text}
        isVisible={visible}
        themeColor={banner.color}
        intensity={banner.intensity}
        ctaLabel={banner.ctaLabel}
        ctaUrl={banner.ctaUrl}
        ctaNewTab={banner.ctaNewTab}
        regionLabel={t('regionLabel')}
        newTabHint={t('opensInNewTab')}
        dismissLabel={t('dismiss')}
        onDismiss={handleDismiss}
      />
    </div>
  );
}

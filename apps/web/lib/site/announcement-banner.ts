import {
  DEFAULT_PUBLIC_ANNOUNCEMENT_BANNER,
  isAnnouncementBannerColor,
  isAnnouncementBannerIntensity,
  type PublicAnnouncementBanner,
} from '@africatourismgate/types/organization-settings';

const defaultApiUrl =
  process.env.NODE_ENV === 'production'
    ? 'https://app-africatourismgate.org/api'
    : 'http://localhost:3000/api';
const apiUrl = (process.env.NEXT_PUBLIC_API_URL ?? defaultApiUrl).replace(/\/$/, '');

function disabledBanner(): PublicAnnouncementBanner {
  return { ...DEFAULT_PUBLIC_ANNOUNCEMENT_BANNER };
}

/** Never throws: any API failure hides the banner rather than breaking the layout. */
export function parsePublicAnnouncementBanner(payload: unknown): PublicAnnouncementBanner {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return disabledBanner();
  }
  const raw = payload as Partial<PublicAnnouncementBanner>;
  const text = typeof raw.text === 'string' ? raw.text.trim() : '';
  if (raw.enabled !== true || !text) {
    return disabledBanner();
  }
  const ctaUrl = typeof raw.ctaUrl === 'string' && raw.ctaUrl.trim() ? raw.ctaUrl.trim() : null;
  const ctaLabel =
    ctaUrl && typeof raw.ctaLabel === 'string' && raw.ctaLabel.trim()
      ? raw.ctaLabel.trim()
      : null;
  return {
    enabled: true,
    text,
    color: isAnnouncementBannerColor(raw.color)
      ? raw.color
      : DEFAULT_PUBLIC_ANNOUNCEMENT_BANNER.color,
    intensity: isAnnouncementBannerIntensity(raw.intensity)
      ? raw.intensity
      : DEFAULT_PUBLIC_ANNOUNCEMENT_BANNER.intensity,
    ctaLabel,
    ctaUrl: ctaLabel ? ctaUrl : null,
    ctaNewTab: ctaLabel ? raw.ctaNewTab === true : false,
    version: typeof raw.version === 'string' ? raw.version : '',
  };
}

export async function getPublicAnnouncementBanner(
  locale: string,
): Promise<PublicAnnouncementBanner> {
  try {
    const params = new URLSearchParams({ locale });
    const response = await fetch(
      `${apiUrl}/organization-settings/public/announcement-banner?${params}`,
      { cache: 'no-store' },
    );
    if (!response.ok) return disabledBanner();
    return parsePublicAnnouncementBanner(await response.json());
  } catch {
    return disabledBanner();
  }
}

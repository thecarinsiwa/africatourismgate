import type { PublicFooter } from '@africatourismgate/types/organization-settings';

const defaultApiUrl =
  process.env.NODE_ENV === 'production'
    ? 'https://app-africatourismgate.org/api'
    : 'http://localhost:3000/api';
const apiUrl = (process.env.NEXT_PUBLIC_API_URL ?? defaultApiUrl).replace(/\/$/, '');

/** Never throws: returns null when the endpoint is unavailable. */
export function parsePublicFooter(payload: unknown): PublicFooter | null {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return null;
  }
  const raw = payload as Partial<PublicFooter>;
  const tagline = typeof raw.tagline === 'string' ? raw.tagline.trim() : '';
  const newsletterDesc =
    typeof raw.newsletterDesc === 'string' ? raw.newsletterDesc.trim() : '';
  const designedByNames =
    typeof raw.designedByNames === 'string' ? raw.designedByNames.trim() : '';
  if (!tagline && !newsletterDesc && !designedByNames) {
    return null;
  }
  return { tagline, newsletterDesc, designedByNames };
}

export async function getPublicFooter(locale: string): Promise<PublicFooter | null> {
  try {
    const params = new URLSearchParams({ locale });
    const response = await fetch(
      `${apiUrl}/organization-settings/public/footer?${params}`,
      {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      },
    );
    if (!response.ok) return null;
    return parsePublicFooter(await response.json());
  } catch {
    return null;
  }
}

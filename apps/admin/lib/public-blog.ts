import type { PaginatedResponse, PublicBlogPostListItem } from '@africatourismgate/types';
import { resolveApiBaseUrl } from './auth/api';

export async function fetchRecentPublicBlogPosts(
  limit = 4,
  locale?: string,
): Promise<PublicBlogPostListItem[]> {
  const qs = new URLSearchParams({ limit: String(limit), page: '1' });
  if (locale) qs.set('locale', locale);

  try {
    const response = await fetch(`${resolveApiBaseUrl()}/public/blog?${qs}`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!response.ok) return [];
    const payload = (await response.json()) as PaginatedResponse<PublicBlogPostListItem>;
    return payload.data ?? [];
  } catch {
    return [];
  }
}

export async function fetchRecentPublicBlogPostsForLocale(
  locale: string,
  limit = 4,
): Promise<PublicBlogPostListItem[]> {
  const localized = await fetchRecentPublicBlogPosts(limit, locale);
  if (localized.length > 0) return localized;
  return fetchRecentPublicBlogPosts(limit);
}

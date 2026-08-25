import type { PublicBlogPostListItem } from '@africatourismgate/types';
import { applyBlogListLocaleFallback } from './fallback-posts';

const LOCALE_ORDER = ['fr', 'en', 'es'] as const;

export function blogLocaleOrder(locale?: string): string[] {
  if (!locale) return [...LOCALE_ORDER];
  const normalized = locale.trim().toLowerCase();
  return [normalized, ...LOCALE_ORDER.filter((code) => code !== normalized)];
}

/** Groups translations — uses translationKey when present, else publishedAt. */
export function blogTranslationGroupKey(
  post: Pick<PublicBlogPostListItem, 'translationKey' | 'publishedAt' | 'id'>,
): string {
  return post.translationKey?.trim() || post.publishedAt || post.id;
}

export function pickBlogPostForLocale<T extends PublicBlogPostListItem>(
  siblings: T[],
  locale?: string,
): T | null {
  if (siblings.length === 0) return null;
  for (const code of blogLocaleOrder(locale)) {
    const match = siblings.find((post) => post.locale === code);
    if (match) return match;
  }
  return siblings[0] ?? null;
}

export function localizeBlogPosts<T extends PublicBlogPostListItem>(
  posts: T[],
  locale?: string,
): { data: T[]; usedLocaleFallback: boolean } {
  const groups = new Map<string, T[]>();
  for (const post of posts) {
    const key = blogTranslationGroupKey(post);
    const bucket = groups.get(key) ?? [];
    bucket.push(post);
    groups.set(key, bucket);
  }

  const data = Array.from(groups.values())
    .map((siblings) => pickBlogPostForLocale(siblings, locale))
    .filter((post): post is T => post !== null)
    .map((post) => applyBlogListLocaleFallback(post, locale))
    .sort((a, b) => {
      const aTime = a.publishedAt ? Date.parse(a.publishedAt) : 0;
      const bTime = b.publishedAt ? Date.parse(b.publishedAt) : 0;
      return bTime - aTime;
    });

  return { data, usedLocaleFallback: false };
}

export function findBlogSiblings<T extends PublicBlogPostListItem>(
  posts: T[],
  anchor: Pick<PublicBlogPostListItem, 'translationKey' | 'publishedAt' | 'id'>,
): T[] {
  const key = blogTranslationGroupKey(anchor);
  return posts.filter((post) => blogTranslationGroupKey(post) === key);
}

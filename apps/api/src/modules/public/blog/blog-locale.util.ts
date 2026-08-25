import type { BlogPosts } from '../../../entities/blog-post.entity';

export const BLOG_LOCALE_ORDER = ['fr', 'en', 'es'] as const;

export function blogLocaleFallbackOrder(locale?: string): string[] {
  if (!locale) return [...BLOG_LOCALE_ORDER];
  const normalized = locale.trim().toLowerCase();
  return [normalized, ...BLOG_LOCALE_ORDER.filter((code) => code !== normalized)];
}

/** Pick the best published translation for a group of sibling posts. */
export function pickBlogPostForLocale(
  siblings: BlogPosts[],
  locale?: string,
): BlogPosts | null {
  if (siblings.length === 0) return null;
  for (const code of blogLocaleFallbackOrder(locale)) {
    const match = siblings.find((post) => post.locale === code);
    if (match) return match;
  }
  return siblings[0] ?? null;
}

export function groupBlogPostsByTranslationKey(posts: BlogPosts[]): Map<string, BlogPosts[]> {
  const groups = new Map<string, BlogPosts[]>();
  for (const post of posts) {
    const key = post.translationKey?.trim() || post.slug;
    const bucket = groups.get(key) ?? [];
    bucket.push(post);
    groups.set(key, bucket);
  }
  return groups;
}

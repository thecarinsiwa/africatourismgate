export const BLOG_VIEW_MODES = ['grid', 'compact', 'table'] as const;

export type BlogViewMode = (typeof BLOG_VIEW_MODES)[number];

export const BLOG_VIEW_MODE_STORAGE_KEY = 'blog.viewMode';

export const DEFAULT_BLOG_VIEW_MODE: BlogViewMode = 'grid';

export function isBlogViewMode(value: unknown): value is BlogViewMode {
  return typeof value === 'string' && (BLOG_VIEW_MODES as readonly string[]).includes(value);
}

const STORAGE_KEY = 'atg_blog_visitor_key';

function createVisitorKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
}

/** Stable anonymous id for blog reactions / comments (localStorage). */
export function getBlogVisitorKey(): string {
  if (typeof window === 'undefined') return '';
  try {
    const existing = window.localStorage.getItem(STORAGE_KEY)?.trim();
    if (existing && existing.length >= 8) return existing;
    const next = createVisitorKey();
    window.localStorage.setItem(STORAGE_KEY, next);
    return next;
  } catch {
    return createVisitorKey();
  }
}

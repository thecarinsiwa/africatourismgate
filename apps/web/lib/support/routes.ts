export const SUPPORT_BASE_PATH = '/support';

export function supportCategoryPath(categorySlug: string): string {
  return `${SUPPORT_BASE_PATH}/${categorySlug}`;
}

export function supportArticlePath(
  categorySlug: string,
  articleSlug: string,
): string {
  return `${SUPPORT_BASE_PATH}/${categorySlug}/${articleSlug}`;
}

export function normalizeSupportPathname(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export function parseSupportPathname(pathname: string): {
  categorySlug?: string;
  articleSlug?: string;
} {
  const normalized = normalizeSupportPathname(pathname);
  if (normalized === SUPPORT_BASE_PATH) {
    return {};
  }

  const prefix = `${SUPPORT_BASE_PATH}/`;
  if (!normalized.startsWith(prefix)) {
    return {};
  }

  const segments = normalized.slice(prefix.length).split('/').filter(Boolean);
  if (segments.length === 1) {
    return { categorySlug: segments[0] };
  }
  if (segments.length >= 2) {
    return { categorySlug: segments[0], articleSlug: segments[1] };
  }
  return {};
}

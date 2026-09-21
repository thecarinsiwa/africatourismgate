export const ADMIN_HELP_BASE_PATH = '/aide';

export function adminHelpHref(): string {
  return ADMIN_HELP_BASE_PATH;
}

export function adminHelpCategoryPath(categorySlug: string): string {
  return `${ADMIN_HELP_BASE_PATH}/${categorySlug}`;
}

export function adminHelpArticlePath(
  categorySlug: string,
  articleSlug: string,
): string {
  return `${ADMIN_HELP_BASE_PATH}/${categorySlug}/${articleSlug}`;
}

export function normalizeAdminHelpPathname(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export function parseAdminHelpPathname(pathname: string): {
  categorySlug?: string;
  articleSlug?: string;
} {
  const normalized = normalizeAdminHelpPathname(pathname);
  if (normalized === ADMIN_HELP_BASE_PATH) {
    return {};
  }

  const prefix = `${ADMIN_HELP_BASE_PATH}/`;
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

import {
  getArticleBySlug,
  type HelpCategorySlug,
} from './help-catalog';
import {
  SUPPORT_BASE_PATH,
  supportArticlePath,
} from './routes';

/**
 * Recommended help article for a public pathname prefix.
 * More specific prefixes win (longest-prefix match).
 */
export type WebContextualHelpTarget = {
  categorySlug: HelpCategorySlug;
  articleSlug: string;
};

type ContextualHelpRule = {
  prefix: string;
  categorySlug: HelpCategorySlug;
  articleSlug: string;
};

const CONTEXTUAL_HELP_RULES: readonly ContextualHelpRule[] = [
  // Account (specific before /account)
  {
    prefix: '/account/reservations',
    categorySlug: 'booking',
    articleSlug: 'find-booking',
  },
  {
    prefix: '/account/payment-methods',
    categorySlug: 'payment',
    articleSlug: 'saved-cards',
  },
  {
    prefix: '/account/addresses',
    categorySlug: 'account',
    articleSlug: 'manage-addresses',
  },
  {
    prefix: '/account/loyalty',
    categorySlug: 'account',
    articleSlug: 'onekey-loyalty',
  },
  {
    prefix: '/account/profile',
    categorySlug: 'account',
    articleSlug: 'update-profile',
  },
  {
    prefix: '/account',
    categorySlug: 'account',
    articleSlug: 'update-profile',
  },

  // Booking checkout & auth
  {
    prefix: '/booking/cart',
    categorySlug: 'booking',
    articleSlug: 'cart-and-checkout',
  },
  {
    prefix: '/booking/recap',
    categorySlug: 'payment',
    articleSlug: 'payment-methods',
  },
  {
    prefix: '/booking/success',
    categorySlug: 'booking',
    articleSlug: 'confirmation-email',
  },
  {
    prefix: '/booking/request-success',
    categorySlug: 'booking',
    articleSlug: 'request-vs-paid',
  },
  {
    prefix: '/booking/cancel',
    categorySlug: 'cancellation',
    articleSlug: 'cancellation-policy',
  },
  {
    prefix: '/booking/login',
    categorySlug: 'account',
    articleSlug: 'password-security',
  },
  {
    prefix: '/booking/register',
    categorySlug: 'account',
    articleSlug: 'password-security',
  },
];

function normalizePathname(pathname: string): string {
  const withoutQuery = pathname.split('?')[0]?.split('#')[0] ?? pathname;
  if (withoutQuery.length > 1 && withoutQuery.endsWith('/')) {
    return withoutQuery.slice(0, -1);
  }
  return withoutQuery || '/';
}

function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

/**
 * Resolve the best help article for the current public pathname.
 * Returns `null` on `/support` (and unknown routes) so callers fall back to the hub.
 */
export function resolveWebContextualHelp(
  pathname: string,
): WebContextualHelpTarget | null {
  const normalized = normalizePathname(pathname);

  if (
    normalized === SUPPORT_BASE_PATH ||
    normalized.startsWith(`${SUPPORT_BASE_PATH}/`)
  ) {
    return null;
  }

  let best: ContextualHelpRule | null = null;

  for (const rule of CONTEXTUAL_HELP_RULES) {
    if (!matchesPrefix(normalized, rule.prefix)) {
      continue;
    }
    if (!best || rule.prefix.length > best.prefix.length) {
      best = rule;
    }
  }

  if (!best) {
    return null;
  }

  const article = getArticleBySlug(best.articleSlug);
  if (!article || article.categorySlug !== best.categorySlug) {
    return null;
  }

  return {
    categorySlug: best.categorySlug,
    articleSlug: best.articleSlug,
  };
}

/** Href to the contextual article, or the hub `/support` if none. */
export function getWebContextualHelpHref(pathname: string): string {
  const target = resolveWebContextualHelp(pathname);
  if (!target) {
    return SUPPORT_BASE_PATH;
  }
  return supportArticlePath(target.categorySlug, target.articleSlug);
}

/** Exported for tests / docs — ordered rules with longest-prefix matching. */
export function getWebContextualHelpRules(): readonly ContextualHelpRule[] {
  return CONTEXTUAL_HELP_RULES;
}

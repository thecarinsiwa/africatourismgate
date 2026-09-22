/**
 * Local help-center catalog (CMS-ready shape).
 * Structural metadata lives here; titles/summaries/bodies live in i18n messages
 * under `support.help.categories.*` / `support.help.articles.*`.
 */

import { stripWebHelpMarkdownLinks } from './web-path-links';

export const HELP_CATEGORY_SLUGS = [
  'booking',
  'payment',
  'cancellation',
  'account',
  'contact',
] as const;

export type HelpCategorySlug = (typeof HELP_CATEGORY_SLUGS)[number];

export const HELP_ICONS = [
  'calendar',
  'card',
  'user',
  'shield',
  'message',
] as const;

export type HelpIcon = (typeof HELP_ICONS)[number];

export type HelpCategory = {
  id: string;
  slug: HelpCategorySlug;
  icon: HelpIcon;
  articleSlugs: readonly string[];
};

export type HelpArticle = {
  id: string;
  slug: string;
  categorySlug: HelpCategorySlug;
  popular?: boolean;
  relatedSlugs?: readonly string[];
};

/** Locale strings used by client-side search (from next-intl). */
export type HelpArticleSearchStrings = {
  title: string;
  summary: string;
  body?: string;
};

export const HELP_CATEGORIES: readonly HelpCategory[] = [
  {
    id: 'cat-booking',
    slug: 'booking',
    icon: 'calendar',
    articleSlugs: [
      'how-to-book',
      'cart-and-checkout',
      'request-vs-paid',
      'modify-or-cancel',
      'find-booking',
      'confirmation-email',
      'booking-chat',
    ],
  },
  {
    id: 'cat-payment',
    slug: 'payment',
    icon: 'card',
    articleSlugs: [
      'payment-methods',
      'offline-payments',
      'saved-cards',
      'invoice-receipt',
      'failed-payment',
    ],
  },
  {
    id: 'cat-cancellation',
    slug: 'cancellation',
    icon: 'shield',
    articleSlugs: ['cancellation-policy', 'refund-timeline'],
  },
  {
    id: 'cat-account',
    slug: 'account',
    icon: 'user',
    articleSlugs: [
      'update-profile',
      'manage-addresses',
      'password-security',
      'onekey-loyalty',
      'passenger-manifest',
      'leave-a-review',
    ],
  },
  {
    id: 'cat-contact',
    slug: 'contact',
    icon: 'message',
    articleSlugs: ['response-time', 'how-to-contact'],
  },
] as const;

export const HELP_ARTICLES: readonly HelpArticle[] = [
  {
    id: 'art-how-to-book',
    slug: 'how-to-book',
    categorySlug: 'booking',
    popular: true,
    relatedSlugs: ['cart-and-checkout', 'request-vs-paid', 'payment-methods'],
  },
  {
    id: 'art-cart-and-checkout',
    slug: 'cart-and-checkout',
    categorySlug: 'booking',
    relatedSlugs: ['how-to-book', 'payment-methods', 'request-vs-paid'],
  },
  {
    id: 'art-request-vs-paid',
    slug: 'request-vs-paid',
    categorySlug: 'booking',
    relatedSlugs: ['how-to-book', 'cart-and-checkout', 'confirmation-email'],
  },
  {
    id: 'art-modify-or-cancel',
    slug: 'modify-or-cancel',
    categorySlug: 'booking',
    popular: true,
    relatedSlugs: ['find-booking', 'cancellation-policy', 'booking-chat'],
  },
  {
    id: 'art-find-booking',
    slug: 'find-booking',
    categorySlug: 'booking',
    relatedSlugs: ['modify-or-cancel', 'confirmation-email', 'booking-chat'],
  },
  {
    id: 'art-confirmation-email',
    slug: 'confirmation-email',
    categorySlug: 'booking',
    relatedSlugs: ['find-booking', 'request-vs-paid', 'how-to-contact'],
  },
  {
    id: 'art-booking-chat',
    slug: 'booking-chat',
    categorySlug: 'booking',
    relatedSlugs: ['find-booking', 'how-to-contact', 'modify-or-cancel'],
  },
  {
    id: 'art-payment-methods',
    slug: 'payment-methods',
    categorySlug: 'payment',
    popular: true,
    relatedSlugs: [
      'offline-payments',
      'saved-cards',
      'invoice-receipt',
      'cart-and-checkout',
    ],
  },
  {
    id: 'art-offline-payments',
    slug: 'offline-payments',
    categorySlug: 'payment',
    relatedSlugs: ['payment-methods', 'request-vs-paid', 'failed-payment'],
  },
  {
    id: 'art-saved-cards',
    slug: 'saved-cards',
    categorySlug: 'payment',
    relatedSlugs: ['payment-methods', 'password-security', 'cart-and-checkout'],
  },
  {
    id: 'art-invoice-receipt',
    slug: 'invoice-receipt',
    categorySlug: 'payment',
    relatedSlugs: ['payment-methods', 'offline-payments'],
  },
  {
    id: 'art-failed-payment',
    slug: 'failed-payment',
    categorySlug: 'payment',
    relatedSlugs: ['payment-methods', 'offline-payments', 'how-to-contact'],
  },
  {
    id: 'art-cancellation-policy',
    slug: 'cancellation-policy',
    categorySlug: 'cancellation',
    popular: true,
    relatedSlugs: ['refund-timeline', 'modify-or-cancel'],
  },
  {
    id: 'art-refund-timeline',
    slug: 'refund-timeline',
    categorySlug: 'cancellation',
    relatedSlugs: ['cancellation-policy', 'response-time'],
  },
  {
    id: 'art-update-profile',
    slug: 'update-profile',
    categorySlug: 'account',
    popular: true,
    relatedSlugs: ['manage-addresses', 'password-security', 'onekey-loyalty'],
  },
  {
    id: 'art-manage-addresses',
    slug: 'manage-addresses',
    categorySlug: 'account',
    relatedSlugs: ['update-profile', 'passenger-manifest'],
  },
  {
    id: 'art-password-security',
    slug: 'password-security',
    categorySlug: 'account',
    relatedSlugs: ['update-profile', 'saved-cards', 'how-to-contact'],
  },
  {
    id: 'art-onekey-loyalty',
    slug: 'onekey-loyalty',
    categorySlug: 'account',
    relatedSlugs: ['update-profile', 'find-booking', 'how-to-book'],
  },
  {
    id: 'art-passenger-manifest',
    slug: 'passenger-manifest',
    categorySlug: 'account',
    relatedSlugs: ['find-booking', 'manage-addresses', 'booking-chat'],
  },
  {
    id: 'art-leave-a-review',
    slug: 'leave-a-review',
    categorySlug: 'account',
    relatedSlugs: ['find-booking', 'onekey-loyalty', 'booking-chat'],
  },
  {
    id: 'art-response-time',
    slug: 'response-time',
    categorySlug: 'contact',
    relatedSlugs: ['how-to-contact'],
  },
  {
    id: 'art-how-to-contact',
    slug: 'how-to-contact',
    categorySlug: 'contact',
    relatedSlugs: ['response-time', 'booking-chat', 'modify-or-cancel'],
  },
] as const;

const categoriesBySlug = new Map(
  HELP_CATEGORIES.map((category) => [category.slug, category]),
);

const articlesBySlug = new Map(
  HELP_ARTICLES.map((article) => [article.slug, article]),
);

function normalizeSearchQuery(query: string): string {
  return query
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function matchesSearch(
  haystack: string,
  normalizedQuery: string,
): boolean {
  const normalized = normalizeSearchQuery(haystack);
  return normalized.includes(normalizedQuery);
}

export function getHelpCategories(): readonly HelpCategory[] {
  return HELP_CATEGORIES;
}

export function getCategoryBySlug(
  slug: string,
): HelpCategory | undefined {
  return categoriesBySlug.get(slug as HelpCategorySlug);
}

export function getArticleBySlug(slug: string): HelpArticle | undefined {
  return articlesBySlug.get(slug);
}

export function getArticlesByCategory(
  categorySlug: string,
): HelpArticle[] {
  const category = getCategoryBySlug(categorySlug);
  if (!category) {
    return [];
  }
  return category.articleSlugs
    .map((slug) => articlesBySlug.get(slug))
    .filter((article): article is HelpArticle => article !== undefined);
}

export function getPopularArticles(): HelpArticle[] {
  return HELP_ARTICLES.filter((article) => article.popular === true);
}

export function getRelatedArticles(article: HelpArticle): HelpArticle[] {
  if (!article.relatedSlugs?.length) {
    return [];
  }
  return article.relatedSlugs
    .map((slug) => articlesBySlug.get(slug))
    .filter((related): related is HelpArticle => related !== undefined);
}

/**
 * Client-side search over localized title/summary/body.
 * Pass strings keyed by article slug (from i18n).
 */
export function searchHelpArticles(
  query: string,
  stringsBySlug: Readonly<Record<string, HelpArticleSearchStrings>>,
): HelpArticle[] {
  const normalizedQuery = normalizeSearchQuery(query);
  if (!normalizedQuery) {
    return [];
  }

  return HELP_ARTICLES.filter((article) => {
    const strings = stringsBySlug[article.slug];
    if (!strings) {
      return false;
    }
    const searchableBody =
      strings.body !== undefined
        ? stripWebHelpMarkdownLinks(strings.body)
        : undefined;
    return (
      matchesSearch(strings.title, normalizedQuery) ||
      matchesSearch(strings.summary, normalizedQuery) ||
      (searchableBody !== undefined &&
        matchesSearch(searchableBody, normalizedQuery))
    );
  });
}

/** Params for `generateStaticParams` on category routes. */
export function getHelpCategoryStaticParams(): { category: string }[] {
  return HELP_CATEGORIES.map((category) => ({ category: category.slug }));
}

/** Params for `generateStaticParams` on article routes. */
export function getHelpArticleStaticParams(): {
  category: string;
  slug: string;
}[] {
  return HELP_ARTICLES.map((article) => ({
    category: article.categorySlug,
    slug: article.slug,
  }));
}

export function isValidHelpCategorySlug(slug: string): slug is HelpCategorySlug {
  return categoriesBySlug.has(slug as HelpCategorySlug);
}

export function isValidHelpArticlePath(
  categorySlug: string,
  articleSlug: string,
): boolean {
  const article = getArticleBySlug(articleSlug);
  return (
    article !== undefined &&
    article.categorySlug === categorySlug &&
    isValidHelpCategorySlug(categorySlug)
  );
}

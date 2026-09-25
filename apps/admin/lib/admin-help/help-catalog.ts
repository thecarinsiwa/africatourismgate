/**
 * Admin help-center catalog (static, CMS-ready shape).
 * Structural metadata lives here; titles/summaries/bodies live in i18n under
 * `modules.adminHelp.categories.*` / `modules.adminHelp.articles.*`.
 * No database — articles document how to use the admin panel.
 */

export const ADMIN_HELP_CATEGORY_SLUGS = [
  'prise-en-main',
  'utilisateurs-acces',
  'produits-voyage',
  'reservations-guides',
  'paiements-promos',
  'gap',
  'contenu-relation',
  'fidelite',
  'systeme',
] as const;

export type AdminHelpCategorySlug = (typeof ADMIN_HELP_CATEGORY_SLUGS)[number];

export const ADMIN_HELP_ICONS = [
  'rocket',
  'users',
  'package',
  'bookings',
  'payments',
  'globe',
  'headset',
  'gift',
  'settings',
] as const;

export type AdminHelpIcon = (typeof ADMIN_HELP_ICONS)[number];

export type AdminHelpCategory = {
  id: string;
  slug: AdminHelpCategorySlug;
  icon: AdminHelpIcon;
  articleSlugs: readonly string[];
};

export type AdminHelpArticle = {
  id: string;
  slug: string;
  categorySlug: AdminHelpCategorySlug;
  popular?: boolean;
  relatedSlugs?: readonly string[];
};

/** Locale strings used by client-side search (from next-intl). */
export type AdminHelpArticleSearchStrings = {
  title: string;
  summary: string;
  body?: string;
};

export const ADMIN_HELP_CATEGORIES: readonly AdminHelpCategory[] = [
  {
    id: 'cat-prise-en-main',
    slug: 'prise-en-main',
    icon: 'rocket',
    articleSlugs: [
      'naviguer-dans-le-dashboard',
      'notifications',
      'palette-commandes',
      'raccourcis-clavier',
    ],
  },
  {
    id: 'cat-utilisateurs-acces',
    slug: 'utilisateurs-acces',
    icon: 'users',
    articleSlugs: [
      'gerer-les-utilisateurs',
      'employes-et-departements',
      'sessions-et-securite',
      'adresses-et-moyens-paiement',
    ],
  },
  {
    id: 'cat-produits-voyage',
    slug: 'produits-voyage',
    icon: 'package',
    articleSlugs: [
      'hebergements',
      'vols-locations-croisieres',
      'activites-et-forfaits',
      'destinations',
    ],
  },
  {
    id: 'cat-reservations-guides',
    slug: 'reservations-guides',
    icon: 'bookings',
    articleSlugs: ['gerer-les-reservations', 'guides-et-calendrier'],
  },
  {
    id: 'cat-paiements-promos',
    slug: 'paiements-promos',
    icon: 'payments',
    articleSlugs: [
      'suivre-les-paiements',
      'codes-promo',
      'promotions',
    ],
  },
  {
    id: 'cat-gap',
    slug: 'gap',
    icon: 'globe',
    articleSlugs: [
      'parametres-gap',
      'pages-et-activites-gap',
      'impact-et-medias-gap',
    ],
  },
  {
    id: 'cat-contenu-relation',
    slug: 'contenu-relation',
    icon: 'headset',
    articleSlugs: [
      'blog-et-site',
      'pages-legales',
      'moderer-les-avis',
      'tickets-support-clients',
    ],
  },
  {
    id: 'cat-fidelite',
    slug: 'fidelite',
    icon: 'gift',
    articleSlugs: ['comptes-fidelite-onekey'],
  },
  {
    id: 'cat-systeme',
    slug: 'systeme',
    icon: 'settings',
    articleSlugs: [
      'organisations',
      'roles-et-permissions',
      'parametres-systeme',
    ],
  },
] as const;

/**
 * Curated hub “quick start” links (dashboard, palette, users, bookings, roles, tickets).
 * Resolved against ADMIN_HELP_ARTICLES — unknown slugs are ignored.
 */
export const ADMIN_HELP_QUICK_START_SLUGS = [
  'naviguer-dans-le-dashboard',
  'palette-commandes',
  'gerer-les-utilisateurs',
  'gerer-les-reservations',
  'roles-et-permissions',
  'tickets-support-clients',
] as const;

export const ADMIN_HELP_ARTICLES: readonly AdminHelpArticle[] = [
  {
    id: 'art-naviguer-dans-le-dashboard',
    slug: 'naviguer-dans-le-dashboard',
    categorySlug: 'prise-en-main',
    popular: true,
    relatedSlugs: [
      'notifications',
      'palette-commandes',
      'raccourcis-clavier',
      'gerer-les-utilisateurs',
    ],
  },
  {
    id: 'art-notifications',
    slug: 'notifications',
    categorySlug: 'prise-en-main',
    relatedSlugs: ['naviguer-dans-le-dashboard', 'palette-commandes'],
  },
  {
    id: 'art-palette-commandes',
    slug: 'palette-commandes',
    categorySlug: 'prise-en-main',
    popular: true,
    relatedSlugs: [
      'raccourcis-clavier',
      'naviguer-dans-le-dashboard',
      'roles-et-permissions',
    ],
  },
  {
    id: 'art-raccourcis-clavier',
    slug: 'raccourcis-clavier',
    categorySlug: 'prise-en-main',
    relatedSlugs: [
      'palette-commandes',
      'naviguer-dans-le-dashboard',
      'sessions-et-securite',
    ],
  },
  {
    id: 'art-gerer-les-utilisateurs',
    slug: 'gerer-les-utilisateurs',
    categorySlug: 'utilisateurs-acces',
    popular: true,
    relatedSlugs: [
      'employes-et-departements',
      'roles-et-permissions',
      'sessions-et-securite',
      'tickets-support-clients',
    ],
  },
  {
    id: 'art-employes-et-departements',
    slug: 'employes-et-departements',
    categorySlug: 'utilisateurs-acces',
    relatedSlugs: ['gerer-les-utilisateurs', 'organisations'],
  },
  {
    id: 'art-sessions-et-securite',
    slug: 'sessions-et-securite',
    categorySlug: 'utilisateurs-acces',
    relatedSlugs: [
      'gerer-les-utilisateurs',
      'roles-et-permissions',
      'raccourcis-clavier',
    ],
  },
  {
    id: 'art-adresses-et-moyens-paiement',
    slug: 'adresses-et-moyens-paiement',
    categorySlug: 'utilisateurs-acces',
    relatedSlugs: ['gerer-les-utilisateurs', 'suivre-les-paiements'],
  },
  {
    id: 'art-hebergements',
    slug: 'hebergements',
    categorySlug: 'produits-voyage',
    popular: true,
    relatedSlugs: [
      'activites-et-forfaits',
      'destinations',
      'gerer-les-reservations',
    ],
  },
  {
    id: 'art-vols-locations-croisieres',
    slug: 'vols-locations-croisieres',
    categorySlug: 'produits-voyage',
    relatedSlugs: ['hebergements', 'activites-et-forfaits', 'destinations'],
  },
  {
    id: 'art-activites-et-forfaits',
    slug: 'activites-et-forfaits',
    categorySlug: 'produits-voyage',
    relatedSlugs: [
      'hebergements',
      'vols-locations-croisieres',
      'gerer-les-reservations',
    ],
  },
  {
    id: 'art-destinations',
    slug: 'destinations',
    categorySlug: 'produits-voyage',
    relatedSlugs: ['hebergements', 'activites-et-forfaits'],
  },
  {
    id: 'art-gerer-les-reservations',
    slug: 'gerer-les-reservations',
    categorySlug: 'reservations-guides',
    popular: true,
    relatedSlugs: [
      'guides-et-calendrier',
      'suivre-les-paiements',
      'tickets-support-clients',
      'gerer-les-utilisateurs',
    ],
  },
  {
    id: 'art-guides-et-calendrier',
    slug: 'guides-et-calendrier',
    categorySlug: 'reservations-guides',
    relatedSlugs: ['gerer-les-reservations', 'employes-et-departements'],
  },
  {
    id: 'art-suivre-les-paiements',
    slug: 'suivre-les-paiements',
    categorySlug: 'paiements-promos',
    popular: true,
    relatedSlugs: [
      'codes-promo',
      'promotions',
      'gerer-les-reservations',
    ],
  },
  {
    id: 'art-codes-promo',
    slug: 'codes-promo',
    categorySlug: 'paiements-promos',
    relatedSlugs: ['promotions', 'suivre-les-paiements'],
  },
  {
    id: 'art-promotions',
    slug: 'promotions',
    categorySlug: 'paiements-promos',
    relatedSlugs: ['codes-promo', 'suivre-les-paiements'],
  },
  {
    id: 'art-parametres-gap',
    slug: 'parametres-gap',
    categorySlug: 'gap',
    relatedSlugs: ['pages-et-activites-gap', 'impact-et-medias-gap'],
  },
  {
    id: 'art-pages-et-activites-gap',
    slug: 'pages-et-activites-gap',
    categorySlug: 'gap',
    relatedSlugs: ['parametres-gap', 'impact-et-medias-gap'],
  },
  {
    id: 'art-impact-et-medias-gap',
    slug: 'impact-et-medias-gap',
    categorySlug: 'gap',
    relatedSlugs: ['parametres-gap', 'pages-et-activites-gap'],
  },
  {
    id: 'art-blog-et-site',
    slug: 'blog-et-site',
    categorySlug: 'contenu-relation',
    relatedSlugs: ['pages-legales', 'moderer-les-avis'],
  },
  {
    id: 'art-pages-legales',
    slug: 'pages-legales',
    categorySlug: 'contenu-relation',
    relatedSlugs: ['blog-et-site', 'parametres-systeme'],
  },
  {
    id: 'art-moderer-les-avis',
    slug: 'moderer-les-avis',
    categorySlug: 'contenu-relation',
    popular: true,
    relatedSlugs: ['tickets-support-clients', 'blog-et-site'],
  },
  {
    id: 'art-tickets-support-clients',
    slug: 'tickets-support-clients',
    categorySlug: 'contenu-relation',
    popular: true,
    relatedSlugs: [
      'moderer-les-avis',
      'gerer-les-reservations',
      'gerer-les-utilisateurs',
      'naviguer-dans-le-dashboard',
    ],
  },
  {
    id: 'art-comptes-fidelite-onekey',
    slug: 'comptes-fidelite-onekey',
    categorySlug: 'fidelite',
    relatedSlugs: ['gerer-les-utilisateurs', 'suivre-les-paiements'],
  },
  {
    id: 'art-organisations',
    slug: 'organisations',
    categorySlug: 'systeme',
    relatedSlugs: ['roles-et-permissions', 'parametres-systeme'],
  },
  {
    id: 'art-roles-et-permissions',
    slug: 'roles-et-permissions',
    categorySlug: 'systeme',
    popular: true,
    relatedSlugs: [
      'organisations',
      'gerer-les-utilisateurs',
      'parametres-systeme',
      'sessions-et-securite',
    ],
  },
  {
    id: 'art-parametres-systeme',
    slug: 'parametres-systeme',
    categorySlug: 'systeme',
    relatedSlugs: [
      'organisations',
      'roles-et-permissions',
      'sessions-et-securite',
    ],
  },
] as const;

const categoriesBySlug = new Map(
  ADMIN_HELP_CATEGORIES.map((category) => [category.slug, category]),
);

const articlesBySlug = new Map(
  ADMIN_HELP_ARTICLES.map((article) => [article.slug, article]),
);

function normalizeSearchQuery(query: string): string {
  return query
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function matchesSearch(haystack: string, normalizedQuery: string): boolean {
  const normalized = normalizeSearchQuery(haystack);
  return normalized.includes(normalizedQuery);
}

export function getAdminHelpCategories(): readonly AdminHelpCategory[] {
  return ADMIN_HELP_CATEGORIES;
}

export function getAdminHelpCategoryBySlug(
  slug: string,
): AdminHelpCategory | undefined {
  return categoriesBySlug.get(slug as AdminHelpCategorySlug);
}

export function getAdminHelpArticleBySlug(
  slug: string,
): AdminHelpArticle | undefined {
  return articlesBySlug.get(slug);
}

export function getAdminHelpArticlesByCategory(
  categorySlug: string,
): AdminHelpArticle[] {
  const category = getAdminHelpCategoryBySlug(categorySlug);
  if (!category) {
    return [];
  }
  return category.articleSlugs
    .map((slug) => articlesBySlug.get(slug))
    .filter((article): article is AdminHelpArticle => article !== undefined);
}

export function getAdminHelpPopularArticles(): AdminHelpArticle[] {
  return ADMIN_HELP_ARTICLES.filter((article) => article.popular === true);
}

export function getAdminHelpQuickStartArticles(): AdminHelpArticle[] {
  return ADMIN_HELP_QUICK_START_SLUGS.map((slug) => articlesBySlug.get(slug)).filter(
    (article): article is AdminHelpArticle => article !== undefined,
  );
}

export function getAdminHelpRelatedArticles(
  article: AdminHelpArticle,
): AdminHelpArticle[] {
  if (!article.relatedSlugs?.length) {
    return [];
  }
  return article.relatedSlugs
    .map((slug) => articlesBySlug.get(slug))
    .filter((related): related is AdminHelpArticle => related !== undefined);
}

/**
 * Client-side search over localized title/summary/body.
 * Pass strings keyed by article slug (from i18n).
 */
export function searchAdminHelpArticles(
  query: string,
  stringsBySlug: Readonly<Record<string, AdminHelpArticleSearchStrings>>,
): AdminHelpArticle[] {
  const normalizedQuery = normalizeSearchQuery(query);
  if (!normalizedQuery) {
    return [];
  }

  return ADMIN_HELP_ARTICLES.filter((article) => {
    const strings = stringsBySlug[article.slug];
    if (!strings) {
      return false;
    }
    return (
      matchesSearch(strings.title, normalizedQuery) ||
      matchesSearch(strings.summary, normalizedQuery) ||
      (strings.body !== undefined &&
        matchesSearch(strings.body, normalizedQuery))
    );
  });
}

/** Params for `generateStaticParams` on category routes. */
export function getAdminHelpCategoryStaticParams(): { category: string }[] {
  return ADMIN_HELP_CATEGORIES.map((category) => ({
    category: category.slug,
  }));
}

/** Params for `generateStaticParams` on article routes. */
export function getAdminHelpArticleStaticParams(): {
  category: string;
  slug: string;
}[] {
  return ADMIN_HELP_ARTICLES.map((article) => ({
    category: article.categorySlug,
    slug: article.slug,
  }));
}

export function isValidAdminHelpCategorySlug(
  slug: string,
): slug is AdminHelpCategorySlug {
  return categoriesBySlug.has(slug as AdminHelpCategorySlug);
}

export function isValidAdminHelpArticlePath(
  categorySlug: string,
  articleSlug: string,
): boolean {
  const article = getAdminHelpArticleBySlug(articleSlug);
  return (
    article !== undefined &&
    article.categorySlug === categorySlug &&
    isValidAdminHelpCategorySlug(categorySlug)
  );
}

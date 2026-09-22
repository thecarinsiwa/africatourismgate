import {
  getAdminHelpArticleBySlug,
  type AdminHelpCategorySlug,
} from './help-catalog';
import { adminHelpArticlePath, adminHelpHref } from './routes';

/**
 * Recommended help article for an admin pathname prefix.
 * More specific prefixes must appear before broader ones (e.g. `/utilisateurs/employes`
 * before `/utilisateurs`). Matching uses longest-prefix wins as a safety net.
 */
export type AdminContextualHelpTarget = {
  categorySlug: AdminHelpCategorySlug;
  articleSlug: string;
};

type ContextualHelpRule = {
  prefix: string;
  categorySlug: AdminHelpCategorySlug;
  articleSlug: string;
};

const CONTEXTUAL_HELP_RULES: readonly ContextualHelpRule[] = [
  // Prise en main
  {
    prefix: '/dashboard',
    categorySlug: 'prise-en-main',
    articleSlug: 'naviguer-dans-le-dashboard',
  },
  {
    prefix: '/notifications',
    categorySlug: 'prise-en-main',
    articleSlug: 'notifications',
  },

  // Utilisateurs & accès (specific before /utilisateurs)
  {
    prefix: '/utilisateurs/employes',
    categorySlug: 'utilisateurs-acces',
    articleSlug: 'employes-et-departements',
  },
  {
    prefix: '/utilisateurs/departements',
    categorySlug: 'utilisateurs-acces',
    articleSlug: 'employes-et-departements',
  },
  {
    prefix: '/utilisateurs/adresses',
    categorySlug: 'utilisateurs-acces',
    articleSlug: 'adresses-et-moyens-paiement',
  },
  {
    prefix: '/utilisateurs/moyens-paiement',
    categorySlug: 'utilisateurs-acces',
    articleSlug: 'adresses-et-moyens-paiement',
  },
  {
    prefix: '/utilisateurs/sessions',
    categorySlug: 'utilisateurs-acces',
    articleSlug: 'sessions-et-securite',
  },
  {
    prefix: '/utilisateurs/journaux-securite',
    categorySlug: 'utilisateurs-acces',
    articleSlug: 'sessions-et-securite',
  },
  {
    prefix: '/utilisateurs',
    categorySlug: 'utilisateurs-acces',
    articleSlug: 'gerer-les-utilisateurs',
  },

  // Fidélité
  {
    prefix: '/fidelite',
    categorySlug: 'fidelite',
    articleSlug: 'comptes-fidelite-onekey',
  },

  // Produits voyage (specific before broader)
  {
    prefix: '/hebergements',
    categorySlug: 'produits-voyage',
    articleSlug: 'hebergements',
  },
  {
    prefix: '/produits/vols',
    categorySlug: 'produits-voyage',
    articleSlug: 'vols-locations-croisieres',
  },
  {
    prefix: '/produits/locations',
    categorySlug: 'produits-voyage',
    articleSlug: 'vols-locations-croisieres',
  },
  {
    prefix: '/produits/croisieres',
    categorySlug: 'produits-voyage',
    articleSlug: 'vols-locations-croisieres',
  },
  {
    prefix: '/produits/activites',
    categorySlug: 'produits-voyage',
    articleSlug: 'activites-et-forfaits',
  },
  {
    prefix: '/produits/forfaits',
    categorySlug: 'produits-voyage',
    articleSlug: 'activites-et-forfaits',
  },
  {
    prefix: '/produits/destinations',
    categorySlug: 'produits-voyage',
    articleSlug: 'destinations',
  },

  // Réservations & guides
  {
    prefix: '/reservations',
    categorySlug: 'reservations-guides',
    articleSlug: 'gerer-les-reservations',
  },
  {
    prefix: '/guides',
    categorySlug: 'reservations-guides',
    articleSlug: 'guides-et-calendrier',
  },

  // Paiements & promos
  {
    prefix: '/paiements/codes-promo',
    categorySlug: 'paiements-promos',
    articleSlug: 'codes-promo',
  },
  {
    prefix: '/paiements/promotions',
    categorySlug: 'paiements-promos',
    articleSlug: 'promotions',
  },
  {
    prefix: '/paiements',
    categorySlug: 'paiements-promos',
    articleSlug: 'suivre-les-paiements',
  },

  // GAP
  {
    prefix: '/gap/parametres',
    categorySlug: 'gap',
    articleSlug: 'parametres-gap',
  },
  {
    prefix: '/gap/pages',
    categorySlug: 'gap',
    articleSlug: 'pages-et-activites-gap',
  },
  {
    prefix: '/gap/activites',
    categorySlug: 'gap',
    articleSlug: 'pages-et-activites-gap',
  },
  {
    prefix: '/gap/impact',
    categorySlug: 'gap',
    articleSlug: 'impact-et-medias-gap',
  },
  {
    prefix: '/gap/medias',
    categorySlug: 'gap',
    articleSlug: 'impact-et-medias-gap',
  },
  {
    prefix: '/gap',
    categorySlug: 'gap',
    articleSlug: 'parametres-gap',
  },

  // Contenu & relation
  {
    prefix: '/contenu/blog',
    categorySlug: 'contenu-relation',
    articleSlug: 'blog-et-site',
  },
  {
    prefix: '/contenu/site',
    categorySlug: 'contenu-relation',
    articleSlug: 'blog-et-site',
  },
  {
    prefix: '/contenu/a-propos',
    categorySlug: 'contenu-relation',
    articleSlug: 'blog-et-site',
  },
  {
    prefix: '/contenu/pourquoi-nous',
    categorySlug: 'contenu-relation',
    articleSlug: 'blog-et-site',
  },
  {
    prefix: '/contenu/hero',
    categorySlug: 'contenu-relation',
    articleSlug: 'blog-et-site',
  },
  {
    prefix: '/contenu/clients-satisfaits',
    categorySlug: 'contenu-relation',
    articleSlug: 'blog-et-site',
  },
  {
    prefix: '/contenu/legal',
    categorySlug: 'contenu-relation',
    articleSlug: 'pages-legales',
  },
  {
    prefix: '/contenu/avis',
    categorySlug: 'contenu-relation',
    articleSlug: 'moderer-les-avis',
  },
  {
    prefix: '/contenu/support',
    categorySlug: 'contenu-relation',
    articleSlug: 'tickets-support-clients',
  },

  // Système
  {
    prefix: '/organisations',
    categorySlug: 'systeme',
    articleSlug: 'organisations',
  },
  {
    prefix: '/systeme/roles',
    categorySlug: 'systeme',
    articleSlug: 'roles-et-permissions',
  },
  {
    prefix: '/parametres',
    categorySlug: 'systeme',
    articleSlug: 'parametres-systeme',
  },
] as const;

function normalizePathname(pathname: string): string {
  if (!pathname) {
    return '/';
  }
  const withoutQuery = pathname.split('?')[0] ?? pathname;
  if (withoutQuery.length > 1 && withoutQuery.endsWith('/')) {
    return withoutQuery.slice(0, -1);
  }
  return withoutQuery || '/';
}

function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

/**
 * Resolve the best help article for the current admin pathname.
 * Returns `null` on `/aide` (and unknown routes) so callers can fall back to the hub.
 */
export function resolveAdminContextualHelp(
  pathname: string,
): AdminContextualHelpTarget | null {
  const normalized = normalizePathname(pathname);

  if (normalized === '/aide' || normalized.startsWith('/aide/')) {
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

  const article = getAdminHelpArticleBySlug(best.articleSlug);
  if (!article || article.categorySlug !== best.categorySlug) {
    return null;
  }

  return {
    categorySlug: best.categorySlug,
    articleSlug: best.articleSlug,
  };
}

/** Href vers l’article contextuel, ou le hub `/aide` si aucun mapping. */
export function getAdminContextualHelpHref(pathname: string): string {
  const target = resolveAdminContextualHelp(pathname);
  if (!target) {
    return adminHelpHref();
  }
  return adminHelpArticlePath(target.categorySlug, target.articleSlug);
}

/** Exported for tests / docs — ordered rules with longest-prefix matching. */
export function getAdminContextualHelpRules(): readonly ContextualHelpRule[] {
  return CONTEXTUAL_HELP_RULES;
}

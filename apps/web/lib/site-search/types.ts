/** Groupes d’affichage des résultats (ordre UI via `SITE_SEARCH_GROUP_ORDER`). */
export type SiteSearchGroupId =
  | 'pages'
  | 'destinations'
  | 'hotels'
  | 'activities'
  | 'packages'
  | 'cruises'
  | 'flights'
  | 'cars'
  | 'blog'
  | 'help';

export type SiteSearchSourceId =
  | 'pages'
  | 'help'
  | 'destinations'
  | 'hotels'
  | 'activities'
  | 'packages'
  | 'cruises'
  | 'flights'
  | 'cars'
  | 'blog';

export type SiteSearchSourceKind = 'local' | 'api' | 'reference';

/** Clé i18n sous `siteSearch.sources.*` / `siteSearch.groups.*`. */
export type SiteSearchLabelKey = string;

/** Nature du résultat : fiche directe ou listing pré-rempli. */
export type SiteSearchResultKind = 'entity' | 'prefilled';

export type SiteSearchResultItem = {
  /** Identifiant unique dans le navigateur (`${sourceId}:${entityId}`). */
  id: string;
  sourceId: SiteSearchSourceId;
  group: SiteSearchGroupId;
  title: string;
  subtitle?: string;
  href: string;
  kind: SiteSearchResultKind;
};

/** Entrée de navigation pré-traduite (fournie par le hook / UI). */
export type SiteSearchNavItem = {
  href: string;
  label: string;
};

/** Chaînes i18n d’un article d’aide pour la recherche client. */
export type SiteSearchHelpArticleStrings = {
  title: string;
  summary: string;
  body?: string;
};

export type SiteSearchContext = {
  /** Locale active pour les sources i18n locales (aide, blog). */
  locale?: string;
  /**
   * Pages : entrées nav + routes extra déjà labellisées.
   * Si absent, la source `pages` renvoie [].
   */
  navItems?: readonly SiteSearchNavItem[];
  /**
   * Aide : chaînes par slug d’article (`support.articles`).
   * Si absent, la source `help` renvoie [].
   */
  helpStringsBySlug?: Readonly<Record<string, SiteSearchHelpArticleStrings>>;
  /** Sous-titre i18n pour les résultats pré-remplis (vols / voitures). */
  prefilledHint?: string;
};

/**
 * Métadonnées d’une source (registry).
 * L’implémentation `search` est branchée dans les tâches suivantes.
 */
export type SiteSearchSourceDefinition = {
  id: SiteSearchSourceId;
  group: SiteSearchGroupId;
  /** Clé relative : `siteSearch.sources.<labelKey>`. */
  labelKey: SiteSearchLabelKey;
  kind: SiteSearchSourceKind;
  /**
   * Longueur mini de requête avant exécution.
   * `0` = immédiat (pages / aide / destinations vedettes).
   */
  minQueryLength: number;
  /** Max résultats renvoyés par cette source. */
  resultLimit: number;
  enabled: boolean;
};

export type SiteSearchSourceSearcher = (
  query: string,
  context: SiteSearchContext,
) => Promise<SiteSearchResultItem[]>;

/** Source complète une fois l’adapter branché. */
export type SiteSearchSource = SiteSearchSourceDefinition & {
  search: SiteSearchSourceSearcher;
};

export type SiteSearchGroupResult = {
  group: SiteSearchGroupId;
  items: SiteSearchResultItem[];
  /** Erreur partielle de source(s) de ce groupe (fan-out). */
  error?: string | null;
  loading?: boolean;
};

export const SITE_SEARCH_DEBOUNCE_MS = 300;

/** Seuil par défaut pour les sources API / référence. */
export const SITE_SEARCH_API_MIN_QUERY_LENGTH = 2;

export const SITE_SEARCH_DEFAULT_RESULT_LIMIT = 5;

/**
 * Contrat miroir de `GET /public/site-search` (`@africatourismgate/types`).
 * Les adaptateurs UI brancheront ces hits dans une tâche suivante.
 */
export type {
  PublicSiteSearchGroup,
  PublicSiteSearchHit,
  PublicSiteSearchQuery,
  PublicSiteSearchResponse,
  SiteSearchHitType,
} from '@africatourismgate/types';

export {
  SITE_SEARCH_DEFAULT_LIMIT_PER_TYPE,
  SITE_SEARCH_HIT_TYPES,
  SITE_SEARCH_MAX_LIMIT_PER_TYPE,
  SITE_SEARCH_MAX_QUERY_LENGTH,
  SITE_SEARCH_MIN_QUERY_LENGTH,
} from '@africatourismgate/types';

import type { RouteAccessContext } from '../../config/admin-route-permissions';

/** Groupes d’affichage des résultats (ordre UI via `ADMIN_SEARCH_GROUP_ORDER`). */
export type AdminSearchGroupId =
  | 'pages'
  | 'help'
  | 'users'
  | 'organizations'
  | 'bookings'
  | 'properties'
  | 'payments'
  | 'support'
  | 'catalog'
  | 'content';

export type AdminSearchSourceId =
  | 'pages'
  | 'help'
  | 'users'
  | 'organizations'
  | 'bookings'
  | 'properties'
  | 'payments'
  | 'supportTickets'
  | 'activities'
  | 'flights'
  | 'vehicles'
  | 'packages'
  | 'sailings'
  | 'blogPosts'
  | 'destinations'
  | 'employees'
  | 'tourGuides'
  | 'promotions'
  | 'promoCodes'
  | 'gapPages'
  | 'gapActivities'
  | 'roles';

export type AdminSearchSourceKind = 'local' | 'api';

/** Clé i18n sous `common.globalSearch.sources.*` / `groups.*`. */
export type AdminSearchLabelKey = string;

export type AdminSearchResultItem = {
  /** Identifiant unique dans le navigateur (`${sourceId}:${entityId}`). */
  id: string;
  sourceId: AdminSearchSourceId;
  group: AdminSearchGroupId;
  title: string;
  subtitle?: string;
  href: string;
};

/** Entrée de navigation pré-traduite (fournie par le hook / UI). */
export type AdminSearchNavItem = {
  href: string;
  label: string;
};

/** Chaînes i18n d’un article d’aide pour la recherche client. */
export type AdminSearchHelpArticleStrings = {
  title: string;
  summary: string;
  body?: string;
};

export type AdminSearchContext = RouteAccessContext & {
  /** Locale active pour les sources i18n locales (aide). */
  locale?: string;
  /**
   * Pages : entrées nav + routes extra déjà labellisées.
   * Si absent, la source `pages` renvoie [].
   */
  navItems?: readonly AdminSearchNavItem[];
  /**
   * Aide : chaînes par slug d’article (`modules.adminHelp`).
   * Si absent, la source `help` renvoie [].
   */
  helpStringsBySlug?: Readonly<Record<string, AdminSearchHelpArticleStrings>>;
};

/**
 * Métadonnées d’une source (registry).
 * L’implémentation `search` est branchée dans les tâches suivantes.
 */
export type AdminSearchSourceDefinition = {
  id: AdminSearchSourceId;
  group: AdminSearchGroupId;
  /** Clé relative : `common.globalSearch.sources.<labelKey>`. */
  labelKey: AdminSearchLabelKey;
  /**
   * Préfixe de route admin utilisé pour le contrôle d’accès
   * (`isHrefAllowed` / `admin-route-permissions`).
   */
  listHref: string;
  kind: AdminSearchSourceKind;
  /**
   * Longueur mini de requête avant exécution.
   * `0` = immédiat (pages / aide).
   */
  minQueryLength: number;
  /** Max résultats renvoyés par cette source. */
  resultLimit: number;
  enabled: boolean;
};

/** Options runtime passées au fan-out / searchers (abort, etc.). */
export type AdminSearchRunOptions = {
  signal?: AbortSignal;
};

export type AdminSearchSourceSearcher = (
  query: string,
  context: AdminSearchContext,
  options?: AdminSearchRunOptions,
) => Promise<AdminSearchResultItem[]>;

/** Source complète une fois l’adapter branché. */
export type AdminSearchSource = AdminSearchSourceDefinition & {
  search: AdminSearchSourceSearcher;
};

export type AdminSearchGroupResult = {
  group: AdminSearchGroupId;
  items: AdminSearchResultItem[];
  /** Erreur partielle de source(s) de ce groupe (fan-out). */
  error?: string | null;
  loading?: boolean;
};

export const ADMIN_SEARCH_DEBOUNCE_MS = 300;

/** Seuil par défaut pour les sources API. */
export const ADMIN_SEARCH_API_MIN_QUERY_LENGTH = 2;

export const ADMIN_SEARCH_DEFAULT_RESULT_LIMIT = 5;

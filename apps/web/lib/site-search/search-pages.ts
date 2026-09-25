import { ABOUT_NAV_ITEMS } from '../about/routes';
import { LEGAL_PATHS } from '../legal/routes';
import { buildVerticalListRoute } from '../search/route';
import { siteSearchDeepLinks } from './deep-links';
import { matchesSiteNavSearchItem, normalizeSiteSearchText } from './nav-match';
import { buildSiteSearchResultId, getSiteSearchSourceDefinition } from './sources';
import type {
  SiteSearchContext,
  SiteSearchNavItem,
  SiteSearchResultItem,
} from './types';
import {
  DEFAULT_CATALOG_PRODUCTS,
  type ResolvedCatalogProducts,
} from '@africatourismgate/types/organization-settings';

export type SiteNavSearchTranslate = {
  /** Clés sous `nav.*` (ex. `home`, `hotels`, `donate`). */
  nav: (key: string) => string;
  /** Clés sous `about.nav.*` (ex. `whoWeAre`). */
  aboutNav: (key: string) => string;
  /** Clés sous `legal.*` (ex. `termsOfUseTitle`). */
  legal: (key: string) => string;
};

export type SearchSitePagesOptions = {
  resultLimit?: number;
};

/**
 * Construit la liste dédupliquée / triée des pages publiques recherchables
 * (nav header, about, produits, légal, don).
 */
export function buildSiteNavSearchItems(
  translate: SiteNavSearchTranslate,
  catalogProducts: ResolvedCatalogProducts = DEFAULT_CATALOG_PRODUCTS,
): SiteSearchNavItem[] {
  const productVerticals: SiteSearchNavItem[] = (
    [
      { vertical: 'hotels' as const, labelKey: 'hotels' },
      { vertical: 'flights' as const, labelKey: 'flights' },
      { vertical: 'cars' as const, labelKey: 'cars' },
      { vertical: 'cruises' as const, labelKey: 'cruises' },
      { vertical: 'tours' as const, labelKey: 'tours' },
    ] as const
  )
    .filter(({ vertical }) => catalogProducts[vertical])
    .map(({ vertical, labelKey }) => ({
      href: buildVerticalListRoute(vertical),
      label: translate.nav(labelKey),
    }));

  const aboutItems: SiteSearchNavItem[] = ABOUT_NAV_ITEMS.map((item) => ({
    href: item.href,
    label: translate.aboutNav(item.labelKey),
  }));

  const extras: SiteSearchNavItem[] = [
    { href: '/', label: translate.nav('home') },
    { href: '/blog', label: translate.nav('blog') },
    { href: '/partners', label: translate.nav('partners') },
    ...(catalogProducts.packages
      ? [{ href: '/packages', label: translate.nav('packages') }]
      : []),
    { href: '/support', label: translate.nav('help') },
    { href: '/donate', label: translate.nav('donate') },
    {
      href: LEGAL_PATHS.termsOfUse,
      label: translate.legal('termsOfUseTitle'),
    },
    {
      href: LEGAL_PATHS.privacyPolicy,
      label: translate.legal('privacyPolicyTitle'),
    },
  ];

  const byHref = new Map<string, SiteSearchNavItem>();
  for (const item of [...extras, ...aboutItems, ...productVerticals]) {
    if (!byHref.has(item.href)) {
      byHref.set(item.href, item);
    }
  }

  return Array.from(byHref.values()).sort((a, b) =>
    a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }),
  );
}

/**
 * Source locale `pages` : filtre la nav publique (et aliases aide/legal/don).
 * Ne dépend pas du shell UI — `navItems` fournis via le contexte.
 */
export async function searchSitePages(
  query: string,
  context: SiteSearchContext,
  options?: SearchSitePagesOptions,
): Promise<SiteSearchResultItem[]> {
  const navItems = context.navItems ?? [];
  const normalized = normalizeSiteSearchText(query);
  const matched = normalized
    ? navItems.filter((item) => matchesSiteNavSearchItem(item, normalized))
    : [...navItems];

  const definitionLimit = getSiteSearchSourceDefinition('pages')?.resultLimit;
  const limit = options?.resultLimit ?? definitionLimit ?? matched.length;

  return matched.slice(0, limit).map((item) => ({
    id: buildSiteSearchResultId('pages', item.href),
    sourceId: 'pages' as const,
    group: 'pages' as const,
    title: item.label,
    subtitle: item.href,
    href: siteSearchDeepLinks.page(item.href),
    kind: 'entity' as const,
  }));
}

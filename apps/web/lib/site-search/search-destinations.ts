import type {
  PublicDestination,
  PublicDestinationHighlight,
} from '@africatourismgate/types';
import { listFeaturedDestinations } from '../api/public';
import { siteSearchDeepLinks } from './deep-links';
import { normalizeSiteSearchText } from './nav-match';
import { getCachedDestinations } from './reference-data';
import { buildSiteSearchResultId, getSiteSearchSourceDefinition } from './sources';
import type { SiteSearchContext, SiteSearchResultItem } from './types';

export type SearchSiteDestinationsOptions = {
  resultLimit?: number;
};

type MatchableDestination = {
  id: string;
  name: string;
  countryCode: string;
  slug?: string;
};

/** Slug dérivé du nom pour matcher des requêtes type `cape-town`. */
export function slugifyDestinationName(name: string): string {
  return normalizeSiteSearchText(name).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function matchesSiteDestination(
  destination: MatchableDestination,
  normalizedQuery: string,
): boolean {
  if (!normalizedQuery) {
    return true;
  }

  const name = normalizeSiteSearchText(destination.name);
  const country = normalizeSiteSearchText(destination.countryCode);
  const slug = destination.slug
    ? normalizeSiteSearchText(destination.slug)
    : slugifyDestinationName(destination.name);

  return (
    name.includes(normalizedQuery) ||
    country.includes(normalizedQuery) ||
    slug.includes(normalizedQuery)
  );
}

function toDestinationResult(
  destination: MatchableDestination,
): SiteSearchResultItem {
  const subtitle = destination.slug
    ? `${destination.countryCode} · ${destination.slug}`
    : destination.countryCode;

  return {
    id: buildSiteSearchResultId('destinations', destination.id),
    sourceId: 'destinations',
    group: 'destinations',
    title: destination.name,
    subtitle,
    href: siteSearchDeepLinks.hotelsByDestination(destination.name),
    kind: 'prefilled',
  };
}

function mapFeatured(
  featured: PublicDestinationHighlight[],
): MatchableDestination[] {
  return featured.map((item) => ({
    id: item.id,
    name: item.name,
    countryCode: item.countryCode,
    slug: item.slug,
  }));
}

function mapCached(
  destinations: PublicDestination[],
): MatchableDestination[] {
  return destinations.map((item) => ({
    id: item.id,
    name: item.name,
    countryCode: item.countryCode,
  }));
}

/**
 * Source référence `destinations` :
 * - requête vide → destinations vedettes (`listFeaturedDestinations`)
 * - sinon → filtre client du cache sur name / slug / country_code
 */
export async function searchSiteDestinations(
  query: string,
  _context?: SiteSearchContext,
  options?: SearchSiteDestinationsOptions,
): Promise<SiteSearchResultItem[]> {
  const definitionLimit =
    getSiteSearchSourceDefinition('destinations')?.resultLimit;
  const limit = options?.resultLimit ?? definitionLimit ?? 5;
  const normalized = normalizeSiteSearchText(query);

  if (!normalized) {
    const featured = await listFeaturedDestinations(limit);
    return mapFeatured(featured).slice(0, limit).map(toDestinationResult);
  }

  const destinations = mapCached(await getCachedDestinations());
  const matched = destinations.filter((destination) =>
    matchesSiteDestination(destination, normalized),
  );

  return matched.slice(0, limit).map(toDestinationResult);
}

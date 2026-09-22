import { getSiteSearchSourceDefinition, listSiteSearchSourceDefinitions } from './sources';
import { searchSiteActivities } from './search-activities';
import { searchSiteBlog } from './search-blog';
import { searchSiteCars } from './search-cars';
import { searchSiteCruises } from './search-cruises';
import { searchSiteDestinations } from './search-destinations';
import { searchSiteFlights } from './search-flights';
import { searchSiteHelp } from './search-help';
import { searchSiteHotels } from './search-hotels';
import { searchSitePackages } from './search-packages';
import { searchSitePages } from './search-pages';
import type {
  SiteSearchSource,
  SiteSearchSourceDefinition,
  SiteSearchSourceId,
  SiteSearchSourceSearcher,
} from './types';

const SITE_SEARCH_SEARCHERS: Record<SiteSearchSourceId, SiteSearchSourceSearcher> =
  {
    pages: async (query, context) => {
      const definition = getSiteSearchSourceDefinition('pages');
      return searchSitePages(query, context, {
        resultLimit: definition?.resultLimit,
      });
    },
    help: async (query, context) => {
      const definition = getSiteSearchSourceDefinition('help');
      return searchSiteHelp(query, context, {
        resultLimit: definition?.resultLimit,
      });
    },
    destinations: async (query, context) => {
      const definition = getSiteSearchSourceDefinition('destinations');
      return searchSiteDestinations(query, context, {
        resultLimit: definition?.resultLimit,
      });
    },
    hotels: async (query, context) => {
      const definition = getSiteSearchSourceDefinition('hotels');
      return searchSiteHotels(query, context, {
        resultLimit: definition?.resultLimit,
      });
    },
    activities: async (query, context) => {
      const definition = getSiteSearchSourceDefinition('activities');
      return searchSiteActivities(query, context, {
        resultLimit: definition?.resultLimit,
      });
    },
    packages: async (query, context) => {
      const definition = getSiteSearchSourceDefinition('packages');
      return searchSitePackages(query, context, {
        resultLimit: definition?.resultLimit,
      });
    },
    cruises: async (query, context) => {
      const definition = getSiteSearchSourceDefinition('cruises');
      return searchSiteCruises(query, context, {
        resultLimit: definition?.resultLimit,
      });
    },
    flights: async (query, context) => {
      const definition = getSiteSearchSourceDefinition('flights');
      return searchSiteFlights(query, context, {
        resultLimit: definition?.resultLimit,
      });
    },
    cars: async (query, context) => {
      const definition = getSiteSearchSourceDefinition('cars');
      return searchSiteCars(query, context, {
        resultLimit: definition?.resultLimit,
      });
    },
    blog: async (query, context) => {
      const definition = getSiteSearchSourceDefinition('blog');
      return searchSiteBlog(query, context, {
        resultLimit: definition?.resultLimit,
      });
    },
  };

function attachSearcher(
  definition: SiteSearchSourceDefinition,
): SiteSearchSource | null {
  const search = SITE_SEARCH_SEARCHERS[definition.id];
  if (!search) {
    return null;
  }
  return { ...definition, search };
}

/**
 * Toutes les sources v1 avec adapters branchés (local + référence + API).
 */
export function listWiredSiteSearchSources(
  definitions: readonly SiteSearchSourceDefinition[] = listSiteSearchSourceDefinitions(),
): SiteSearchSource[] {
  return definitions
    .filter((definition) => definition.enabled)
    .map(attachSearcher)
    .filter((source): source is SiteSearchSource => source !== null);
}

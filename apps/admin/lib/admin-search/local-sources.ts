import { getAdminSearchSourceDefinition } from './sources';
import { searchAdminHelp } from './search-help';
import { searchAdminPages } from './search-pages';
import type {
  AdminSearchSource,
  AdminSearchSourceDefinition,
  AdminSearchSourceSearcher,
} from './types';

const LOCAL_SEARCHERS: Record<'pages' | 'help', AdminSearchSourceSearcher> = {
  pages: async (query, context) => {
    const definition = getAdminSearchSourceDefinition('pages');
    return searchAdminPages(query, context, {
      resultLimit: definition?.resultLimit,
    });
  },
  help: async (query, context) => {
    const definition = getAdminSearchSourceDefinition('help');
    return searchAdminHelp(query, context, {
      resultLimit: definition?.resultLimit,
    });
  },
};

function attachLocalSearcher(
  definition: AdminSearchSourceDefinition,
): AdminSearchSource | null {
  if (definition.id !== 'pages' && definition.id !== 'help') {
    return null;
  }
  return {
    ...definition,
    search: LOCAL_SEARCHERS[definition.id],
  };
}

/**
 * Sources locales prêtes à brancher sur le fan-out (pages + aide).
 */
export function listLocalAdminSearchSources(
  definitions: readonly AdminSearchSourceDefinition[],
): AdminSearchSource[] {
  return definitions
    .filter((definition) => definition.kind === 'local' && definition.enabled)
    .map(attachLocalSearcher)
    .filter((source): source is AdminSearchSource => source !== null);
}

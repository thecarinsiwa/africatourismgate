import { searchHelpArticles } from '../support/help-catalog';
import { siteSearchDeepLinks } from './deep-links';
import { buildSiteSearchResultId, getSiteSearchSourceDefinition } from './sources';
import type { SiteSearchContext, SiteSearchResultItem } from './types';

export type SearchSiteHelpOptions = {
  resultLimit?: number;
};

/**
 * Source locale `help` : réutilise `searchHelpArticles` + deep-link `/support/...`.
 * Les chaînes i18n (`support.help.articles.*`) sont fournies via le contexte.
 */
export async function searchSiteHelp(
  query: string,
  context: SiteSearchContext,
  options?: SearchSiteHelpOptions,
): Promise<SiteSearchResultItem[]> {
  const stringsBySlug = context.helpStringsBySlug;
  if (!stringsBySlug) {
    return [];
  }

  const articles = searchHelpArticles(query, stringsBySlug);
  const definitionLimit = getSiteSearchSourceDefinition('help')?.resultLimit;
  const limit = options?.resultLimit ?? definitionLimit ?? articles.length;

  return articles.slice(0, limit).map((article) => {
    const strings = stringsBySlug[article.slug];
    return {
      id: buildSiteSearchResultId('help', article.slug),
      sourceId: 'help' as const,
      group: 'help' as const,
      title: strings?.title ?? article.slug,
      subtitle: strings?.summary,
      href: siteSearchDeepLinks.helpArticle(
        article.categorySlug,
        article.slug,
      ),
      kind: 'entity' as const,
    };
  });
}

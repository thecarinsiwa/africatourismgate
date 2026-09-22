import { searchAdminHelpArticles } from '../admin-help/help-catalog';
import { adminHelpArticlePath } from '../admin-help/routes';
import { buildAdminSearchResultId } from './sources';
import type { AdminSearchContext, AdminSearchResultItem } from './types';

export type SearchAdminHelpOptions = {
  resultLimit?: number;
};

/**
 * Source locale `help` : réutilise `searchAdminHelpArticles` + deep-link `/aide/...`.
 */
export async function searchAdminHelp(
  query: string,
  context: AdminSearchContext,
  options?: SearchAdminHelpOptions,
): Promise<AdminSearchResultItem[]> {
  const stringsBySlug = context.helpStringsBySlug;
  if (!stringsBySlug) {
    return [];
  }

  const articles = searchAdminHelpArticles(query, stringsBySlug);
  const limit = options?.resultLimit ?? articles.length;

  return articles.slice(0, limit).map((article) => {
    const strings = stringsBySlug[article.slug];
    return {
      id: buildAdminSearchResultId('help', article.slug),
      sourceId: 'help' as const,
      group: 'help' as const,
      title: strings?.title ?? article.slug,
      subtitle: strings?.summary,
      href: adminHelpArticlePath(article.categorySlug, article.slug),
    };
  });
}

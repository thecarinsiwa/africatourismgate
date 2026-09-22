import { browseBlogPostsForLocale } from '../api/public';
import { siteSearchDeepLinks } from './deep-links';
import { normalizeSiteSearchText } from './nav-match';
import { buildSiteSearchResultId, getSiteSearchSourceDefinition } from './sources';
import type { SiteSearchContext, SiteSearchResultItem } from './types';

export type SearchSiteBlogOptions = {
  resultLimit?: number;
};

/**
 * Source API `blog` — recherche plein texte native via
 * `browseBlogPostsForLocale` (repli automatique si la locale n’a aucun article).
 */
export async function searchSiteBlog(
  query: string,
  context: SiteSearchContext = {},
  options?: SearchSiteBlogOptions,
): Promise<SiteSearchResultItem[]> {
  const definitionLimit = getSiteSearchSourceDefinition('blog')?.resultLimit;
  const limit = options?.resultLimit ?? definitionLimit ?? 5;
  const normalized = normalizeSiteSearchText(query);

  if (!normalized) {
    return [];
  }

  const locale = context.locale?.trim() || 'fr';
  const { response, usedLocaleFallback } = await browseBlogPostsForLocale(
    locale,
    {
      search: query.trim(),
      page: 1,
      limit,
    },
  );

  return response.data.slice(0, limit).map((post) => {
    const localeNote =
      usedLocaleFallback && post.locale
        ? post.locale.toUpperCase()
        : undefined;
    const excerpt = post.excerpt?.trim() || undefined;
    const subtitle = [excerpt, localeNote].filter(Boolean).join(' · ') || undefined;

    return {
      id: buildSiteSearchResultId('blog', post.slug),
      sourceId: 'blog' as const,
      group: 'blog' as const,
      title: post.title,
      subtitle,
      href: siteSearchDeepLinks.blogPost(post.slug),
      kind: 'entity' as const,
    };
  });
}

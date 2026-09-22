'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';
import { HELP_ARTICLES } from '../support/help-catalog';
import {
  aggregateSiteSearchResults,
  flattenSiteSearchGroups,
  runSiteSearchFanOut,
} from './aggregate';
import { buildSiteNavSearchItems } from './search-pages';
import {
  SITE_SEARCH_DEBOUNCE_MS,
  type SiteSearchContext,
  type SiteSearchGroupResult,
  type SiteSearchHelpArticleStrings,
  type SiteSearchResultItem,
} from './types';
import { listWiredSiteSearchSources } from './wired-sources';

export type UseSiteSearchOptions = {
  /** Quand `false`, aucun fan-out n’est lancé (modal fermée). */
  enabled?: boolean;
  debounceMs?: number;
};

export type UseSiteSearchResult = {
  query: string;
  setQuery: (value: string) => void;
  debouncedQuery: string;
  groups: SiteSearchGroupResult[];
  flatItems: SiteSearchResultItem[];
  loading: boolean;
  /** Au moins un résultat dans un groupe. */
  hasResults: boolean;
  /**
   * Requête déjà exécutée (debounce passé) sans aucun résultat
   * (ni items, ni erreurs partielles affichables).
   */
  isEmpty: boolean;
};

function useHelpStringsBySlug(): Record<string, SiteSearchHelpArticleStrings> {
  const t = useTranslations('support');
  return useMemo(() => {
    const strings: Record<string, SiteSearchHelpArticleStrings> = {};
    for (const article of HELP_ARTICLES) {
      strings[article.slug] = {
        title: t(`help.articles.${article.slug}.title`),
        summary: t(`help.articles.${article.slug}.summary`),
        body: t(`help.articles.${article.slug}.body`),
      };
    }
    return strings;
  }, [t]);
}

/**
 * Debounce + fan-out `Promise.allSettled` + agrégation par groupe.
 * Contexte : locale next-intl + navItems / aide traduits (pas de RBAC).
 */
export function useSiteSearch(
  options?: UseSiteSearchOptions,
): UseSiteSearchResult {
  const enabled = options?.enabled ?? true;
  const debounceMs = options?.debounceMs ?? SITE_SEARCH_DEBOUNCE_MS;

  const locale = useLocale();
  const tNav = useTranslations('nav');
  const tAbout = useTranslations('about');
  const tLegal = useTranslations('legal');
  const helpStringsBySlug = useHelpStringsBySlug();

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [groups, setGroups] = useState<SiteSearchGroupResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasResolved, setHasResolved] = useState(false);

  const requestIdRef = useRef(0);
  const wiredSources = useMemo(() => listWiredSiteSearchSources(), []);

  const navItems = useMemo(
    () =>
      buildSiteNavSearchItems({
        nav: (key) => tNav(key as Parameters<typeof tNav>[0]),
        aboutNav: (key) =>
          tAbout(`nav.${key}` as Parameters<typeof tAbout>[0]),
        legal: (key) => tLegal(key as Parameters<typeof tLegal>[0]),
      }),
    [tNav, tAbout, tLegal],
  );

  const searchContext = useMemo<SiteSearchContext>(
    () => ({
      locale,
      navItems,
      helpStringsBySlug,
    }),
    [locale, navItems, helpStringsBySlug],
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);
    return () => window.clearTimeout(timer);
  }, [query, debounceMs, enabled]);

  useEffect(() => {
    if (!enabled) {
      requestIdRef.current += 1;
      setLoading(false);
      return;
    }

    const requestId = ++requestIdRef.current;
    setLoading(true);

    void runSiteSearchFanOut(wiredSources, debouncedQuery, searchContext)
      .then((runs) => {
        if (requestId !== requestIdRef.current) return;
        setGroups(aggregateSiteSearchResults(runs));
        setHasResolved(true);
      })
      .catch(() => {
        if (requestId !== requestIdRef.current) return;
        setGroups([]);
        setHasResolved(true);
      })
      .finally(() => {
        if (requestId !== requestIdRef.current) return;
        setLoading(false);
      });
  }, [enabled, debouncedQuery, searchContext, wiredSources]);

  const flatItems = useMemo(() => flattenSiteSearchGroups(groups), [groups]);
  const hasResults = flatItems.length > 0;
  const isEmpty =
    hasResolved &&
    !loading &&
    !hasResults &&
    groups.every((group) => !group.error);

  return {
    query,
    setQuery,
    debouncedQuery,
    groups,
    flatItems,
    loading,
    hasResults,
    isEmpty,
  };
}

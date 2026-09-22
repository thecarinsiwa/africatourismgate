'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ADMIN_HELP_ARTICLES } from '../admin-help/help-catalog';
import { stripAdminHelpMarkdownLinks } from '../admin-help/admin-path-links';
import { usePermissions } from '../auth/use-permissions';
import {
  aggregateAdminSearchResults,
  flattenAdminSearchGroups,
  runAdminSearchFanOut,
} from './aggregate';
import { buildAdminNavSearchItems } from './search-pages';
import {
  ADMIN_SEARCH_DEBOUNCE_MS,
  type AdminSearchContext,
  type AdminSearchGroupResult,
  type AdminSearchHelpArticleStrings,
  type AdminSearchResultItem,
} from './types';
import { listWiredAdminSearchSources } from './wired-sources';

export type UseAdminGlobalSearchOptions = {
  /** Quand `false`, aucun fan-out n’est lancé (modal fermée). */
  enabled?: boolean;
  debounceMs?: number;
};

export type UseAdminGlobalSearchResult = {
  query: string;
  setQuery: (value: string) => void;
  debouncedQuery: string;
  groups: AdminSearchGroupResult[];
  flatItems: AdminSearchResultItem[];
  loading: boolean;
  /** Au moins un résultat dans un groupe. */
  hasResults: boolean;
  /**
   * Requête déjà exécutée (debounce passé) sans aucun résultat
   * (ni items, ni erreurs partielles affichables).
   */
  isEmpty: boolean;
};

function useHelpStringsBySlug(): Record<string, AdminSearchHelpArticleStrings> {
  const t = useTranslations('modules.adminHelp');
  return useMemo(() => {
    const strings: Record<string, AdminSearchHelpArticleStrings> = {};
    for (const article of ADMIN_HELP_ARTICLES) {
      strings[article.slug] = {
        title: t(`articles.${article.slug}.title`),
        summary: t(`articles.${article.slug}.summary`),
        body: stripAdminHelpMarkdownLinks(t(`articles.${article.slug}.body`)),
      };
    }
    return strings;
  }, [t]);
}

/**
 * Debounce + fan-out `Promise.allSettled` + agrégation par groupe.
 */
export function useAdminGlobalSearch(
  options?: UseAdminGlobalSearchOptions,
): UseAdminGlobalSearchResult {
  const enabled = options?.enabled ?? true;
  const debounceMs = options?.debounceMs ?? ADMIN_SEARCH_DEBOUNCE_MS;

  const locale = useLocale();
  const tNav = useTranslations('nav');
  const { permissions, isSuperAdmin, loading: permissionsLoading } =
    usePermissions();
  const helpStringsBySlug = useHelpStringsBySlug();

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [groups, setGroups] = useState<AdminSearchGroupResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasResolved, setHasResolved] = useState(false);

  const requestIdRef = useRef(0);
  const wiredSources = useMemo(() => listWiredAdminSearchSources(), []);

  const navItems = useMemo(
    () =>
      buildAdminNavSearchItems(
        (key) => tNav(key as Parameters<typeof tNav>[0]),
        { permissions, isSuperAdmin },
        { permissionsLoading },
      ),
    [tNav, permissions, isSuperAdmin, permissionsLoading],
  );

  const searchContext = useMemo<AdminSearchContext>(
    () => ({
      permissions,
      isSuperAdmin,
      locale,
      navItems,
      helpStringsBySlug,
    }),
    [permissions, isSuperAdmin, locale, navItems, helpStringsBySlug],
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

    if (permissionsLoading) {
      setLoading(true);
      return;
    }

    const requestId = ++requestIdRef.current;
    setLoading(true);

    void runAdminSearchFanOut(wiredSources, debouncedQuery, searchContext)
      .then((runs) => {
        if (requestId !== requestIdRef.current) return;
        setGroups(aggregateAdminSearchResults(runs));
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
  }, [
    enabled,
    debouncedQuery,
    searchContext,
    wiredSources,
    permissionsLoading,
  ]);

  const flatItems = useMemo(() => flattenAdminSearchGroups(groups), [groups]);
  const hasResults = flatItems.length > 0;
  const isEmpty = hasResolved && !loading && !hasResults && groups.every((g) => !g.error);

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

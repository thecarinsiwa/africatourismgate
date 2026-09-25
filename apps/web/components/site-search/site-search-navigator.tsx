'use client';

import { Input, Modal, Skeleton, cn } from '@africatourismgate/ui';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';
import {
  useSiteSearch,
  type SiteSearchGroupId,
  type SiteSearchResultItem,
} from '../../lib/site-search';
import { shouldHandleSiteSearchShortcut } from '../../lib/site-search/shortcuts';
import { SiteSearchResultBody } from './site-search-result-body';

type SiteSearchNavigatorContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
};

const SiteSearchNavigatorContext =
  createContext<SiteSearchNavigatorContextValue | null>(null);

export function useSiteSearchNavigator(): SiteSearchNavigatorContextValue {
  const context = useContext(SiteSearchNavigatorContext);
  if (!context) {
    throw new Error(
      'useSiteSearchNavigator must be used within SiteSearchProvider',
    );
  }
  return context;
}

export function SiteSearchProvider({
  children,
}: {
  children?: ReactNode;
}) {
  const [open, setOpenState] = useState(false);
  const setOpen = useCallback((next: boolean) => {
    setOpenState(next);
  }, []);
  const toggle = useCallback(() => {
    setOpenState((current) => !current);
  }, []);
  const value = useMemo(
    () => ({
      open,
      setOpen,
      toggle,
    }),
    [open, setOpen, toggle],
  );

  return (
    <SiteSearchNavigatorContext.Provider value={value}>
      {children}
      <SiteSearchNavigatorModal />
    </SiteSearchNavigatorContext.Provider>
  );
}

/** Monte le provider + modal sans enfants (usage autonome). */
export function SiteSearchNavigator() {
  return <SiteSearchProvider />;
}

function buildResultsPageHref(query: string): string {
  const trimmed = query.trim();
  const params = new URLSearchParams();
  if (trimmed) {
    params.set('q', trimmed);
  }
  const qs = params.toString();
  return qs ? `/search?${qs}` : '/search';
}

function SiteSearchNavigatorModal() {
  const router = useRouter();
  const { open, setOpen, toggle } = useSiteSearchNavigator();
  const t = useTranslations('siteSearch');
  const listId = useId();
  const [activeIndex, setActiveIndex] = useState(0);
  const optionRefs = useRef<Array<HTMLAnchorElement | null>>([]);

  const {
    query,
    setQuery,
    groups,
    flatItems,
    loading,
    hasResults,
    isEmpty,
  } = useSiteSearch({ enabled: open });

  const handleOpenChange = useCallback(
    (next: boolean) => {
      setOpen(next);
    },
    [setOpen],
  );

  const navigate = useCallback(
    (href: string) => {
      // Push before closing: unmounting the modal first can cancel App Router soft navigation.
      router.push(href);
      handleOpenChange(false);
    },
    [handleOpenChange, router],
  );

  const seeAllHref = buildResultsPageHref(query);
  const showSeeAll = query.trim().length > 0;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!shouldHandleSiteSearchShortcut(event, { searchOpen: open })) {
        return;
      }
      event.preventDefault();
      toggle();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, toggle]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setActiveIndex(0);
    }
  }, [open, setQuery]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open, flatItems.length]);

  useEffect(() => {
    const node = optionRefs.current[activeIndex];
    node?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  function handleListKeyDown(event: ReactKeyboardEvent) {
    if (event.key === 'ArrowDown') {
      if (flatItems.length === 0) return;
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % flatItems.length);
    } else if (event.key === 'ArrowUp') {
      if (flatItems.length === 0) return;
      event.preventDefault();
      setActiveIndex(
        (index) => (index - 1 + flatItems.length) % flatItems.length,
      );
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const item = flatItems[activeIndex];
      if (item) {
        navigate(item.href);
        return;
      }
      if (query.trim()) {
        navigate(seeAllHref);
      }
    }
  }

  const groupLabel = (group: SiteSearchGroupId) =>
    t(`groups.${group}` as Parameters<typeof t>[0]);

  const resultLabels = {
    kindEntity: t('kindEntity'),
    kindPrefilled: t('kindPrefilled'),
  };

  let runningIndex = 0;

  return (
    <Modal
      open={open}
      onOpenChange={handleOpenChange}
      title={t('title')}
      showClose
      closeAriaLabel={t('close')}
      className="max-w-xl"
      containerClassName="z-[80]"
    >
      <div
        className="space-y-3 p-4"
        onKeyDown={handleListKeyDown}
        data-testid="site-search-navigator"
      >
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('placeholder')}
          autoFocus
          aria-label={t('placeholder')}
          aria-controls={listId}
          aria-autocomplete="list"
          data-testid="site-search-input"
        />
        <p className="text-xs text-atg-muted">{t('shortcutHint')}</p>

        <div
          id={listId}
          role="listbox"
          aria-label={t('resultsLabel')}
          className="max-h-80 overflow-y-auto rounded-lg border border-atg-border"
        >
          {loading && !hasResults ? (
            <div className="space-y-2 p-3" aria-busy="true" aria-live="polite">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : null}

          {!loading && isEmpty ? (
            <p className="px-4 py-6 text-center text-sm text-atg-muted">
              {t('empty')}
            </p>
          ) : null}

          {!loading && !hasResults && !isEmpty && groups.some((g) => g.error) ? (
            <p className="px-4 py-6 text-center text-sm text-atg-muted">
              {t('partialError')}
            </p>
          ) : null}

          {groups.map((group) => {
            if (group.items.length === 0 && !group.error) return null;
            return (
              <section
                key={group.group}
                aria-label={groupLabel(group.group)}
                className="border-b border-atg-border last:border-b-0"
              >
                <header className="sticky top-0 z-[1] flex items-center justify-between gap-2 bg-atg-elevated/95 px-3 py-2 backdrop-blur-sm">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-atg-muted">
                    {groupLabel(group.group)}
                  </h3>
                  <span className="flex items-center gap-2">
                    {group.items.length > 0 ? (
                      <span
                        className="text-[10px] tabular-nums text-atg-muted"
                        data-testid="site-search-group-count"
                      >
                        {group.items.length}
                      </span>
                    ) : null}
                    {group.error ? (
                      <span className="text-xs text-amber-700 dark:text-amber-400">
                        {t('groupError')}
                      </span>
                    ) : null}
                  </span>
                </header>
                <ul>
                  {group.items.map((item) => {
                    const index = runningIndex;
                    runningIndex += 1;
                    return (
                      <li key={item.id}>
                        <SearchResultOption
                          item={item}
                          index={index}
                          active={index === activeIndex}
                          listId={listId}
                          labels={resultLabels}
                          optionRef={(node) => {
                            optionRefs.current[index] = node;
                          }}
                          onActivate={() => handleOpenChange(false)}
                          onHover={() => setActiveIndex(index)}
                        />
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}

          {loading && hasResults ? (
            <p className="border-t border-atg-border px-4 py-2 text-center text-xs text-atg-muted">
              {t('updating')}
            </p>
          ) : null}
        </div>

        {showSeeAll ? (
          <div className="flex justify-end">
            <Link
              href={seeAllHref}
              className="text-sm font-medium text-primary hover:underline"
              data-testid="site-search-see-all"
              onClick={() => handleOpenChange(false)}
            >
              {t('seeAllResults')}
            </Link>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}

function SearchResultOption({
  item,
  index,
  active,
  listId,
  labels,
  optionRef,
  onActivate,
  onHover,
}: {
  item: SiteSearchResultItem;
  index: number;
  active: boolean;
  listId: string;
  labels: { kindEntity: string; kindPrefilled: string };
  optionRef: (node: HTMLAnchorElement | null) => void;
  onActivate: () => void;
  onHover: () => void;
}) {
  return (
    <Link
      ref={optionRef}
      href={item.href}
      id={`${listId}-option-${index}`}
      role="option"
      aria-selected={active}
      data-testid="site-search-result"
      className={cn(
        'flex w-full px-4 py-3 text-left transition-colors',
        active ? 'bg-atg-surface' : 'hover:bg-atg-surface/70',
      )}
      onMouseEnter={onHover}
      onClick={onActivate}
    >
      <SiteSearchResultBody item={item} labels={labels} compact />
    </Link>
  );
}

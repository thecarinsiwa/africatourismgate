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
  ADMIN_SEARCH_API_MIN_QUERY_LENGTH,
  useAdminGlobalSearch,
  type AdminSearchGroupId,
  type AdminSearchResultItem,
} from '../lib/admin-search';
import { shouldHandleAdminSearchShortcut } from '../lib/admin-search/shortcuts';

const SUGGESTIONS_LIMIT = 8;

const EMPTY_QUICK_LINKS = [
  { href: '/dashboard', labelKey: 'quickLinks.dashboard' },
  { href: '/aide', labelKey: 'quickLinks.help' },
  { href: '/utilisateurs', labelKey: 'quickLinks.users' },
] as const;

type AdminSearchNavigatorContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
};

const AdminSearchNavigatorContext =
  createContext<AdminSearchNavigatorContextValue | null>(null);

export function useAdminSearchNavigator(): AdminSearchNavigatorContextValue {
  const context = useContext(AdminSearchNavigatorContext);
  if (!context) {
    throw new Error(
      'useAdminSearchNavigator must be used within AdminSearchNavigatorProvider',
    );
  }
  return context;
}

export function AdminSearchNavigatorProvider({
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
    <AdminSearchNavigatorContext.Provider value={value}>
      {children}
      <AdminSearchNavigatorModal />
    </AdminSearchNavigatorContext.Provider>
  );
}

/** Monte le provider + modal (remplace l’ancienne CommandPalette). */
export function AdminSearchNavigator() {
  return <AdminSearchNavigatorProvider />;
}

function AdminSearchNavigatorModal() {
  const router = useRouter();
  const { open, setOpen, toggle } = useAdminSearchNavigator();
  const t = useTranslations('common.globalSearch');
  const listId = useId();
  const [activeIndex, setActiveIndex] = useState(-1);
  const optionRefs = useRef<Array<HTMLAnchorElement | null>>([]);

  const {
    query,
    setQuery,
    groups,
    loading,
    hasResults,
    isEmpty,
  } = useAdminGlobalSearch({ enabled: open });

  const trimmedQuery = query.trim();
  const showSuggestions = trimmedQuery.length === 0 && hasResults && !loading;
  const showMinQueryHint =
    trimmedQuery.length > 0 &&
    trimmedQuery.length < ADMIN_SEARCH_API_MIN_QUERY_LENGTH;

  const displayGroups = useMemo(() => {
    if (!showSuggestions) return groups;
    const pagesGroup = groups.find((g) => g.group === 'pages');
    if (!pagesGroup || pagesGroup.items.length === 0) return groups;
    return [
      {
        ...pagesGroup,
        items: pagesGroup.items.slice(0, SUGGESTIONS_LIMIT),
      },
    ];
  }, [groups, showSuggestions]);

  const displayFlatItems = useMemo(
    () => displayGroups.flatMap((group) => group.items),
    [displayGroups],
  );

  const navigableCount = displayFlatItems.length;
  const activeOptionId =
    activeIndex >= 0 && activeIndex < navigableCount
      ? `${listId}-option-${activeIndex}`
      : undefined;

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

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!shouldHandleAdminSearchShortcut(event, { searchOpen: open })) {
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
      setActiveIndex(-1);
    }
  }, [open, setQuery]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [query, open, displayFlatItems.length]);

  useEffect(() => {
    if (activeIndex < 0) return;
    const node = optionRefs.current[activeIndex];
    node?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  function moveActive(delta: number) {
    if (navigableCount === 0) return;
    setActiveIndex((current) => {
      if (current < 0) {
        return delta > 0 ? 0 : navigableCount - 1;
      }
      return (current + delta + navigableCount) % navigableCount;
    });
  }

  function handleListKeyDown(event: ReactKeyboardEvent) {
    if (navigableCount === 0) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      moveActive(1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      moveActive(-1);
    } else if (event.key === 'Enter') {
      if (activeIndex < 0 || activeIndex >= navigableCount) return;
      event.preventDefault();
      const item = displayFlatItems[activeIndex];
      if (item) navigate(item.href);
    }
  }

  const groupLabel = (group: AdminSearchGroupId) =>
    t(`groups.${group}` as Parameters<typeof t>[0]);

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
        data-testid="admin-search-navigator"
      >
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('placeholder')}
          autoFocus
          autoComplete="off"
          role="combobox"
          aria-label={t('placeholder')}
          aria-controls={listId}
          aria-expanded={open}
          aria-autocomplete="list"
          aria-activedescendant={activeOptionId}
          data-testid="admin-search-input"
        />
        <p className="text-xs text-atg-muted">{t('shortcutHint')}</p>
        {showMinQueryHint ? (
          <p
            className="rounded-md bg-atg-surface px-3 py-2 text-xs text-atg-muted"
            role="status"
            data-testid="admin-search-min-query-hint"
          >
            {t('minQueryHint', { count: ADMIN_SEARCH_API_MIN_QUERY_LENGTH })}
          </p>
        ) : null}

        <div
          id={listId}
          role="listbox"
          aria-label={
            showSuggestions ? t('suggestionsAria') : t('resultsLabel')
          }
          className="max-h-80 overflow-y-auto rounded-lg border border-atg-border"
        >
          {loading && !hasResults ? (
            <div className="space-y-2 p-3" aria-busy="true" aria-live="polite">
              <p className="text-xs text-atg-muted">{t('loading')}</p>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : null}

          {!loading && isEmpty ? (
            <div
              className="space-y-3 px-4 py-6 text-center"
              data-testid="admin-search-empty"
            >
              <p className="text-sm text-atg-muted">{t('empty')}</p>
              <p className="text-sm font-medium text-atg-fg">{t('emptyHint')}</p>
              <ul className="space-y-1">
                {EMPTY_QUICK_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm font-medium text-primary outline-none hover:underline focus-visible:underline"
                      onClick={() => handleOpenChange(false)}
                    >
                      {t(link.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {!loading && !hasResults && !isEmpty && groups.some((g) => g.error) ? (
            <p className="px-4 py-6 text-center text-sm text-atg-muted">
              {t('partialError')}
            </p>
          ) : null}

          {displayGroups.map((group) => {
            if (group.items.length === 0 && !group.error) return null;
            const sectionLabel = showSuggestions
              ? t('suggestionsTitle')
              : groupLabel(group.group);
            return (
              <section
                key={group.group}
                aria-label={sectionLabel}
                className="border-b border-atg-border last:border-b-0"
              >
                <header className="sticky top-0 z-[1] flex items-center justify-between gap-2 bg-atg-elevated/95 px-3 py-2 backdrop-blur-sm">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-atg-muted">
                    {sectionLabel}
                  </h3>
                  {group.error ? (
                    <span className="text-xs text-amber-700 dark:text-amber-400">
                      {t('groupError')}
                    </span>
                  ) : null}
                </header>
                <ul>
                  {group.items.map((item) => {
                    const index = runningIndex;
                    runningIndex += 1;
                    return (
                      <SearchResultOption
                        key={item.id}
                        item={item}
                        index={index}
                        active={index === activeIndex}
                        listId={listId}
                        optionRef={(node) => {
                          optionRefs.current[index] = node;
                        }}
                        onActivate={() => handleOpenChange(false)}
                        onHover={() => setActiveIndex(index)}
                      />
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
      </div>
    </Modal>
  );
}

function SearchResultOption({
  item,
  index,
  active,
  listId,
  optionRef,
  onActivate,
  onHover,
}: {
  item: AdminSearchResultItem;
  index: number;
  active: boolean;
  listId: string;
  optionRef: (node: HTMLAnchorElement | null) => void;
  onActivate: () => void;
  onHover: () => void;
}) {
  const optionId = `${listId}-option-${index}`;
  return (
    <li id={optionId} role="option" aria-selected={active}>
      <Link
        ref={optionRef}
        href={item.href}
        data-testid="admin-search-result"
        tabIndex={-1}
        className={cn(
          'flex w-full flex-col gap-0.5 px-4 py-3 text-left transition-colors',
          active ? 'bg-atg-surface' : 'hover:bg-atg-surface/70',
        )}
        onMouseEnter={onHover}
        onClick={onActivate}
      >
        <span className="text-sm font-medium text-atg-fg">{item.title}</span>
        {item.subtitle ? (
          <span className="truncate text-xs text-atg-muted">{item.subtitle}</span>
        ) : null}
      </Link>
    </li>
  );
}

'use client';

import { Input, Modal, Skeleton, cn } from '@africatourismgate/ui';
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
  type ReactNode,
} from 'react';
import {
  useAdminGlobalSearch,
  type AdminSearchGroupId,
  type AdminSearchResultItem,
} from '../lib/admin-search';
import { shouldHandleAdminSearchShortcut } from '../lib/admin-search/shortcuts';

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
  const [activeIndex, setActiveIndex] = useState(0);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const {
    query,
    setQuery,
    groups,
    flatItems,
    loading,
    hasResults,
    isEmpty,
  } = useAdminGlobalSearch({ enabled: open });

  const handleOpenChange = useCallback(
    (next: boolean) => {
      setOpen(next);
    },
    [setOpen],
  );

  const navigate = useCallback(
    (href: string) => {
      handleOpenChange(false);
      router.push(href);
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

  function handleListKeyDown(event: React.KeyboardEvent) {
    if (flatItems.length === 0) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % flatItems.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex(
        (index) => (index - 1 + flatItems.length) % flatItems.length,
      );
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const item = flatItems[activeIndex];
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
          aria-label={t('placeholder')}
          aria-controls={listId}
          aria-autocomplete="list"
          data-testid="admin-search-input"
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
                      <li key={item.id}>
                        <SearchResultOption
                          item={item}
                          index={index}
                          active={index === activeIndex}
                          listId={listId}
                          optionRef={(node) => {
                            optionRefs.current[index] = node;
                          }}
                          onActivate={() => navigate(item.href)}
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
  optionRef: (node: HTMLButtonElement | null) => void;
  onActivate: () => void;
  onHover: () => void;
}) {
  return (
    <button
      ref={optionRef}
      type="button"
      id={`${listId}-option-${index}`}
      role="option"
      aria-selected={active}
      data-testid="admin-search-result"
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
    </button>
  );
}

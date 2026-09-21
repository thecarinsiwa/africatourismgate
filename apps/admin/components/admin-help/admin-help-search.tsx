'use client';

import { Input, cn } from '@africatourismgate/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
} from 'react';
import {
  ADMIN_HELP_ARTICLES,
  getAdminHelpPopularArticles,
  getAdminHelpQuickStartArticles,
  searchAdminHelpArticles,
  type AdminHelpArticle,
  type AdminHelpArticleSearchStrings,
} from '../../lib/admin-help/help-catalog';
import { adminHelpArticlePath } from '../../lib/admin-help/routes';
import { AdminHelpHighlightText } from './admin-help-highlight';

const EMPTY_SEARCH_QUICK_START_LIMIT = 4;
const FOCUS_SUGGESTIONS_LIMIT = 5;
const SEARCH_DEBOUNCE_MS = 175;

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={cn('h-5 w-5', className)}
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function useArticleSearchStrings(): Record<
  string,
  AdminHelpArticleSearchStrings
> {
  const t = useTranslations('modules.adminHelp');
  const strings: Record<string, AdminHelpArticleSearchStrings> = {};
  for (const article of ADMIN_HELP_ARTICLES) {
    strings[article.slug] = {
      title: t(`articles.${article.slug}.title`),
      summary: t(`articles.${article.slug}.summary`),
      body: t(`articles.${article.slug}.body`),
    };
  }
  return strings;
}

export function AdminHelpSearch() {
  const t = useTranslations('modules.adminHelp.ui');
  const tArticles = useTranslations('modules.adminHelp');
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputId = useId();
  const listId = useId();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const stringsBySlug = useArticleSearchStrings();
  const results = searchAdminHelpArticles(debouncedQuery, stringsBySlug);
  const popularSuggestions = getAdminHelpPopularArticles().slice(
    0,
    FOCUS_SUGGESTIONS_LIMIT,
  );
  const quickStartSuggestions = getAdminHelpQuickStartArticles().slice(
    0,
    EMPTY_SEARCH_QUICK_START_LIMIT,
  );
  const hasQuery = debouncedQuery.trim().length > 0;
  const showSuggestions =
    isFocused && !hasQuery && popularSuggestions.length > 0;
  const showResults = hasQuery;
  const showPanel = showResults || showSuggestions;
  const listItems: AdminHelpArticle[] = showResults
    ? results
    : popularSuggestions;
  const listNavigable = showSuggestions || (showResults && results.length > 0);
  const activeOptionId =
    activeIndex >= 0 && activeIndex < listItems.length
      ? `${listId}-option-${activeIndex}`
      : undefined;

  useEffect(() => {
    const delay = query.trim().length === 0 ? 0 : SEARCH_DEBOUNCE_MS;
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query);
      setActiveIndex(-1);
    }, delay);
    return () => window.clearTimeout(timer);
  }, [query]);

  function updateQuery(next: string) {
    setQuery(next);
  }

  function handleFocus() {
    setIsFocused(true);
  }

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    const next = event.relatedTarget as Node | null;
    if (containerRef.current?.contains(next)) {
      return;
    }
    setIsFocused(false);
    setActiveIndex(-1);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!listNavigable) {
      if (event.key === 'Escape') {
        updateQuery('');
        setIsFocused(false);
        (event.target as HTMLInputElement).blur();
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault();
        setActiveIndex((current) =>
          current < listItems.length - 1 ? current + 1 : 0,
        );
        break;
      }
      case 'ArrowUp': {
        event.preventDefault();
        setActiveIndex((current) =>
          current <= 0 ? listItems.length - 1 : current - 1,
        );
        break;
      }
      case 'Enter': {
        if (activeIndex < 0 || activeIndex >= listItems.length) {
          return;
        }
        event.preventDefault();
        const article = listItems[activeIndex];
        router.push(
          adminHelpArticlePath(article.categorySlug, article.slug),
        );
        break;
      }
      case 'Escape': {
        event.preventDefault();
        if (hasQuery) {
          updateQuery('');
        } else {
          setIsFocused(false);
          (event.target as HTMLInputElement).blur();
        }
        break;
      }
      default:
        break;
    }
  }

  return (
    <div
      ref={containerRef}
      className="w-full"
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      <Input
        id={inputId}
        type="search"
        name="admin-help-search"
        autoComplete="off"
        label={t('searchLabel')}
        placeholder={t('searchPlaceholder')}
        value={query}
        onChange={(event) => updateQuery(event.target.value)}
        onKeyDown={handleKeyDown}
        aria-controls={showPanel ? listId : undefined}
        aria-expanded={showPanel}
        aria-activedescendant={activeOptionId}
        role="combobox"
        aria-autocomplete="list"
        trailing={<SearchIcon className="text-atg-muted" />}
      />

      {showPanel ? (
        <div
          id={listId}
          role="listbox"
          aria-label={
            showSuggestions ? t('searchSuggestionsAria') : t('searchResultsAria')
          }
          className="mt-3 border-t border-atg-border pt-3 dark:border-atg-border"
        >
          {showSuggestions ? (
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-atg-muted">
                {t('popularTitle')}
              </p>
              <ul className="divide-y divide-atg-border dark:divide-atg-border">
                {popularSuggestions.map((article, index) => {
                  const strings = stringsBySlug[article.slug];
                  const optionId = `${listId}-option-${index}`;
                  const isActive = index === activeIndex;
                  return (
                    <li
                      key={article.id}
                      id={optionId}
                      role="option"
                      aria-selected={isActive}
                    >
                      <Link
                        href={adminHelpArticlePath(
                          article.categorySlug,
                          article.slug,
                        )}
                        className={cn(
                          'block min-w-0 rounded-md px-2 py-3 outline-none transition-colors hover:text-primary focus-visible:text-primary',
                          isActive && 'bg-primary/5 text-primary',
                        )}
                        onMouseEnter={() => setActiveIndex(index)}
                      >
                        <span className="block break-words text-sm font-medium text-atg-fg">
                          {strings?.title}
                        </span>
                        {strings?.summary ? (
                          <span className="mt-0.5 block break-words text-sm text-atg-muted">
                            {strings.summary}
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : results.length === 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-atg-muted">{t('searchNoResults')}</p>
              {quickStartSuggestions.length > 0 ? (
                <div>
                  <p className="text-sm font-medium text-atg-fg">
                    {t('searchNoResultsHint')}
                  </p>
                  <ul className="mt-2 space-y-1">
                    {quickStartSuggestions.map((article) => (
                      <li key={article.id}>
                        <Link
                          href={adminHelpArticlePath(
                            article.categorySlug,
                            article.slug,
                          )}
                          className="text-sm font-medium text-primary outline-none hover:underline focus-visible:underline"
                        >
                          {tArticles(`articles.${article.slug}.title`)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3">
                    <a
                      href="#admin-help-quick-start"
                      className="text-sm text-atg-muted outline-none hover:text-primary hover:underline focus-visible:text-primary focus-visible:underline"
                    >
                      {t('quickStartTitle')}
                    </a>
                  </p>
                </div>
              ) : null}
            </div>
          ) : (
            <ul className="divide-y divide-atg-border dark:divide-atg-border">
              {results.map((article, index) => {
                const strings = stringsBySlug[article.slug];
                const optionId = `${listId}-option-${index}`;
                const isActive = index === activeIndex;
                return (
                  <li
                    key={article.id}
                    id={optionId}
                    role="option"
                    aria-selected={isActive}
                  >
                    <Link
                      href={adminHelpArticlePath(
                        article.categorySlug,
                        article.slug,
                      )}
                      className={cn(
                        'block min-w-0 rounded-md px-2 py-3 outline-none transition-colors hover:text-primary focus-visible:text-primary',
                        isActive && 'bg-primary/5 text-primary',
                      )}
                      onMouseEnter={() => setActiveIndex(index)}
                    >
                      <span className="block break-words text-sm font-medium text-atg-fg">
                        {strings?.title ? (
                          <AdminHelpHighlightText
                            text={strings.title}
                            query={debouncedQuery}
                          />
                        ) : null}
                      </span>
                      {strings?.summary ? (
                        <span className="mt-0.5 block break-words text-sm text-atg-muted">
                          <AdminHelpHighlightText
                            text={strings.summary}
                            query={debouncedQuery}
                          />
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}

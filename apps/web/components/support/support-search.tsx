'use client';

import { Input, cn } from '@africatourismgate/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
} from 'react';
import {
  HELP_ARTICLES,
  getPopularArticles,
  getQuickStartArticles,
  searchHelpArticles,
  type HelpArticle,
  type HelpArticleSearchStrings,
} from '../../lib/support/help-catalog';
import { supportArticlePath, SUPPORT_BASE_PATH } from '../../lib/support/routes';
import { stripWebHelpMarkdownLinks } from '../../lib/support/web-path-links';
import { SupportHelpHighlightText } from './support-help-highlight';
import { HelpSearchIcon } from './support-help-icons';

const EMPTY_SEARCH_QUICK_START_LIMIT = 4;
const FOCUS_SUGGESTIONS_LIMIT = 5;
const SEARCH_DEBOUNCE_MS = 175;

function useArticleSearchStrings(): Record<string, HelpArticleSearchStrings> {
  const t = useTranslations('support');

  return useMemo(() => {
    const strings: Record<string, HelpArticleSearchStrings> = {};
    for (const article of HELP_ARTICLES) {
      strings[article.slug] = {
        title: t(`help.articles.${article.slug}.title`),
        summary: t(`help.articles.${article.slug}.summary`),
        body: stripWebHelpMarkdownLinks(
          t(`help.articles.${article.slug}.body`),
        ),
      };
    }
    return strings;
  }, [t]);
}

export function SupportSearch() {
  const t = useTranslations('support');
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputId = useId();
  const listId = useId();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const stringsBySlug = useArticleSearchStrings();
  const results = useMemo(
    () => searchHelpArticles(debouncedQuery, stringsBySlug),
    [debouncedQuery, stringsBySlug],
  );
  const popularSuggestions = useMemo(
    () => getPopularArticles().slice(0, FOCUS_SUGGESTIONS_LIMIT),
    [],
  );
  const quickStartSuggestions = useMemo(
    () => getQuickStartArticles().slice(0, EMPTY_SEARCH_QUICK_START_LIMIT),
    [],
  );
  const hasQuery = debouncedQuery.trim().length > 0;
  const showSuggestions =
    isFocused && !hasQuery && popularSuggestions.length > 0;
  const showResults = hasQuery;
  const showPanel = showResults || showSuggestions;
  const listItems: HelpArticle[] = showResults
    ? results
    : popularSuggestions;
  const listNavigable =
    showSuggestions || (showResults && results.length > 0);
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
          supportArticlePath(article.categorySlug, article.slug),
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
        name="help-search"
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
        trailing={<HelpSearchIcon className="text-atg-muted" />}
        inputClassName="py-3.5 text-base sm:text-sm"
      />

      {showPanel ? (
        <div
          id={listId}
          role="listbox"
          aria-label={
            showSuggestions
              ? t('searchSuggestionsAria')
              : t('searchResultsAria')
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
                        href={supportArticlePath(
                          article.categorySlug,
                          article.slug,
                        )}
                        className={cn(
                          'block py-3 outline-none transition-colors hover:text-primary focus-visible:text-primary',
                          isActive && 'bg-primary/5 text-primary',
                        )}
                        onMouseEnter={() => setActiveIndex(index)}
                      >
                        <span className="block text-sm font-medium text-atg-fg">
                          {strings?.title}
                        </span>
                        {strings?.summary ? (
                          <span className="mt-0.5 block text-sm text-atg-muted">
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
                          href={supportArticlePath(
                            article.categorySlug,
                            article.slug,
                          )}
                          className="text-sm font-medium text-primary outline-none hover:underline focus-visible:underline"
                        >
                          {t(`help.articles.${article.slug}.title`)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3">
                    <a
                      href="#support-quick-start"
                      className="text-sm text-atg-muted outline-none hover:text-primary hover:underline focus-visible:text-primary focus-visible:underline"
                    >
                      {t('quickStartTitle')}
                    </a>
                  </p>
                </div>
              ) : null}
              <p>
                <Link
                  href={`${SUPPORT_BASE_PATH}#support-form`}
                  className="text-sm font-medium text-primary outline-none hover:underline focus-visible:underline"
                >
                  {t('searchContactCta')}
                </Link>
              </p>
            </div>
          ) : (
            <div>
              <p
                className="mb-1 text-xs font-medium text-atg-muted"
                aria-live="polite"
              >
                {t('searchResultsCount', { count: results.length })}
              </p>
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
                        href={supportArticlePath(
                          article.categorySlug,
                          article.slug,
                        )}
                        className={cn(
                          'block py-3 outline-none transition-colors hover:text-primary focus-visible:text-primary',
                          isActive && 'bg-primary/5 text-primary',
                        )}
                        onMouseEnter={() => setActiveIndex(index)}
                      >
                        <span className="block text-sm font-medium text-atg-fg">
                          {strings?.title ? (
                            <SupportHelpHighlightText
                              text={strings.title}
                              query={debouncedQuery}
                            />
                          ) : null}
                        </span>
                        {strings?.summary ? (
                          <span className="mt-0.5 block text-sm text-atg-muted">
                            <SupportHelpHighlightText
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
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

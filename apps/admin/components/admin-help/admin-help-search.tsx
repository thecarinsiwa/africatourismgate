'use client';

import { Input, cn } from '@africatourismgate/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useId, useState, type KeyboardEvent } from 'react';
import {
  ADMIN_HELP_ARTICLES,
  searchAdminHelpArticles,
  type AdminHelpArticleSearchStrings,
} from '../../lib/admin-help/help-catalog';
import { adminHelpArticlePath } from '../../lib/admin-help/routes';

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
  const router = useRouter();
  const inputId = useId();
  const listId = useId();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const stringsBySlug = useArticleSearchStrings();
  const results = searchAdminHelpArticles(query, stringsBySlug);
  const showResults = query.trim().length > 0;
  const activeOptionId =
    activeIndex >= 0 && activeIndex < results.length
      ? `${listId}-option-${activeIndex}`
      : undefined;

  function updateQuery(next: string) {
    setQuery(next);
    setActiveIndex(-1);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!showResults || results.length === 0) {
      if (event.key === 'Escape') {
        updateQuery('');
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault();
        setActiveIndex((current) =>
          current < results.length - 1 ? current + 1 : 0,
        );
        break;
      }
      case 'ArrowUp': {
        event.preventDefault();
        setActiveIndex((current) =>
          current <= 0 ? results.length - 1 : current - 1,
        );
        break;
      }
      case 'Enter': {
        if (activeIndex < 0 || activeIndex >= results.length) {
          return;
        }
        event.preventDefault();
        const article = results[activeIndex];
        router.push(
          adminHelpArticlePath(article.categorySlug, article.slug),
        );
        break;
      }
      case 'Escape': {
        event.preventDefault();
        updateQuery('');
        break;
      }
      default:
        break;
    }
  }

  return (
    <div className="w-full">
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
        aria-controls={showResults ? listId : undefined}
        aria-expanded={showResults}
        aria-activedescendant={activeOptionId}
        role="combobox"
        aria-autocomplete="list"
        trailing={<SearchIcon className="text-atg-muted" />}
      />

      {showResults ? (
        <div
          id={listId}
          role="listbox"
          aria-label={t('searchResultsAria')}
          className="mt-3 border-t border-atg-border pt-3 dark:border-atg-border"
        >
          {results.length === 0 ? (
            <p className="text-sm text-atg-muted">{t('searchNoResults')}</p>
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
          )}
        </div>
      ) : null}
    </div>
  );
}

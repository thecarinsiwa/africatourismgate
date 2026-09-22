'use client';

import { Input, cn } from '@africatourismgate/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useId, useState, type KeyboardEvent } from 'react';
import {
  HELP_ARTICLES,
  searchHelpArticles,
  type HelpArticleSearchStrings,
} from '../../lib/support/help-catalog';
import { supportArticlePath, SUPPORT_BASE_PATH } from '../../lib/support/routes';
import { stripWebHelpMarkdownLinks } from '../../lib/support/web-path-links';
import { HelpSearchIcon } from './support-help-icons';

function useArticleSearchStrings(): Record<string, HelpArticleSearchStrings> {
  const t = useTranslations('support');
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
}

export function SupportSearch() {
  const t = useTranslations('support');
  const router = useRouter();
  const inputId = useId();
  const listId = useId();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const stringsBySlug = useArticleSearchStrings();
  const results = searchHelpArticles(query, stringsBySlug);
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
          supportArticlePath(article.categorySlug, article.slug),
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
        name="help-search"
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
        trailing={<HelpSearchIcon className="text-atg-muted" />}
        inputClassName="py-3.5 text-base sm:text-sm"
      />

      {showResults ? (
        <div
          id={listId}
          role="listbox"
          aria-label={t('searchResultsAria')}
          className="mt-3 border-t border-atg-border pt-3 dark:border-atg-border"
        >
          {results.length === 0 ? (
            <div className="space-y-2">
              <p className="text-sm text-atg-muted">{t('searchNoResults')}</p>
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
                        {strings?.title}
                      </span>
                      <span className="mt-0.5 block text-sm text-atg-muted">
                        {strings?.summary}
                      </span>
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

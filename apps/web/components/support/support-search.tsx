'use client';

import { Input } from '@africatourismgate/ui';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useId, useState } from 'react';
import {
  HELP_ARTICLES,
  searchHelpArticles,
  type HelpArticleSearchStrings,
} from '../../lib/support/help-catalog';
import { supportArticlePath } from '../../lib/support/routes';
import { HelpSearchIcon } from './support-help-icons';

function useArticleSearchStrings(): Record<string, HelpArticleSearchStrings> {
  const t = useTranslations('support');
  const strings: Record<string, HelpArticleSearchStrings> = {};
  for (const article of HELP_ARTICLES) {
    strings[article.slug] = {
      title: t(`help.articles.${article.slug}.title`),
      summary: t(`help.articles.${article.slug}.summary`),
      body: t(`help.articles.${article.slug}.body`),
    };
  }
  return strings;
}

export function SupportSearch() {
  const t = useTranslations('support');
  const inputId = useId();
  const listId = useId();
  const [query, setQuery] = useState('');
  const stringsBySlug = useArticleSearchStrings();
  const results = searchHelpArticles(query, stringsBySlug);
  const showResults = query.trim().length > 0;

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
        onChange={(event) => setQuery(event.target.value)}
        aria-controls={showResults ? listId : undefined}
        aria-expanded={showResults}
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
            <p className="text-sm text-atg-muted">{t('searchNoResults')}</p>
          ) : (
            <ul className="divide-y divide-atg-border dark:divide-atg-border">
              {results.map((article) => {
                const strings = stringsBySlug[article.slug];
                return (
                  <li key={article.id} role="option">
                    <Link
                      href={supportArticlePath(
                        article.categorySlug,
                        article.slug,
                      )}
                      className="block py-3 outline-none transition-colors hover:text-primary focus-visible:text-primary"
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

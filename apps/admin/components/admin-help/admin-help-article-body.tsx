'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  getAdminHelpArticleBySlug,
  getAdminHelpRelatedArticles,
  type AdminHelpArticle,
} from '../../lib/admin-help/help-catalog';
import { adminHelpArticlePath } from '../../lib/admin-help/routes';

export type AdminHelpArticleBodyProps = {
  article: AdminHelpArticle;
};

function AdminHelpRelatedArticles({ article }: { article: AdminHelpArticle }) {
  const t = useTranslations('modules.adminHelp');
  const tUi = useTranslations('modules.adminHelp.ui');
  const related = getAdminHelpRelatedArticles(article);

  if (related.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="admin-help-related-heading"
      className="mt-12 border-t border-atg-border pt-8 dark:border-atg-border"
    >
      <h2
        id="admin-help-related-heading"
        className="text-lg font-semibold text-atg-fg"
      >
        {tUi('relatedTitle')}
      </h2>
      <ul className="mt-4 divide-y divide-atg-border border-y border-atg-border dark:divide-atg-border dark:border-atg-border">
        {related.map((item) => (
          <li key={item.id}>
            <Link
              href={adminHelpArticlePath(item.categorySlug, item.slug)}
              className="flex min-w-0 items-start justify-between gap-3 py-3.5 outline-none transition-colors hover:text-primary focus-visible:text-primary"
            >
              <span className="min-w-0 break-words text-sm font-medium text-atg-fg">
                {t(`articles.${item.slug}.title`)}
              </span>
              <span aria-hidden className="mt-0.5 shrink-0 text-atg-muted">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function AdminHelpArticleBody({ article }: AdminHelpArticleBodyProps) {
  const t = useTranslations('modules.adminHelp');
  const body = t(`articles.${article.slug}.body`);
  const paragraphs = body
    .split(/\n\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <>
      {paragraphs.length > 0 ? (
        <div className="space-y-4 text-base leading-relaxed text-atg-fg">
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="m-0 break-words">
              {paragraph}
            </p>
          ))}
        </div>
      ) : null}

      <AdminHelpRelatedArticles article={article} />
    </>
  );
}

/** Resolve article by slug then render body + related (returns null if unknown). */
export function AdminHelpArticleBodyBySlug({
  articleSlug,
}: {
  articleSlug: string;
}) {
  const article = getAdminHelpArticleBySlug(articleSlug);
  if (!article) {
    return null;
  }
  return <AdminHelpArticleBody article={article} />;
}

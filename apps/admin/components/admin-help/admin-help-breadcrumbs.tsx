'use client';

import type { BreadcrumbItem } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { adminHelpCategoryPath } from '../../lib/admin-help/routes';
import { useSetAdminPageMeta } from '../admin-page-meta-context';

export type AdminHelpBreadcrumbsProps = {
  categorySlug: string;
  articleSlug?: string;
};

/**
 * Builds breadcrumb tail segments after the hub (`/aide` → Centre d'aide).
 * Category alone is the current page; with an article, category stays a link.
 */
export function buildAdminHelpBreadcrumbTail({
  categorySlug,
  categoryTitle,
  articleSlug,
  articleTitle,
}: {
  categorySlug: string;
  categoryTitle: string;
  articleSlug?: string;
  articleTitle?: string;
}): BreadcrumbItem[] {
  if (articleSlug && articleTitle) {
    return [
      {
        label: categoryTitle,
        href: adminHelpCategoryPath(categorySlug),
      },
      { label: articleTitle },
    ];
  }

  return [{ label: categoryTitle }];
}

/**
 * Registers shell title + breadcrumb trail for help category/article pages.
 * Renders nothing — the dashboard shell displays the crumbs.
 */
export function AdminHelpBreadcrumbs({
  categorySlug,
  articleSlug,
}: AdminHelpBreadcrumbsProps) {
  const t = useTranslations('modules.adminHelp');
  const categoryTitle = t(`categories.${categorySlug}.title`);
  const articleTitle = articleSlug
    ? t(`articles.${articleSlug}.title`)
    : undefined;

  const breadcrumbTail = useMemo(
    () =>
      buildAdminHelpBreadcrumbTail({
        categorySlug,
        categoryTitle,
        articleSlug,
        articleTitle,
      }),
    [categorySlug, categoryTitle, articleSlug, articleTitle],
  );

  const title = articleTitle ?? categoryTitle;

  useSetAdminPageMeta({ title, breadcrumbTail });

  return null;
}

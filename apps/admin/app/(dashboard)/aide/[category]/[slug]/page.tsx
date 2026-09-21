import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { AideArticlePageContent } from '../../../../../components/pages/aide-article-page-content';
import {
  getAdminHelpArticleStaticParams,
  isValidAdminHelpArticlePath,
} from '../../../../../lib/admin-help/help-catalog';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';

type PageProps = {
  params: { category: string; slug: string };
};

export function generateStaticParams() {
  return getAdminHelpArticleStaticParams();
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const base = await getAdminPageMetadata('aide/category/slug');

  if (!isValidAdminHelpArticlePath(params.category, params.slug)) {
    return base;
  }

  const t = await getTranslations('modules.adminHelp');
  const summary = t(`articles.${params.slug}.summary`);

  return {
    ...base,
    title: t(`articles.${params.slug}.title`),
    ...(summary ? { description: summary } : {}),
  };
}

export default function AideArticlePage({ params }: PageProps) {
  if (!isValidAdminHelpArticlePath(params.category, params.slug)) {
    notFound();
  }

  return (
    <AideArticlePageContent
      categorySlug={params.category}
      articleSlug={params.slug}
    />
  );
}

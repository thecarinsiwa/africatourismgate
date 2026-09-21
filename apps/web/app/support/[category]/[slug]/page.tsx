import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { SupportArticlePageContent } from '../../../components/support/support-article-page-content';
import {
  getArticleBySlug,
  getHelpArticleStaticParams,
  isValidHelpArticlePath,
} from '../../../lib/support/help-catalog';
import { supportArticlePath } from '../../../lib/support/routes';

const LANG_ALTERNATES = ['fr', 'en', 'es'] as const;

type PageProps = {
  params: { category: string; slug: string };
};

export function generateStaticParams() {
  return getHelpArticleStaticParams();
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const t = await getTranslations('support');

  if (!isValidHelpArticlePath(params.category, params.slug)) {
    return { title: t('metaTitle') };
  }

  const article = getArticleBySlug(params.slug);
  if (!article) {
    return { title: t('metaTitle') };
  }

  const title = t(`help.articles.${article.slug}.title`);
  const description = t(`help.articles.${article.slug}.summary`);
  const path = supportArticlePath(article.categorySlug, article.slug);
  const languages = Object.fromEntries(
    LANG_ALTERNATES.map((lang) => [lang, `${path}?lang=${lang}`]),
  );

  return {
    title: `${title} | ${t('pageTitle')}`,
    description,
    alternates: {
      canonical: path,
      languages,
    },
    openGraph: {
      title,
      description,
      url: path,
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

export default function SupportArticlePage({ params }: PageProps) {
  if (!isValidHelpArticlePath(params.category, params.slug)) {
    notFound();
  }

  return (
    <SupportArticlePageContent
      categorySlug={params.category}
      articleSlug={params.slug}
    />
  );
}

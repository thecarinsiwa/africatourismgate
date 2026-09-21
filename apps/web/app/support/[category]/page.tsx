import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { SupportCategoryPageContent } from '../../../components/support/support-category-page-content';
import {
  getCategoryBySlug,
  getHelpCategoryStaticParams,
  isValidHelpCategorySlug,
  type HelpCategorySlug,
} from '../../../lib/support/help-catalog';
import { supportCategoryPath } from '../../../lib/support/routes';

const LANG_ALTERNATES = ['fr', 'en', 'es'] as const;

type PageProps = {
  params: { category: string };
};

export function generateStaticParams() {
  return getHelpCategoryStaticParams();
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const t = await getTranslations('support');

  if (!isValidHelpCategorySlug(params.category)) {
    return { title: t('metaTitle') };
  }

  const category = getCategoryBySlug(params.category);
  if (!category) {
    return { title: t('metaTitle') };
  }

  const title = t(`help.categories.${category.slug}.title`);
  const description = t(`help.categories.${category.slug}.description`);
  const path = supportCategoryPath(category.slug);
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
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

export default function SupportCategoryPage({ params }: PageProps) {
  if (!isValidHelpCategorySlug(params.category)) {
    notFound();
  }

  return (
    <SupportCategoryPageContent
      categorySlug={params.category as HelpCategorySlug}
    />
  );
}

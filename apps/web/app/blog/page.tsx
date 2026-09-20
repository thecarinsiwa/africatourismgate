import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { BlogPageContent } from '../../components/blog/blog-page-content';

const LANG_ALTERNATES = ['fr', 'en', 'es'] as const;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('blog');
  const title = t('metaTitle');
  const description = t('metaDescription');
  const languages = Object.fromEntries(
    LANG_ALTERNATES.map((lang) => [lang, `/blog?lang=${lang}`]),
  );

  return {
    title,
    description,
    alternates: {
      canonical: '/blog',
      languages,
    },
    openGraph: {
      title,
      description,
      url: '/blog',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

export default function BlogPage() {
  return <BlogPageContent />;
}

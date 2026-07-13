import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { BlogPageContent } from '../../components/blog/blog-page-content';
import { translations } from '../../lib/i18n/translations';
import { isLocale } from '../../lib/i18n/types';

const LANG_ALTERNATES = ['fr', 'en', 'es'] as const;

export async function generateMetadata(): Promise<Metadata> {
  const rawLocale = await getLocale();
  const locale = isLocale(rawLocale) ? rawLocale : 'fr';
  const blog = translations[locale].blog;

  const languages = Object.fromEntries(
    LANG_ALTERNATES.map((lang) => [lang, `/blog?lang=${lang}`]),
  );

  return {
    title: blog.metaTitle,
    description: blog.metaDescription,
    alternates: {
      canonical: '/blog',
      languages,
    },
    openGraph: {
      title: blog.metaTitle,
      description: blog.metaDescription,
      url: '/blog',
      type: 'website',
    },
  };
}

export default function BlogPage() {
  return <BlogPageContent />;
}

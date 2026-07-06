import type { Metadata } from 'next';
import { BlogPageContent } from '../../components/blog/blog-page-content';

export const metadata: Metadata = {
  title: 'Blog voyage en Afrique',
  description:
    'Conseils, guides et inspirations pour préparer votre prochain voyage en Afrique avec Africa Tourism Gate.',
  alternates: {
    canonical: '/blog',
    languages: {
      fr: '/blog?lang=fr',
      en: '/blog?lang=en',
      es: '/blog?lang=es',
    },
  },
};

export default function BlogPage() {
  return <BlogPageContent />;
}

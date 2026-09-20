import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { SupportPageContent } from '../../components/support/support-page-content';

const LANG_ALTERNATES = ['fr', 'en', 'es'] as const;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('support');
  const title = t('metaTitle');
  const description = t('metaDescription');
  const languages = Object.fromEntries(
    LANG_ALTERNATES.map((lang) => [lang, `/support?lang=${lang}`]),
  );

  return {
    title,
    description,
    alternates: {
      canonical: '/support',
      languages,
    },
    openGraph: {
      title,
      description,
      url: '/support',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

export default function SupportPage() {
  return <SupportPageContent />;
}

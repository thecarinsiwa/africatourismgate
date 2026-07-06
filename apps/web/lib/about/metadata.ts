import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import type { AboutNavLabelKey } from './routes';
import { translations } from '../i18n/translations';
import { isLocale } from '../i18n/types';

const LANG_ALTERNATES = ['fr', 'en', 'es'] as const;

export async function buildAboutPageMetadata(
  canonicalPath: string,
  metaKey: AboutNavLabelKey,
): Promise<Metadata> {
  const rawLocale = await getLocale();
  const locale = isLocale(rawLocale) ? rawLocale : 'fr';
  const meta = translations[locale].about.meta[metaKey];

  const languages = Object.fromEntries(
    LANG_ALTERNATES.map((lang) => [lang, `${canonicalPath}?lang=${lang}`]),
  );

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: canonicalPath,
      languages,
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: canonicalPath,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: meta.title,
      description: meta.description,
    },
  };
}

import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import type { AboutNavLabelKey } from './routes';

const LANG_ALTERNATES = ['fr', 'en', 'es'] as const;

function buildAboutMetadata(
  canonicalPath: string,
  meta: { title: string; description: string },
): Metadata {
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

export async function buildAboutPageMetadata(
  canonicalPath: string,
  metaKey: AboutNavLabelKey,
): Promise<Metadata> {
  const t = await getTranslations('about');
  return buildAboutMetadata(canonicalPath, {
    title: t(`meta.${metaKey}.title`),
    description: t(`meta.${metaKey}.description`),
  });
}

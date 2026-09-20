import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { LEGAL_PATHS } from './routes';

const LANG_ALTERNATES = ['fr', 'en', 'es'] as const;

function buildLegalMetadata(
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

export async function buildTermsOfUseMetadata(): Promise<Metadata> {
  const t = await getTranslations('legal');
  return buildLegalMetadata(LEGAL_PATHS.termsOfUse, {
    title: t('meta.termsOfUse.title'),
    description: t('meta.termsOfUse.description'),
  });
}

export async function buildPrivacyPolicyMetadata(): Promise<Metadata> {
  const t = await getTranslations('legal');
  return buildLegalMetadata(LEGAL_PATHS.privacyPolicy, {
    title: t('meta.privacyPolicy.title'),
    description: t('meta.privacyPolicy.description'),
  });
}

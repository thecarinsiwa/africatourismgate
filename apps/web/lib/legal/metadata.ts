import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { translations } from '../i18n/translations';
import { isLocale } from '../i18n/types';
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
  const rawLocale = await getLocale();
  const locale = isLocale(rawLocale) ? rawLocale : 'fr';
  return buildLegalMetadata(
    LEGAL_PATHS.termsOfUse,
    translations[locale].legal.meta.termsOfUse,
  );
}

export async function buildPrivacyPolicyMetadata(): Promise<Metadata> {
  const rawLocale = await getLocale();
  const locale = isLocale(rawLocale) ? rawLocale : 'fr';
  return buildLegalMetadata(
    LEGAL_PATHS.privacyPolicy,
    translations[locale].legal.meta.privacyPolicy,
  );
}

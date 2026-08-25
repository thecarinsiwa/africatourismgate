'use client';

import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

const CONTENT_LOCALES = ['fr', 'en', 'es'] as const;

export function useContentLocaleOptions(
  namespace: 'modules.about.locale' | 'modules.heroSlides.locale',
) {
  const t = useTranslations(namespace);

  return useMemo(
    () =>
      CONTENT_LOCALES.map((locale) => ({
        value: locale,
        label: t(locale),
      })),
    [t],
  );
}

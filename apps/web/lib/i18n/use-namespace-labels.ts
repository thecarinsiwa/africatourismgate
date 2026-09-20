'use client';

import { useLocale, useMessages, useTranslations } from 'next-intl';
import { useMemo } from 'react';
import type { Translations } from './message-types';

type Phase3Namespace =
  | 'hotels'
  | 'flights'
  | 'cars'
  | 'cruises'
  | 'activities'
  | 'packages';

export type VerticalLabels<N extends Phase3Namespace> = NonNullable<Translations[N]>;

/**
 * Vertical message bag for prop-drilling into cards/sidebars still typed as
 * `Translations[ns]`. Restores `galleryCounter` as a function from the ICU string.
 */
export function useNamespaceLabels<N extends Phase3Namespace>(namespace: N): VerticalLabels<N> {
  const locale = useLocale();
  const messages = useMessages();
  const t = useTranslations(namespace);
  const raw = (messages as Record<string, unknown>)[namespace];

  return useMemo(() => {
    const base = { ...((raw ?? {}) as Record<string, unknown>) };
    delete base.galleryCounter;
    return {
      ...base,
      galleryCounter: (current: number, total: number) =>
        (t as unknown as (key: string, values?: Record<string, number>) => string)(
          'galleryCounter',
          { current, total },
        ),
    } as VerticalLabels<N>;
  }, [raw, t, locale]);
}

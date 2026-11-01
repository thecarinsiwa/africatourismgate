'use client';

import type { PublicFooter } from '@africatourismgate/types/organization-settings';
import { useLocale } from 'next-intl';
import { useEffect, useState } from 'react';
import { getPublicFooter } from './footer';

/**
 * Loads CMS footer copy for the active locale.
 * Returns `null` while loading or if the public endpoint fails — callers
 * should fall back to next-intl `footer.*` strings.
 */
export function useResolvedPublicFooter(): PublicFooter | null {
  const locale = useLocale();
  const [footer, setFooter] = useState<PublicFooter | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const next = await getPublicFooter(locale);
      if (!cancelled) setFooter(next);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [locale]);

  return footer;
}

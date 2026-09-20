'use client';

import { useLocale as useNextIntlLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { applyLocaleToDocument, resolveInitialLocale } from './preferred-language';
import type { Locale } from './types';

/**
 * Syncs cookie/localStorage/user preferred language with next-intl on first paint.
 * Replaces the mount side-effect formerly in LocaleProvider (no translation bag).
 */
export function LocaleBootstrap({ children }: { children: ReactNode }) {
  const router = useRouter();
  const nextLocale = useNextIntlLocale() as Locale;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initial = resolveInitialLocale();
    if (initial !== nextLocale) {
      applyLocaleToDocument(initial);
      router.refresh();
    }
    setMounted(true);
  }, [nextLocale, router]);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.lang = nextLocale;
  }, [nextLocale, mounted]);

  return children;
}

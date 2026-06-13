'use client';

import Link from 'next/link';
import { HomeFooter } from './home/home-footer';
import { HomeHeader } from './home/home-header';
import { useTranslations } from '../lib/i18n/locale-provider';
import type { SearchVertical } from '../lib/search/route';

export function VerticalComingSoonPage({ vertical }: { vertical: SearchVertical }) {
  const t = useTranslations();
  const verticalLabel = t.search.tabs[vertical];

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-[#0a1210]">
      <HomeHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          {t.comingSoon.badge}
        </p>
        <h1 className="mt-3 text-3xl font-bold text-[#0f1a16] dark:text-white sm:text-4xl">
          {verticalLabel}
        </h1>
        <p className="mt-4 max-w-xl text-gray-600 dark:text-atg-muted">{t.comingSoon.body}</p>
        <Link
          href="/#search"
          className="mt-8 inline-flex min-h-[44px] items-center rounded-lg bg-primary px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-primary-hover"
        >
          {t.comingSoon.backToSearch}
        </Link>
      </main>
      <HomeFooter />
    </div>
  );
}

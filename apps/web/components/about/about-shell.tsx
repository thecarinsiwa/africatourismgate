'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import {
  ABOUT_PATHS,
  findAboutNavItem,
  isTeamMemberProfilePath,
  normalizeAboutPathname,
} from '../../lib/about/routes';
import { HomeFooter } from '../home/home-footer';
import { HomeHeader } from '../home/home-header';
import { PageHero } from '../shared/page-hero';
import { AboutSidebar } from './about-sidebar';

type AboutShellProps = {
  children: ReactNode;
};

/** Sidebar + main column shared by every About page. */
export function AboutContentLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
        <AboutSidebar />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}

export function AboutShell({ children }: AboutShellProps) {
  const pathname = normalizeAboutPathname(usePathname());
  const t = useTranslations('about');
  const navItem = findAboutNavItem(pathname);
  const pageTitle = navItem ? t(`nav.${navItem.labelKey}`) : t('heroTitle');

  // Team profiles render their own hero (photo, name, role) and breadcrumb.
  if (isTeamMemberProfilePath(pathname)) {
    return (
      <div className="flex min-h-screen flex-col bg-atg-bg text-atg-fg">
        <HomeHeader />
        <main className="flex-1">{children}</main>
        <HomeFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-atg-bg text-atg-fg">
      <HomeHeader />
      <main className="flex-1">
        <PageHero
          breadcrumb={
            <nav aria-label={t('breadcrumbAria')}>
              <ol className="flex flex-wrap items-center gap-2 text-sm text-white/70">
                <li>
                  <Link href="/" className="hover:text-white">
                    {t('breadcrumbHome')}
                  </Link>
                </li>
                <li aria-hidden>/</li>
                <li>
                  <Link href={ABOUT_PATHS.whoWeAre} className="hover:text-white">
                    {t('breadcrumbAbout')}
                  </Link>
                </li>
              </ol>
            </nav>
          }
          title={<h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{pageTitle}</h1>}
          description={
            <p className="max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
              {t('heroSubtitle')}
            </p>
          }
        />
        <AboutContentLayout>{children}</AboutContentLayout>
      </main>
      <HomeFooter />
    </div>
  );
}

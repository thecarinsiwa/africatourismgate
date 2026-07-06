'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { findAboutNavItem } from '../../lib/about/routes';
import { useTranslations } from '../../lib/i18n/locale-provider';
import { HomeFooter } from '../home/home-footer';
import { HomeHeader } from '../home/home-header';
import { PageHero } from '../shared/page-hero';
import { AboutSidebar } from './about-sidebar';

type AboutShellProps = {
  children: ReactNode;
};

export function AboutShell({ children }: AboutShellProps) {
  const pathname = usePathname();
  const t = useTranslations();
  const a = t.about;
  const navItem = findAboutNavItem(pathname);
  const pageTitle = navItem ? a.nav[navItem.labelKey] : a.heroTitle;

  return (
    <div className="flex min-h-screen flex-col bg-atg-bg text-atg-fg">
      <HomeHeader />
      <main className="flex-1">
        <PageHero
          breadcrumb={
            <nav aria-label="Breadcrumb">
              <ol className="flex flex-wrap items-center gap-2 text-sm text-white/70">
                <li>
                  <Link href="/" className="hover:text-white">
                    {a.breadcrumbHome}
                  </Link>
                </li>
                <li aria-hidden>/</li>
                <li>
                  <Link href="/a-propos/qui-nous-sommes" className="hover:text-white">
                    {a.breadcrumbAbout}
                  </Link>
                </li>
              </ol>
            </nav>
          }
          title={<h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{pageTitle}</h1>}
          description={
            <p className="max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
              {a.heroSubtitle}
            </p>
          }
        />
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
            <AboutSidebar />
            <div className="min-w-0 flex-1">{children}</div>
          </div>
        </div>
      </main>
      <HomeFooter />
    </div>
  );
}

'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useTranslations } from '../../lib/i18n/locale-provider';
import { HomeFooter } from '../home/home-footer';
import { HomeHeader } from '../home/home-header';
import { PageHero } from '../shared/page-hero';

type LegalShellProps = {
  children: ReactNode;
  title: string;
  description?: string;
};

export function LegalShell({ children, title, description }: LegalShellProps) {
  const t = useTranslations();
  const legal = t.legal;

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
                    {legal.breadcrumbHome}
                  </Link>
                </li>
                <li aria-hidden>/</li>
                <li className="text-white">{title}</li>
              </ol>
            </nav>
          }
          title={<h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>}
          description={
            description ? (
              <p className="max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
                {description}
              </p>
            ) : undefined
          }
        />
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">{children}</div>
      </main>
      <HomeFooter />
    </div>
  );
}

'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { HomeFooter } from '../home/home-footer';
import { HomeHeader } from '../home/home-header';
import { ComingSoonIllustration } from './coming-soon-illustration';

export type ComingSoonShellProps = {
  badge?: string;
  title: string;
  description: string;
  primaryAction: { label: string; href: string };
  secondaryAction?: { label: string; href: string };
  children?: ReactNode;
};

export function ComingSoonShell({
  badge,
  title,
  description,
  primaryAction,
  secondaryAction,
  children,
}: ComingSoonShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-atg-surface dark:bg-atg-surface">
      <HomeHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
        <div
          className="mb-6 flex h-28 w-28 items-center justify-center rounded-3xl bg-atg-elevated ring-1 ring-atg-border/80"
          aria-hidden
        >
          <ComingSoonIllustration className="h-20 w-20" />
        </div>
        {badge ? (
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">{badge}</p>
        ) : null}
        <h1 className={`font-bold text-atg-fg sm:text-4xl ${badge ? 'mt-3 text-3xl' : 'text-3xl'}`}>
          {title}
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-atg-muted sm:text-base">
          {description}
        </p>
        {children}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {secondaryAction ? (
            <Link
              href={secondaryAction.href}
              className="inline-flex min-h-[44px] items-center rounded-lg border border-atg-border px-6 py-2.5 text-sm font-semibold text-atg-fg transition-colors hover:border-primary dark:border-atg-border dark:text-white"
            >
              {secondaryAction.label}
            </Link>
          ) : null}
          <Link
            href={primaryAction.href}
            className="inline-flex min-h-[44px] items-center rounded-lg bg-primary px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-primary-hover"
          >
            {primaryAction.label}
          </Link>
        </div>
      </main>
      <HomeFooter />
    </div>
  );
}

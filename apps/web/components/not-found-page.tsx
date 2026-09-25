'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { HomeFooter } from './home/home-footer';
import { HomeHeader } from './home/home-header';
import { NotFoundIllustration } from './not-found/not-found-illustration';

export function NotFoundPage() {
  const t = useTranslations('notFound');

  return (
    <div className="flex min-h-[100dvh] min-h-screen flex-col bg-atg-surface dark:bg-atg-surface">
      <HomeHeader />

      <main className="relative flex flex-1 flex-col overflow-x-hidden">
        {/* Atmosphere — soft brand wash + radial depth */}
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_15%,color-mix(in_srgb,var(--atg-primary)_18%,transparent),transparent_55%),radial-gradient(ellipse_at_85%_95%,color-mix(in_srgb,var(--atg-secondary)_12%,transparent),transparent_45%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.28] dark:opacity-[0.18] sm:opacity-[0.35] sm:dark:opacity-[0.2]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, color-mix(in srgb, var(--atg-fg) 12%, transparent) 1px, transparent 0)',
            backgroundSize: '22px 22px',
            maskImage: 'linear-gradient(to bottom, black 0%, transparent 85%)',
          }}
          aria-hidden
        />

        <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 py-10 text-center sm:px-6 sm:py-16 md:py-20 lg:py-24">
          {/* Watermark 404 — entier, lisible, derrière le contenu */}
          <p
            className="pointer-events-none absolute inset-x-0 top-[10%] z-0 select-none px-3 text-center font-extrabold leading-none tracking-tight text-primary opacity-[0.18] animate-fade-in-up dark:opacity-[0.28] sm:top-[8%] sm:px-4 md:top-[6%]"
            style={{ fontSize: 'clamp(4.75rem, 26vw, 11rem)' }}
            aria-hidden
          >
            {t('code')}
          </p>

          <div className="relative z-10 flex w-full flex-col items-center">
            <div
              className="mt-2 w-full max-w-[16rem] animate-fade-in-up delay-100 sm:mt-4 sm:max-w-[18rem] md:max-w-none"
              aria-hidden
            >
              <div className="motion-safe:animate-soft-float">
                <NotFoundIllustration className="mx-auto h-28 w-full max-w-full sm:h-36 md:h-44" />
              </div>
            </div>

            <p className="mt-5 animate-fade-in-up delay-200 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-primary sm:mt-6 sm:text-sm sm:tracking-[0.2em]">
              {t('badge')}
            </p>
            <h1 className="mt-2 max-w-[22rem] animate-fade-in-up delay-200 text-balance text-2xl font-bold tracking-tight text-atg-fg sm:mt-3 sm:max-w-none sm:text-3xl md:text-4xl lg:text-5xl">
              {t('title')}
            </h1>
            <p className="mt-3 max-w-md animate-fade-in-up delay-300 text-pretty text-sm leading-relaxed text-atg-muted sm:mt-4 sm:max-w-lg sm:text-base">
              {t('description')}
            </p>

            <div className="mt-8 flex w-full max-w-sm animate-fade-in-up delay-400 flex-col items-stretch gap-3 sm:mt-10 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
              <Link
                href="/"
                className="inline-flex min-h-[44px] w-full items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-atg-surface sm:w-auto"
              >
                {t('backHome')}
              </Link>
              <Link
                href="/support"
                className="inline-flex min-h-[44px] w-full items-center justify-center rounded-lg border border-atg-border px-6 py-2.5 text-sm font-semibold text-atg-fg transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-atg-surface dark:border-atg-border dark:text-white dark:hover:text-white sm:w-auto"
              >
                {t('help')}
              </Link>
            </div>
          </div>
        </div>
      </main>

      <HomeFooter />
    </div>
  );
}

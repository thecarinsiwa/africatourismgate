'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { BrandingMark } from './branding-mark';
import { HomeFooter } from './home/home-footer';
import { HomeHeader } from './home/home-header';
import { NotFoundIllustration } from './not-found/not-found-illustration';

export function NotFoundPage() {
  const t = useTranslations('notFound');

  return (
    <div className="flex min-h-screen flex-col bg-atg-surface dark:bg-atg-surface">
      <HomeHeader />

      <main className="relative flex flex-1 flex-col overflow-hidden">
        {/* Atmosphere — soft brand wash + radial depth */}
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,color-mix(in_srgb,var(--atg-primary)_18%,transparent),transparent_55%),radial-gradient(ellipse_at_80%_90%,color-mix(in_srgb,var(--atg-secondary)_12%,transparent),transparent_45%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.2]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, color-mix(in srgb, var(--atg-fg) 12%, transparent) 1px, transparent 0)',
            backgroundSize: '28px 28px',
            maskImage: 'linear-gradient(to bottom, black 0%, transparent 85%)',
          }}
          aria-hidden
        />

        {/* Watermark 404 */}
        <p
          className="pointer-events-none absolute left-1/2 top-[18%] -translate-x-1/2 select-none font-extrabold leading-none tracking-tighter text-primary/[0.07] dark:text-primary/[0.12] animate-fade-in-up sm:top-[12%]"
          style={{ fontSize: 'clamp(7rem, 28vw, 16rem)' }}
          aria-hidden
        >
          {t('code')}
        </p>

        <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 py-20 text-center sm:px-6 sm:py-24">
          <div className="animate-fade-in-up">
            <BrandingMark
              showName
              className="inline-flex items-center gap-3"
              logoClassName="h-12 w-12 rounded-xl object-cover sm:h-14 sm:w-14"
              nameClassName="text-xl font-extrabold tracking-tight text-atg-fg sm:text-2xl"
            />
          </div>

          <div className="mt-8 animate-fade-in-up delay-100" aria-hidden>
            <div className="motion-safe:animate-soft-float">
              <NotFoundIllustration className="h-36 w-auto sm:h-44" />
            </div>
          </div>

          <p className="mt-6 animate-fade-in-up delay-200 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            {t('badge')}
          </p>
          <h1 className="mt-3 animate-fade-in-up delay-200 text-3xl font-bold tracking-tight text-atg-fg sm:text-4xl lg:text-5xl">
            {t('title')}
          </h1>
          <p className="mt-4 max-w-lg animate-fade-in-up delay-300 text-sm leading-relaxed text-atg-muted sm:text-base">
            {t('description')}
          </p>

          <div className="mt-10 flex animate-fade-in-up delay-400 flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex min-h-[44px] items-center rounded-lg bg-primary px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-atg-surface"
            >
              {t('backHome')}
            </Link>
            <Link
              href="/support"
              className="inline-flex min-h-[44px] items-center rounded-lg border border-atg-border px-6 py-2.5 text-sm font-semibold text-atg-fg transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-atg-surface dark:border-atg-border dark:text-white dark:hover:text-white"
            >
              {t('help')}
            </Link>
          </div>
        </div>
      </main>

      <HomeFooter />
    </div>
  );
}

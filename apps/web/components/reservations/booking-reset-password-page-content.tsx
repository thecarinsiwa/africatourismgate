'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Suspense, useMemo } from 'react';
import { buildBookingResetPasswordPageCopy } from '../../config/booking-reset-password';
import { HomeFooter } from '../home/home-footer';
import { HomeHeader } from '../home/home-header';
import { SupportContextualHelpLink } from '../support/support-contextual-help-link';
import { BookingResetPasswordForm } from './booking-reset-password-form';

export function BookingResetPasswordPageContent() {
  const t = useTranslations('booking.resetPassword');
  const pageCopy = useMemo(() => buildBookingResetPasswordPageCopy(t), [t]);

  return (
    <div className="flex min-h-screen flex-col bg-atg-surface dark:bg-atg-surface">
      <HomeHeader />
      <main className="mx-auto flex w-full max-w-xl flex-1 items-center px-4 py-10 sm:px-6 lg:px-8">
        <section className="w-full rounded-2xl border border-atg-border bg-atg-elevated p-6 shadow-sm dark:border-atg-border dark:bg-atg-elevated">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h1 className="text-2xl font-bold text-atg-fg">{pageCopy.title}</h1>
            <SupportContextualHelpLink />
          </div>
          <p className="mt-2 text-sm text-atg-muted">{pageCopy.subtitle}</p>

          <div className="mt-6">
            <Suspense
              fallback={
                <p className="text-sm text-atg-muted">{t('loading')}</p>
              }
            >
              <BookingResetPasswordForm />
            </Suspense>
          </div>

          <p className="mt-8 text-center text-sm">
            <Link
              href={pageCopy.backToLogin.href}
              className="font-semibold text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-atg-surface"
            >
              {pageCopy.backToLogin.label}
            </Link>
          </p>
        </section>
      </main>
      <HomeFooter />
    </div>
  );
}

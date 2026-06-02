'use client';

import { LoginForm } from '@africatourismgate/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import {
  buildBookingLoginErrorMessages,
  buildBookingLoginFormConfig,
} from '../../config/booking-login';
import { buildGoogleOAuthStartUrl, loginWithPassword } from '../../lib/api/auth';
import { getAuthErrorMessage } from '../../lib/auth/api-errors';
import { completeWebLoginFromAuthResponse } from '../../lib/auth/complete-web-login';
import { useTranslations } from '../../lib/i18n/locale-provider';
import { HomeFooter } from '../home/home-footer';
import { HomeHeader } from '../home/home-header';

type Props = {
  nextPath?: string;
};

function normalizeNextPath(nextPath?: string): string {
  if (!nextPath || !nextPath.startsWith('/') || nextPath.startsWith('//')) {
    return '/booking/cart';
  }
  return nextPath;
}

export function BookingLoginPageContent({ nextPath }: Props) {
  const t = useTranslations();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const safeNext = useMemo(() => normalizeNextPath(nextPath), [nextPath]);
  const oauthUrl = useMemo(() => buildGoogleOAuthStartUrl(safeNext), [safeNext]);
  const loginConfig = useMemo(
    () => buildBookingLoginFormConfig(t.booking.login.form),
    [t.booking.login.form],
  );
  const loginErrors = useMemo(
    () => buildBookingLoginErrorMessages(t.booking.login.errors),
    [t.booking.login.errors],
  );

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-[#0a1210]">
      <HomeHeader />
      <main className="mx-auto flex w-full max-w-xl flex-1 items-center px-4 py-10 sm:px-6 lg:px-8">
        <section className="w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-atg-border dark:bg-atg-elevated">
          <h1 className="text-2xl font-bold text-[#0f1a16] dark:text-white">
            {t.booking.login.title}
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-atg-muted">
            {t.booking.login.subtitle}
          </p>

          {error ? (
            <p
              role="alert"
              className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
            >
              {error}
            </p>
          ) : null}

          <div className="mt-6">
            <LoginForm
              config={loginConfig}
              showRememberMe={false}
              onSubmit={async ({ email, password }) => {
                setError(null);
                try {
                  const response = await loginWithPassword({ email, password });
                  completeWebLoginFromAuthResponse(response, router, safeNext);
                } catch (err) {
                  setError(getAuthErrorMessage(err, loginErrors));
                }
              }}
            />
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center" aria-hidden>
              <div className="w-full border-t border-gray-200 dark:border-atg-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wide">
              <span className="bg-white px-2 text-gray-500 dark:bg-atg-elevated dark:text-atg-muted">
                {t.booking.login.divider}
              </span>
            </div>
          </div>

          <a
            href={oauthUrl}
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 dark:border-atg-border dark:bg-transparent dark:text-white"
          >
            {t.booking.login.google}
          </a>
          <Link
            href="/hotels"
            className="mt-3 inline-flex min-h-[44px] w-full items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            {t.booking.login.backToHotels}
          </Link>
        </section>
      </main>
      <HomeFooter />
    </div>
  );
}

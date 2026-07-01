'use client';

import { LoginForm } from '@africatourismgate/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import {
  buildBookingLoginErrorMessages,
  buildBookingLoginFormConfig,
} from '../../config/booking-login';
import { buildGoogleOAuthStartUrl, loginWithPassword } from '../../lib/api/auth';
import { getAuthErrorMessage } from '../../lib/auth/api-errors';
import { completeWebLoginFromAuthResponse } from '../../lib/auth/complete-web-login';
import { HomeFooter } from '../home/home-footer';
import { HomeHeader } from '../home/home-header';
import { GoogleIcon } from '../icons/google-icon';

type Props = {
  nextPath?: string;
  oauthError?: string;
};

function normalizeNextPath(nextPath?: string): string {
  if (!nextPath || !nextPath.startsWith('/') || nextPath.startsWith('//')) {
    return '/booking/cart';
  }
  return nextPath;
}

function buildRegisterHref(nextPath: string): string {
  const params = new URLSearchParams({ next: nextPath });
  return `/booking/register?${params.toString()}`;
}

function resolveOAuthErrorMessage(
  code: string | undefined,
  tErrors: (key: string) => string,
): string | null {
  if (!code) return null;
  if (code === 'google_auth_failed') return tErrors('googleAuthFailed');
  if (code === 'google_auth_error') return tErrors('googleAuthError');
  if (code === 'google_no_email') return tErrors('googleNoEmail');
  if (code === 'google_account_inactive') return tErrors('googleAccountInactive');
  if (code === 'google_signup_unavailable') return tErrors('googleSignupUnavailable');
  return tErrors('googleAuthFailed');
}

export function BookingLoginPageContent({ nextPath, oauthError }: Props) {
  const t = useTranslations('booking.login');
  const tForm = useTranslations('booking.login.form');
  const tErrors = useTranslations('booking.login.errors');
  const router = useRouter();
  const [error, setError] = useState<string | null>(() =>
    resolveOAuthErrorMessage(oauthError, tErrors),
  );
  const safeNext = useMemo(() => normalizeNextPath(nextPath), [nextPath]);
  const registerHref = useMemo(() => buildRegisterHref(safeNext), [safeNext]);
  const oauthUrl = useMemo(() => buildGoogleOAuthStartUrl(safeNext), [safeNext]);
  const loginConfig = useMemo(() => buildBookingLoginFormConfig(tForm), [tForm]);
  const loginErrors = useMemo(() => buildBookingLoginErrorMessages(tErrors), [tErrors]);

  return (
    <div className="flex min-h-screen flex-col bg-atg-surface dark:bg-atg-surface">
      <HomeHeader />
      <main className="mx-auto flex w-full max-w-xl flex-1 items-center px-4 py-10 sm:px-6 lg:px-8">
        <section className="w-full rounded-2xl border border-atg-border bg-atg-elevated p-6 shadow-sm dark:border-atg-border dark:bg-atg-elevated">
          <h1 className="text-2xl font-bold text-atg-fg">{t('title')}</h1>
          <p className="mt-2 text-sm text-atg-muted">{t('subtitle')}</p>

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
              <div className="w-full border-t border-atg-border dark:border-atg-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wide">
              <span className="bg-atg-elevated px-2 text-atg-muted dark:bg-atg-elevated text-atg-muted">
                {t('divider')}
              </span>
            </div>
          </div>

          <a
            href={oauthUrl}
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-atg-border bg-atg-elevated px-4 py-2 text-sm font-semibold text-atg-fg hover:bg-atg-surface dark:border-atg-border dark:bg-transparent dark:text-white"
          >
            <GoogleIcon />
            {t('google')}
          </a>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center" aria-hidden>
              <div className="w-full border-t border-atg-border dark:border-atg-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wide">
              <span className="bg-atg-elevated px-2 text-atg-muted dark:bg-atg-elevated">
                {t('dividerLabel')}
              </span>
            </div>
          </div>

          <Link
            href={registerHref}
            className="inline-flex min-h-[44px] w-full items-center justify-center rounded-lg border border-atg-border bg-atg-elevated px-4 py-2 text-sm font-semibold text-atg-fg hover:bg-atg-surface dark:border-atg-border dark:bg-transparent dark:text-white"
          >
            {t('createAccount')}
          </Link>
          <Link
            href="/hotels"
            className="mt-3 inline-flex min-h-[44px] w-full items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            {t('backToHotels')}
          </Link>
        </section>
      </main>
      <HomeFooter />
    </div>
  );
}

'use client';

import { ApiHttpError } from '@africatourismgate/api-client';
import { Modal, RegisterForm } from '@africatourismgate/ui';
import type { PublicLegalPage } from '@africatourismgate/types';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import {
  buildBookingRegisterErrorMessages,
  buildBookingRegisterFormConfig,
} from '../../config/booking-register';
import { registerCustomer } from '../../lib/api/auth';
import { getLegalPageBySectionKeyForLocale } from '../../lib/api/public';
import { getAuthErrorMessage } from '../../lib/auth/api-errors';
import { completeWebLoginFromAuthResponse } from '../../lib/auth/complete-web-login';
import { HomeFooter } from '../home/home-footer';
import { HomeHeader } from '../home/home-header';
import { RichText } from '../shared/rich-text';

type Props = {
  nextPath?: string;
};

function normalizeNextPath(nextPath?: string): string {
  if (!nextPath || !nextPath.startsWith('/') || nextPath.startsWith('//')) {
    return '/booking/cart';
  }
  return nextPath;
}

function buildLoginHref(nextPath: string): string {
  const params = new URLSearchParams({ next: nextPath });
  return `/booking/login?${params.toString()}`;
}

export function BookingRegisterPageContent({ nextPath }: Props) {
  const t = useTranslations('booking.register');
  const tForm = useTranslations('booking.register.form');
  const tErrors = useTranslations('booking.register.errors');
  const tTerms = useTranslations('booking.register.terms');
  const locale = useLocale();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [emailConflict, setEmailConflict] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [termsState, setTermsState] = useState<
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'ready'; page: PublicLegalPage }
    | { status: 'error' }
  >({ status: 'idle' });
  const safeNext = useMemo(() => normalizeNextPath(nextPath), [nextPath]);
  const loginHref = useMemo(() => buildLoginHref(safeNext), [safeNext]);
  const formConfig = useMemo(() => buildBookingRegisterFormConfig(tForm), [tForm]);
  const registerErrors = useMemo(
    () => ({
      ...buildBookingRegisterErrorMessages(tErrors),
      conflict: tErrors('emailAlreadyRegistered'),
    }),
    [tErrors],
  );

  const openTerms = useCallback(() => {
    setTermsOpen(true);
    setTermsState({ status: 'loading' });
    void getLegalPageBySectionKeyForLocale('terms-of-use', locale)
      .then((page) => {
        setTermsState({ status: 'ready', page });
      })
      .catch(() => {
        setTermsState({ status: 'error' });
      });
  }, [locale]);

  const termsTitle =
    termsState.status === 'ready' ? termsState.page.title : tTerms('modalTitle');

  return (
    <div className="flex min-h-screen flex-col bg-atg-surface dark:bg-atg-surface">
      <HomeHeader />
      <main className="mx-auto flex w-full max-w-xl flex-1 items-center px-4 py-10 sm:px-6 lg:px-8">
        <section className="w-full rounded-2xl border border-atg-border bg-atg-elevated p-6 shadow-sm dark:border-atg-border dark:bg-atg-elevated">
          <h1 className="text-2xl font-bold text-atg-fg">{t('title')}</h1>
          <p className="mt-2 text-sm text-atg-muted">{t('subtitle')}</p>

          {error ? (
            <div
              role="alert"
              className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
            >
              <p>{error}</p>
              {emailConflict ? (
                <Link
                  href={loginHref}
                  className="mt-2 inline-flex min-h-[44px] items-center font-semibold text-red-800 underline underline-offset-2 hover:text-red-900 dark:text-red-200 dark:hover:text-red-100"
                >
                  {t('signIn')}
                </Link>
              ) : null}
            </div>
          ) : null}

          <div className="mt-6">
            <RegisterForm
              config={formConfig}
              onTermsClick={openTerms}
              onSubmit={async ({ firstName, lastName, email, phone, password }) => {
                setError(null);
                setEmailConflict(false);
                try {
                  const response = await registerCustomer({
                    firstName,
                    lastName,
                    email,
                    password,
                    preferredLanguage: locale,
                    ...(phone.trim() ? { phone: phone.trim() } : {}),
                  });
                  if (response.requiresVerification && response.verificationId) {
                    const params = new URLSearchParams({
                      verificationId: response.verificationId,
                      next: safeNext,
                    });
                    router.replace(`/booking/verify?${params.toString()}`);
                    return;
                  }
                  completeWebLoginFromAuthResponse(response, router, safeNext);
                } catch (err) {
                  setEmailConflict(err instanceof ApiHttpError && err.status === 409);
                  setError(getAuthErrorMessage(err, registerErrors));
                }
              }}
            />
          </div>

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
            href={loginHref}
            className="inline-flex min-h-[44px] w-full items-center justify-center rounded-lg border border-atg-border bg-atg-elevated px-4 py-2 text-sm font-semibold text-atg-fg hover:bg-atg-surface dark:border-atg-border dark:bg-transparent dark:text-white"
          >
            {t('signIn')}
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

      <Modal
        open={termsOpen}
        onOpenChange={setTermsOpen}
        title={termsTitle}
        showClose
        closeAriaLabel={tTerms('close')}
        className="max-w-2xl overflow-x-hidden"
      >
        {termsState.status === 'loading' || termsState.status === 'idle' ? (
          <p className="text-sm text-atg-muted">{tTerms('loading')}</p>
        ) : null}
        {termsState.status === 'error' ? (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {tTerms('loadError')}
          </p>
        ) : null}
        {termsState.status === 'ready' ? (
          <div className="min-w-0 max-w-full overflow-x-hidden">
            <RichText
              content={termsState.page.content}
              className="max-w-full whitespace-normal break-words text-sm leading-relaxed text-atg-fg [overflow-wrap:anywhere] [&_code]:break-words [&_code]:whitespace-pre-wrap [&_h2]:mt-4 [&_h2]:text-base [&_h2]:font-semibold [&_h3]:mt-3 [&_h3]:text-sm [&_h3]:font-semibold [&_p]:my-2 [&_p]:whitespace-normal [&_p]:break-words [&_pre]:max-w-full [&_pre]:whitespace-pre-wrap [&_pre]:break-words [&_pre]:rounded-lg [&_pre]:bg-transparent [&_pre]:p-0 [&_pre]:font-sans [&_pre]:text-sm [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5"
            />
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

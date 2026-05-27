'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { buildGoogleOAuthStartUrl } from '../../lib/api/auth';
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
  const safeNext = useMemo(() => normalizeNextPath(nextPath), [nextPath]);
  const oauthUrl = useMemo(() => buildGoogleOAuthStartUrl(safeNext), [safeNext]);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-[#0a1210]">
      <HomeHeader />
      <main className="mx-auto flex w-full max-w-xl flex-1 items-center px-4 py-10 sm:px-6 lg:px-8">
        <section className="w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-atg-border dark:bg-atg-elevated">
          <h1 className="text-2xl font-bold text-[#0f1a16] dark:text-white">
            Connexion client
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-atg-muted">
            Connectez-vous avec votre compte Google pour poursuivre votre reservation.
          </p>
          <a
            href={oauthUrl}
            className="mt-6 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 dark:border-atg-border dark:bg-transparent dark:text-white"
          >
            Se connecter avec Google
          </a>
          <Link
            href="/hotels"
            className="mt-3 inline-flex min-h-[44px] w-full items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Retour aux hotels
          </Link>
        </section>
      </main>
      <HomeFooter />
    </div>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { getAuthMe } from '../../lib/api/auth';
import { completeWebLogin } from '../../lib/auth/complete-web-login';
import { HomeFooter } from '../home/home-footer';
import { HomeHeader } from '../home/home-header';

type Props = {
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: string;
  nextPath?: string;
};

function normalizeNextPath(nextPath?: string): string {
  if (!nextPath || !nextPath.startsWith('/') || nextPath.startsWith('//')) {
    return '/booking/cart';
  }
  return nextPath;
}

export function BookingOAuthCallbackPageContent({
  accessToken,
  refreshToken,
  expiresIn,
  nextPath,
}: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const safeNext = useMemo(() => normalizeNextPath(nextPath), [nextPath]);

  useEffect(() => {
    if (!accessToken || !refreshToken || !expiresIn) {
      setError('Parametres OAuth invalides.');
      return;
    }

    const ttlSeconds = Number.parseInt(expiresIn, 10);
    if (!Number.isFinite(ttlSeconds) || ttlSeconds < 30) {
      setError('Session OAuth invalide.');
      return;
    }

    void getAuthMe(accessToken)
      .then((me) => {
        completeWebLogin(
          {
            accessToken,
            refreshToken,
            expiresAt: Date.now() + ttlSeconds * 1000,
            user: me.user,
          },
          router,
          safeNext,
        );
      })
      .catch(() => {
        setError('Impossible de finaliser la connexion Google.');
      });
  }, [accessToken, refreshToken, expiresIn, safeNext, router]);

  return (
    <div className="flex min-h-screen flex-col bg-atg-surface dark:bg-atg-surface">
      <HomeHeader />
      <main className="mx-auto flex w-full max-w-xl flex-1 items-center px-4 py-10 sm:px-6 lg:px-8">
        <section className="w-full rounded-2xl border border-atg-border bg-atg-elevated p-6 dark:border-atg-border dark:bg-atg-elevated">
          <h1 className="text-2xl font-bold text-atg-fg">
            Connexion Google
          </h1>
          {!error && (
            <p className="mt-2 text-sm text-atg-muted">
              Finalisation de votre session...
            </p>
          )}
          {error && (
            <p className="mt-3 text-sm text-red-700 dark:text-red-300">{error}</p>
          )}
        </section>
      </main>
      <HomeFooter />
    </div>
  );
}

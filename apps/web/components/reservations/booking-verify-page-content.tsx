'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { verifyOperation } from '../../lib/api/auth';
import { getAuthErrorMessage } from '../../lib/auth/api-errors';
import { completeWebLoginFromAuthResponse } from '../../lib/auth/complete-web-login';
import { createBookingCheckoutSession } from '../../lib/api/booking';
import { HomeFooter } from '../home/home-footer';
import { HomeHeader } from '../home/home-header';

function normalizeNextPath(nextPath: string | null): string {
  if (!nextPath || !nextPath.startsWith('/') || nextPath.startsWith('//')) {
    return '/booking/cart';
  }
  return nextPath;
}

export function BookingVerifyPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verificationId = searchParams.get('verificationId') ?? '';
  const bookingId = searchParams.get('bookingId');
  const safeNext = useMemo(
    () => normalizeNextPath(searchParams.get('next')),
    [searchParams],
  );
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!verificationId || code.length !== 6) {
      setError('Saisissez le code à 6 chiffres reçu par e-mail.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const response = await verifyOperation({ verificationId, code });
      const resolvedBookingId = response.bookingId ?? bookingId;

      if (resolvedBookingId) {
        const checkout = await createBookingCheckoutSession(
          response.accessToken,
          resolvedBookingId,
        );
        window.location.assign(checkout.url);
        return;
      }

      completeWebLoginFromAuthResponse(response, router, safeNext);
    } catch (err: unknown) {
      setError(
        getAuthErrorMessage(err, {
          network: 'Impossible de joindre le serveur. Vérifiez votre connexion.',
          generic: 'Code invalide ou expiré. Vérifiez votre e-mail.',
          envMissing: 'Configuration API manquante.',
          conflict:
            'Ce code ne peut plus être utilisé. Recommencez « Se connecter avec Google » pour recevoir un nouveau code.',
          unauthorized: 'Compte inactif ou introuvable.',
        }),
      );
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-[#0a1210]">
      <HomeHeader />
      <main className="mx-auto flex w-full max-w-xl flex-1 items-center px-4 py-10 sm:px-6 lg:px-8">
        <section className="w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-atg-border dark:bg-atg-elevated">
          <h1 className="text-2xl font-bold text-[#0f1a16] dark:text-white">
            Vérification par e-mail
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-atg-muted">
            Un code de sécurité a été envoyé à votre adresse. Saisissez-le pour
            continuer. Si vous n&apos;êtes pas à l&apos;origine de cette
            opération, ignorez cet e-mail.
          </p>

          {error ? (
            <p
              role="alert"
              className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
            >
              {error}
            </p>
          ) : null}

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-sm font-medium text-gray-700 dark:text-atg-muted">
                Code à 6 chiffres
              </span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-center text-2xl tracking-[0.4em] dark:border-atg-border dark:bg-transparent dark:text-white"
                placeholder="000000"
                autoComplete="one-time-code"
                required
              />
            </label>
            <button
              type="submit"
              disabled={submitting || code.length !== 6}
              className="inline-flex min-h-[44px] w-full items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-60"
            >
              {submitting ? 'Vérification…' : 'Confirmer et continuer'}
            </button>
          </form>
        </section>
      </main>
      <HomeFooter />
    </div>
  );
}

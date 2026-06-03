'use client';

import type { PropertyDetail } from '@africatourismgate/types';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { createBooking, createBookingCheckoutSession } from '../../lib/api/booking';
import { getAccommodationDetail } from '../../lib/api/public';
import { ensureClientAccessToken, getClientAccessToken } from '../../lib/auth/client-session';
import { formatDisplayDate } from '../../lib/hotels/dates';
import { formatHotelPrice } from '../../lib/hotels/listings';
import { useLocale } from '../../lib/i18n/locale-provider';
import { buildReservationQuery, type ReservationDraft } from '../../lib/reservations/flow';
import { HomeFooter } from '../home/home-footer';
import { HomeHeader } from '../home/home-header';

type Props = {
  draft: ReservationDraft | null;
};

export function ReservationRecapPageContent({ draft }: Props) {
  const { locale } = useLocale();
  const [detail, setDetail] = useState<PropertyDetail | null>(null);
  const [loading, setLoading] = useState(Boolean(draft));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!draft) return;
    setLoading(true);
    void getAccommodationDetail(draft.propertyId, {
      checkIn: draft.checkIn,
      checkOut: draft.checkOut,
      guests: draft.guests,
    })
      .then((data) => {
        if (!cancelled) setDetail(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [draft]);

  const room = useMemo(
    () => detail?.rooms.find((item) => item.id === draft?.roomId) ?? null,
    [detail, draft?.roomId],
  );

  async function handleCheckout() {
    if (!draft) return;
    const accessToken = await ensureClientAccessToken();
    if (!accessToken) {
      setError('Authentification requise pour continuer vers le paiement.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const booking = await createBooking(accessToken, {
        items: [
          {
            itemType: 'room',
            referenceId: draft.roomId,
            quantity: 1,
            startDate: draft.checkIn,
            endDate: draft.checkOut,
          },
        ],
      });
      const checkout = await createBookingCheckoutSession(accessToken, booking.booking.id);
      window.location.assign(checkout.url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Impossible de demarrer le paiement.');
      setSubmitting(false);
    }
  }

  const cartHref = draft ? `/booking/cart?${buildReservationQuery(draft)}` : '/hotels';
  const hasToken = Boolean(getClientAccessToken());

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-[#0a1210]">
      <HomeHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-[#0f1a16] dark:text-white">Recapitulatif</h1>

        {!draft && (
          <div className="mt-6 rounded-xl border border-red-200 bg-white p-5 dark:border-red-900/40 dark:bg-atg-elevated">
            <p className="text-sm text-red-700 dark:text-red-300">
              Donnees de reservation invalides. Revenez au panier.
            </p>
            <Link
              href="/booking/cart"
              className="mt-4 inline-flex min-h-[44px] items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              Retour panier
            </Link>
          </div>
        )}

        {draft && (
          <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5 dark:border-atg-border dark:bg-atg-elevated">
            {loading && <p className="text-sm text-gray-600 dark:text-atg-muted">Chargement…</p>}
            {!loading && detail && room && (
              <div className="space-y-2">
                <p className="text-sm text-primary">{detail.destinationName}</p>
                <h2 className="text-xl font-bold text-[#0f1a16] dark:text-white">{detail.name}</h2>
                <p className="text-sm text-gray-600 dark:text-atg-muted">{room.name}</p>
                <p className="text-sm text-gray-600 dark:text-atg-muted">
                  {formatDisplayDate(draft.checkIn, locale)} {'->'}{' '}
                  {formatDisplayDate(draft.checkOut, locale)}
                </p>
                <p className="text-sm text-gray-600 dark:text-atg-muted">
                  {draft.guests} voyageur{draft.guests > 1 ? 's' : ''}
                </p>
                <p className="pt-1 text-2xl font-bold text-[#0f1a16] dark:text-white">
                  {formatHotelPrice(room.totalPriceCents ?? room.basePriceCents, room.currency)}
                </p>
              </div>
            )}

            {!hasToken && (
              <p className="mt-5 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
                Connexion client requise pour lancer Stripe Checkout.
              </p>
            )}
            {error && (
              <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
                {error}
              </p>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={cartHref}
                className="inline-flex min-h-[44px] items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-atg-border dark:text-white/80 dark:hover:bg-white/5"
              >
                Retour panier
              </Link>
              <button
                type="button"
                onClick={handleCheckout}
                disabled={submitting || loading}
                className="inline-flex min-h-[44px] items-center rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Redirection Stripe…' : 'Payer avec Stripe'}
              </button>
            </div>
          </div>
        )}
      </main>
      <HomeFooter />
    </div>
  );
}

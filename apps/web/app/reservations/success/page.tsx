'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { BookingDetail } from '@africatourismgate/types';
import { HomeFooter } from '../../../components/home/home-footer';
import { HomeHeader } from '../../../components/home/home-header';
import { getBooking } from '../../../lib/api/booking';
import { getClientAccessToken } from '../../../lib/auth/client-session';
import { formatHotelPrice } from '../../../lib/hotels/listings';

export default function ReservationSuccessPage() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('booking_id');
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');

  useEffect(() => {
    let cancelled = false;
    if (!bookingId) return;
    const token = getClientAccessToken();
    if (!token) return;

    setStatus('loading');
    void getBooking(token, bookingId)
      .then((data) => {
        if (!cancelled) {
          setBooking(data);
          setStatus('ready');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStatus('error');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-[#0a1210]">
      <HomeHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-green-200 bg-white p-6 dark:border-green-900/40 dark:bg-atg-elevated">
          <h1 className="text-2xl font-bold text-[#0f1a16] dark:text-white">
            Reservation confirmee
          </h1>
          <p className="mt-3 text-sm text-gray-600 dark:text-atg-muted">
            Votre paiement Stripe est recu. La confirmation definitive peut prendre quelques
            secondes le temps du webhook.
          </p>

          <div className="mt-5 space-y-2 text-sm text-gray-700 dark:text-white/80">
            <p>
              <span className="font-semibold">Booking ID:</span> {bookingId ?? 'non fourni'}
            </p>
            {status === 'loading' && <p>Verification du statut en cours…</p>}
            {status === 'ready' && booking && (
              <>
                <p>
                  <span className="font-semibold">Statut:</span> {booking.booking.status}
                </p>
                <p>
                  <span className="font-semibold">Total:</span>{' '}
                  {formatHotelPrice(booking.totalCents, booking.currency)}
                </p>
              </>
            )}
            {status === 'error' && (
              <p className="text-amber-700 dark:text-amber-300">
                Statut detaille indisponible pour le moment. Rechargez la page dans quelques
                instants.
              </p>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex min-h-[44px] items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              Retour accueil
            </Link>
            <Link
              href="/hotels"
              className="inline-flex min-h-[44px] items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-atg-border dark:text-white/80 dark:hover:bg-white/5"
            >
              Voir les hotels
            </Link>
          </div>
        </div>
      </main>
      <HomeFooter />
    </div>
  );
}

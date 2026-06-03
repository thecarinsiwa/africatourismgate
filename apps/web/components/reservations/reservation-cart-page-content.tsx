'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { HomeFooter } from '../home/home-footer';
import { HomeHeader } from '../home/home-header';
import { getClientAccessToken } from '../../lib/auth/client-session';
import { getAccommodationDetail } from '../../lib/api/public';
import { formatDisplayDate } from '../../lib/hotels/dates';
import { formatHotelPrice } from '../../lib/hotels/listings';
import { useLocale } from '../../lib/i18n/locale-provider';
import { buildReservationQuery, type ReservationDraft } from '../../lib/reservations/flow';
import { useEffect, useState } from 'react';
import type { PropertyDetail } from '@africatourismgate/types';

type Props = {
  draft: ReservationDraft | null;
};

export function ReservationCartPageContent({ draft }: Props) {
  const { locale } = useLocale();
  const [detail, setDetail] = useState<PropertyDetail | null>(null);
  const [loading, setLoading] = useState(Boolean(draft));

  const room = useMemo(
    () => detail?.rooms.find((item) => item.id === draft?.roomId) ?? null,
    [detail, draft?.roomId],
  );

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

  const accessToken = getClientAccessToken();
  const nextHref = draft ? `/booking/recap?${buildReservationQuery(draft)}` : '/hotels';

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-[#0a1210]">
      <HomeHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-[#0f1a16] dark:text-white">Panier réservation</h1>

        {!draft && (
          <div className="mt-6 rounded-xl border border-red-200 bg-white p-5 dark:border-red-900/40 dark:bg-atg-elevated">
            <p className="text-sm text-red-700 dark:text-red-300">
              Données de réservation incomplètes. Reprenez depuis la fiche hôtel.
            </p>
            <Link
              href="/hotels"
              className="mt-4 inline-flex min-h-[44px] items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              Retour aux hébergements
            </Link>
          </div>
        )}

        {draft && (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_auto]">
            <section className="rounded-xl border border-gray-200 bg-white p-5 dark:border-atg-border dark:bg-atg-elevated">
              {loading && <p className="text-sm text-gray-600 dark:text-atg-muted">Chargement…</p>}
              {!loading && detail && room && (
                <div className="space-y-3">
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
                </div>
              )}
            </section>

            <aside className="h-fit min-w-[240px] rounded-xl border border-gray-200 bg-white p-5 dark:border-atg-border dark:bg-atg-elevated">
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-atg-muted">
                Total estimé
              </p>
              <p className="mt-1 text-2xl font-bold text-[#0f1a16] dark:text-white">
                {room ? formatHotelPrice(room.totalPriceCents ?? room.basePriceCents, room.currency) : '--'}
              </p>
              {!accessToken && (
                <p className="mt-3 text-xs text-amber-700 dark:text-amber-300">
                  Connexion client requise au prochain écran.
                </p>
              )}
              <Link
                href={nextHref}
                className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
              >
                Continuer vers récap
              </Link>
            </aside>
          </div>
        )}
      </main>
      <HomeFooter />
    </div>
  );
}

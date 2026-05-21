'use client';

import type { CruiseSailing, Itinerary, Ship } from '@africatourismgate/types';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { getCroisieresErrorMessage } from '../../lib/croisieres-errors';
import { CabinAvailabilitySection } from './cabin-availability-section';
import { SailingForm } from './sailing-form';

type SailingEditPageProps = { sailingId: string };

export function SailingEditPage({ sailingId }: SailingEditPageProps) {
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | {
        status: 'ready';
        sailing: CruiseSailing;
        itinerary: Itinerary;
        ship: Ship;
      }
  >({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const client = getApiClient();
        const sailing = await client.getCruiseSailing(sailingId);
        const itinerary = await client.getItinerary(sailing.itineraryId);
        const ship = await client.getShip(itinerary.shipId);
        if (!cancelled) {
          setState({ status: 'ready', sailing, itinerary, ship });
        }
      } catch (error) {
        if (!cancelled) {
          setState({ status: 'error', message: getCroisieresErrorMessage(error) });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sailingId]);

  if (state.status === 'loading') {
    return <p className="text-sm text-atg-muted">Chargement…</p>;
  }

  if (state.status === 'error') {
    return (
      <div className="space-y-4">
        <p role="alert" className="text-sm text-red-600">
          {state.message}
        </p>
        <Link href="/produits/croisieres" className="text-sm font-medium text-primary">
          ← Retour aux croisières
        </Link>
      </div>
    );
  }

  const { sailing, itinerary, ship } = state;
  const departureLabel = sailing.departureDate.slice(0, 10);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atg-fg">Modifier le départ</h1>
        <p className="mt-2 text-sm text-atg-muted">
          {departureLabel} · {itinerary.name} · {ship.name} ({itinerary.durationNights}{' '}
          nuits)
        </p>
      </div>
      <SailingForm mode="edit" sailingId={sailingId} initialSailing={sailing} />
      <CabinAvailabilitySection
        sailingId={sailingId}
        shipId={itinerary.shipId}
        itineraryId={itinerary.id}
      />
    </div>
  );
}

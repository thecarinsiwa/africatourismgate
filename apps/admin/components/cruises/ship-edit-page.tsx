'use client';

import type { Ship } from '@africatourismgate/types';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { getCroisieresErrorMessage } from '../../lib/croisieres-errors';
import { CabinsSection } from './cabins-section';
import { ItinerariesSection } from './itineraries-section';
import { ShipForm } from './ship-form';

type ShipEditPageProps = { shipId: string };

export function ShipEditPage({ shipId }: ShipEditPageProps) {
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; ship: Ship; lineName: string }
  >({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const client = getApiClient();
        const ship = await client.getShip(shipId);
        const line = await client.getCruiseLine(ship.cruiseLineId);
        if (!cancelled) {
          setState({ status: 'ready', ship, lineName: line.name });
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
  }, [shipId]);

  if (state.status === 'loading') {
    return <p className="text-sm text-atg-muted">Chargement…</p>;
  }

  if (state.status === 'error') {
    return (
      <div className="space-y-4">
        <p role="alert" className="text-sm text-red-600">
          {state.message}
        </p>
        <Link href="/produits/croisieres/navires" className="text-sm font-medium text-primary">
          ← Retour aux navires
        </Link>
      </div>
    );
  }

  const { ship, lineName } = state;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atg-fg">Modifier le navire</h1>
        <p className="mt-2 text-sm text-atg-muted">
          {ship.name} · {lineName}
        </p>
      </div>
      <ShipForm mode="edit" shipId={shipId} initialShip={ship} />
      <ItinerariesSection shipId={shipId} />
      <CabinsSection shipId={shipId} />
    </div>
  );
}

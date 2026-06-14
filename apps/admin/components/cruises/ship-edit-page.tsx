'use client';

import type { Ship } from '@africatourismgate/types';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { getApiClient } from '../../lib/auth/api';
import { buildCruiseBreadcrumbTail } from '../../lib/cruise-breadcrumbs';
import { getCroisieresErrorMessage } from '../../lib/croisieres-errors';
import { CabinsSection } from './cabins-section';
import { ItinerariesSection } from './itineraries-section';
import { ShipForm } from './ship-form';
import { ShipImagesSection } from './ship-images-section';

type ShipEditPageProps = { shipId: string };

export function ShipEditPage({ shipId }: ShipEditPageProps) {
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; ship: Ship; lineName: string }
  >({ status: 'loading' });

  useAdminEditPageMeta({
    ready: state.status === 'ready',
    title: 'Modifier le navire',
    breadcrumbTail:
      state.status === 'ready'
        ? buildCruiseBreadcrumbTail({
            lineName: state.lineName,
            shipName: state.ship.name,
          })
        : undefined,
  });

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
      <p className="mb-8 text-sm text-atg-muted">
        {ship.name} · {lineName}
      </p>
      <ShipForm mode="edit" shipId={shipId} initialShip={ship} />
      <ShipImagesSection shipId={shipId} embedded />
      <ItinerariesSection shipId={shipId} />
      <CabinsSection shipId={shipId} />
    </div>
  );
}

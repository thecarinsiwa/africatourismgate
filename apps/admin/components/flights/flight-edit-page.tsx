'use client';

import type { Flight } from '@africatourismgate/types';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { getApiClient } from '../../lib/auth/api';
import { getVolsErrorMessage } from '../../lib/vols-errors';
import { FlightClassesSection } from './flight-classes-section';
import { FlightForm } from './flight-form';

type FlightEditPageProps = {
  flightId: string;
};

export function FlightEditPage({ flightId }: FlightEditPageProps) {
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; flight: Flight }
  >({ status: 'loading' });

  useAdminEditPageMeta({
    ready: state.status === 'ready',
    title: 'Modifier le vol',
    entityLabel: state.status === 'ready' ? state.flight.flightNumber : undefined,
  });

  useEffect(() => {
    let cancelled = false;
    void getApiClient()
      .getFlight(flightId)
      .then((flight) => {
        if (!cancelled) setState({ status: 'ready', flight });
      })
      .catch((error) => {
        if (!cancelled) {
          setState({ status: 'error', message: getVolsErrorMessage(error) });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [flightId]);

  if (state.status === 'loading') {
    return <p className="text-sm text-atg-muted">Chargement…</p>;
  }

  if (state.status === 'error') {
    return (
      <div className="space-y-4">
        <p role="alert" className="text-sm text-red-600">
          {state.message}
        </p>
        <Link href="/produits/vols" className="text-sm font-medium text-primary">
          ← Retour aux vols
        </Link>
      </div>
    );
  }

  const { flight } = state;

  return (
    <div>
      <FlightForm mode="edit" flightId={flightId} initialFlight={flight} />
      <FlightClassesSection flightId={flightId} />
    </div>
  );
}

'use client';

import type { Destination } from '@africatourismgate/types';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { getDestinationsErrorMessage } from '../../lib/destinations-errors';
import { DestinationForm } from './destination-form';
import { DestinationPoisSection } from './destination-pois-section';

type DestinationEditPageProps = {
  destinationId: string;
};

export function DestinationEditPage({ destinationId }: DestinationEditPageProps) {
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; destination: Destination }
  >({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const destination = await getApiClient().getDestination(destinationId);
        if (!cancelled) {
          setState({ status: 'ready', destination });
        }
      } catch (error) {
        if (!cancelled) {
          setState({ status: 'error', message: getDestinationsErrorMessage(error) });
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [destinationId]);

  if (state.status === 'loading') {
    return <p className="text-sm text-atg-muted">Chargement…</p>;
  }

  if (state.status === 'error') {
    return (
      <div className="space-y-4">
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
        <Link
          href="/produits/destinations"
          className="text-sm font-medium text-primary hover:text-primary-hover"
        >
          ← Retour à la liste
        </Link>
      </div>
    );
  }

  const { destination } = state;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atg-fg">Modifier la destination</h1>
        <p className="mt-2 text-sm text-atg-muted">
          {destination.name}{' '}
          <span className="font-mono text-xs text-atg-muted">
            ({destination.slug} · {destination.countryCode})
          </span>
        </p>
      </div>
      <DestinationForm
        mode="edit"
        destinationId={destinationId}
        initialDestination={destination}
      />
      <DestinationPoisSection destinationId={destinationId} />
    </div>
  );
}

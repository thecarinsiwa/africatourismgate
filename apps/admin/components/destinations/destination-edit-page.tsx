'use client';

import type { Destination } from '@africatourismgate/types';
import { Skeleton } from '@africatourismgate/ui';
import { useCallback, useEffect, useState } from 'react';
import { AdminPageBackLink } from '../admin-page-back-link';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { getApiClient } from '../../lib/auth/api';
import { getDestinationsErrorMessage } from '../../lib/destinations-errors';
import { DestinationForm } from './destination-form';
import { DestinationHeroBanner } from './destination-hero-banner';
import { DestinationPoisSection } from './destination-pois-section';
import { DestinationRelatedStatCards } from './destination-related-stat-cards';
import { DestinationStaticMap } from './destination-static-map';

type DestinationEditPageProps = {
  destinationId: string;
};

export function DestinationEditPage({ destinationId }: DestinationEditPageProps) {
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; destination: Destination }
  >({ status: 'loading' });

  useAdminEditPageMeta({
    ready: state.status === 'ready',
    title: 'Modifier la destination',
    entityLabel: state.status === 'ready' ? state.destination.name : undefined,
  });

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const destination = await getApiClient().getDestination(destinationId);
      setState({ status: 'ready', destination });
    } catch (error) {
      setState({ status: 'error', message: getDestinationsErrorMessage(error) });
    }
  }, [destinationId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (state.status === 'loading') {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-44 w-full rounded-xl" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <Skeleton className="h-64 w-full max-w-2xl" />
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="space-y-4">
        <AdminPageBackLink href="/produits/destinations" label="Retour aux destinations" />
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
      </div>
    );
  }

  const { destination } = state;

  return (
    <div className="space-y-6">
      <AdminPageBackLink href="/produits/destinations" label="Retour aux destinations" />

      <DestinationHeroBanner
        name={destination.name}
        slug={destination.slug}
        countryCode={destination.countryCode}
        imageUrl={destination.imageUrl}
      />

      <DestinationRelatedStatCards destinationId={destinationId} />

      <DestinationForm
        mode="edit"
        destinationId={destinationId}
        initialDestination={destination}
        showHeroPreview={false}
        onUpdated={(updated) => setState({ status: 'ready', destination: updated })}
      />

      <DestinationStaticMap
        latitude={destination.latitude}
        longitude={destination.longitude}
        title="Carte de la destination"
        className="max-w-2xl"
      />

      <DestinationPoisSection destinationId={destinationId} />
    </div>
  );
}

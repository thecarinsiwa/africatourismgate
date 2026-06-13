'use client';

import type { Property } from '@africatourismgate/types';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { getApiClient } from '../../lib/auth/api';
import { getHebergementsErrorMessage } from '../../lib/hebergements-errors';
import { PropertyAmenitiesSection } from './property-amenities-section';
import { PropertyForm } from './property-form';
import { PropertyImagesSection } from './property-images-section';
import { PropertyRoomsSection } from './property-rooms-section';

type PropertyEditPageProps = {
  propertyId: string;
};

export function PropertyEditPage({ propertyId }: PropertyEditPageProps) {
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; property: Property }
  >({ status: 'loading' });

  useAdminEditPageMeta({
    ready: state.status === 'ready',
    title: "Modifier l'hébergement",
    entityLabel: state.status === 'ready' ? state.property.name : undefined,
  });

  useEffect(() => {
    let cancelled = false;
    void getApiClient()
      .getProperty(propertyId)
      .then((property) => {
        if (!cancelled) setState({ status: 'ready', property });
      })
      .catch((error) => {
        if (!cancelled) {
          setState({ status: 'error', message: getHebergementsErrorMessage(error) });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [propertyId]);

  if (state.status === 'loading') {
    return <p className="text-sm text-atg-muted">Chargement…</p>;
  }

  if (state.status === 'error') {
    return (
      <div className="space-y-4">
        <p role="alert" className="text-sm text-red-600">
          {state.message}
        </p>
        <Link href="/hebergements" className="text-sm font-medium text-primary">
          ← Retour à la liste
        </Link>
      </div>
    );
  }

  const { property } = state;

  return (
    <div>
      <p className="mb-8 text-sm text-atg-muted">
        {property.name}{' '}
        <span className="font-mono text-xs">({property.slug})</span>
      </p>
      <PropertyForm mode="edit" propertyId={propertyId} initialProperty={property} />
      <PropertyImagesSection propertyId={propertyId} />
      <PropertyAmenitiesSection propertyId={propertyId} />
      <PropertyRoomsSection propertyId={propertyId} />
    </div>
  );
}

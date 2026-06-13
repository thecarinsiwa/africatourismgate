'use client';

import type { Vehicle } from '@africatourismgate/types';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { getApiClient } from '../../lib/auth/api';
import { getLocationsErrorMessage } from '../../lib/locations-errors';
import { VehicleAvailabilitySection } from './vehicle-availability-section';
import { VehicleForm } from './vehicle-form';

type VehicleEditPageProps = {
  vehicleId: string;
};

export function VehicleEditPage({ vehicleId }: VehicleEditPageProps) {
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | {
        status: 'ready';
        vehicle: Vehicle;
        agencyName: string;
        categoryName: string;
      }
  >({ status: 'loading' });

  useAdminEditPageMeta({
    ready: state.status === 'ready',
    title: 'Modifier le véhicule',
    entityLabel:
      state.status === 'ready'
        ? (state.vehicle.licensePlate ?? state.categoryName)
        : undefined,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const client = getApiClient();
        const vehicle = await client.getVehicle(vehicleId);
        const [agency, category] = await Promise.all([
          client.getRentalAgency(vehicle.agencyId),
          client.getVehicleCategory(vehicle.categoryId),
        ]);
        if (!cancelled) {
          setState({
            status: 'ready',
            vehicle,
            agencyName: agency.name,
            categoryName: category.name,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setState({ status: 'error', message: getLocationsErrorMessage(error) });
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [vehicleId]);

  if (state.status === 'loading') {
    return <p className="text-sm text-atg-muted">Chargement…</p>;
  }

  if (state.status === 'error') {
    return (
      <div className="space-y-4">
        <p role="alert" className="text-sm text-red-600">
          {state.message}
        </p>
        <Link href="/produits/locations" className="text-sm font-medium text-primary">
          ← Retour aux véhicules
        </Link>
      </div>
    );
  }

  const { vehicle, agencyName, categoryName } = state;

  return (
    <div>
      <p className="mb-8 text-sm text-atg-muted">
        {vehicle.licensePlate ? (
          <code className="font-mono text-xs">{vehicle.licensePlate}</code>
        ) : (
          'Sans plaque'
        )}
        {' · '}
        {agencyName} · {categoryName}
      </p>
      <VehicleForm mode="edit" vehicleId={vehicleId} initialVehicle={vehicle} />
      <VehicleAvailabilitySection vehicleId={vehicleId} />
    </div>
  );
}

'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import type { Vehicle } from '@africatourismgate/types';
import { DataTableBadge, Skeleton } from '@africatourismgate/ui';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { AdminPageBackLink } from '../admin-page-back-link';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { getApiClient } from '../../lib/auth/api';
import { VehicleAvailabilitySection } from './vehicle-availability-section';
import { VehicleForm } from './vehicle-form';
import { VehicleImagesSection } from './vehicle-images-section';
import { VehicleSpecsGrid } from './vehicle-specs-grid';
import { VehicleThumbnail } from './vehicle-thumbnail';

type VehicleEditPageProps = {
  vehicleId: string;
};

export function VehicleEditPage({ vehicleId }: VehicleEditPageProps) {
  const { locations: getLocationsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.locations.detail');
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
    title: t('title'),
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
  }, [vehicleId, getLocationsErrorMessage]);

  if (state.status === 'loading') {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-32" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-16 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
        <Skeleton className="h-64 w-full max-w-2xl" />
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="space-y-4">
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
        <Link
          href="/produits/locations"
          className="text-sm font-medium text-primary hover:text-primary-hover"
        >
          {t('backLink')}
        </Link>
      </div>
    );
  }

  const { vehicle, agencyName, categoryName } = state;
  const thumbnailLabel = vehicle.licensePlate ?? categoryName;

  return (
    <div className="space-y-8">
      <AdminPageBackLink href="/produits/locations" label={t('backLink')} />

      <div className="flex flex-wrap items-center gap-4">
        <VehicleThumbnail
          vehicleId={vehicleId}
          label={thumbnailLabel}
          categoryName={categoryName}
          size="md"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {vehicle.licensePlate ? (
              <code className="rounded-md bg-atg-surface px-2.5 py-1 font-mono text-sm font-semibold text-atg-fg ring-1 ring-atg-border/60">
                {vehicle.licensePlate}
              </code>
            ) : (
              <span className="text-sm font-medium text-atg-fg">{t('noLicensePlate')}</span>
            )}
            <DataTableBadge variant="muted">{agencyName}</DataTableBadge>
            <DataTableBadge variant="default">{categoryName}</DataTableBadge>
          </div>
        </div>
      </div>

      <VehicleSpecsGrid categoryName={categoryName} />

      <VehicleForm mode="edit" vehicleId={vehicleId} initialVehicle={vehicle} />
      <VehicleImagesSection vehicleId={vehicleId} embedded />
      <VehicleAvailabilitySection vehicleId={vehicleId} />
    </div>
  );
}

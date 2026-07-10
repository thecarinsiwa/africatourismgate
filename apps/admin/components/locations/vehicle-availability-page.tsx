'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { DataTableBadge, Skeleton } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AdminPageBackLink } from '../admin-page-back-link';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { getApiClient } from '../../lib/auth/api';
import { VehicleAvailabilitySection } from './vehicle-availability-section';
import { VehicleThumbnail } from './vehicle-thumbnail';

type VehicleAvailabilityPageProps = {
  vehicleId: string;
};

export function VehicleAvailabilityPage({ vehicleId }: VehicleAvailabilityPageProps) {
  const { locations: getLocationsErrorMessage } = useAdminErrorMessages();
  const searchParams = useSearchParams();
  const autoOpenAdd = searchParams.get('add') === '1';
  const tPage = useTranslations('pages.produits.locations.id.disponibilites');
  const tAvailability = useTranslations('modules.locations.sections.availability');
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | {
        status: 'ready';
        label: string;
        agencyName: string;
        categoryName: string;
      }
  >({ status: 'loading' });

  const pageTitle = tPage.has?.('title') ? tPage('title') : tAvailability('title');
  const backLabel = tPage.has?.('backLabel')
    ? tPage('backLabel')
    : tAvailability('backToVehicle');

  useAdminEditPageMeta({
    ready: state.status === 'ready',
    title: pageTitle,
    entityLabel: state.status === 'ready' ? state.label : undefined,
    breadcrumbTail:
      state.status === 'ready'
        ? [{ label: state.label, href: `/produits/locations/${vehicleId}` }]
        : undefined,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState({ status: 'loading' });
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
            label: vehicle.licensePlate ?? category.name,
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

  const vehicleBackHref = `/produits/locations/${vehicleId}`;

  if (state.status === 'loading') {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-16 w-full max-w-xl" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="space-y-4">
        <AdminPageBackLink href={vehicleBackHref} label={backLabel} />
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
      </div>
    );
  }

  const { label, agencyName, categoryName } = state;

  return (
    <div className="min-w-0 space-y-6">
      <AdminPageBackLink href={vehicleBackHref} label={backLabel} />

      <div className="flex flex-wrap items-center gap-4">
        <VehicleThumbnail
          vehicleId={vehicleId}
          label={label}
          categoryName={categoryName}
          size="md"
        />
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-sm text-atg-muted">
            {tAvailability('summary', { label, agencyName, categoryName })}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <DataTableBadge variant="muted">{agencyName}</DataTableBadge>
            <DataTableBadge variant="default">{categoryName}</DataTableBadge>
          </div>
        </div>
      </div>

      {tPage.has?.('description') ? (
        <p className="text-sm text-atg-muted">{tPage('description')}</p>
      ) : null}

      <VehicleAvailabilitySection
        vehicleId={vehicleId}
        embedded
        autoOpenAdd={autoOpenAdd}
      />
    </div>
  );
}

'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { Button, DataTableBadge, Skeleton } from '@africatourismgate/ui';
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

function formatPrice(cents: number, currency: string): string {
  return `${(cents / 100).toFixed(2)} ${currency}`;
}

export function VehicleAvailabilityPage({ vehicleId }: VehicleAvailabilityPageProps) {
  const { locations: getLocationsErrorMessage } = useAdminErrorMessages();
  const searchParams = useSearchParams();
  const autoOpenAdd = searchParams.get('add') === '1';
  const tPage = useTranslations('pages.produits.locations.id.disponibilites');
  const tAvailability = useTranslations('modules.locations.sections.availability');
  const tDetail = useTranslations('modules.locations.detail');
  const tView = useTranslations('modules.locations.view');
  const tActions = useTranslations('common.actions');
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | {
        status: 'ready';
        label: string;
        licensePlate: string | null;
        agencyName: string;
        categoryName: string;
        dailyPriceCents: number;
        currency: string;
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
        ? [{ label: state.label, href: `/produits/locations/${vehicleId}/voir` }]
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
            licensePlate: vehicle.licensePlate,
            agencyName: agency.name,
            categoryName: category.name,
            dailyPriceCents: vehicle.dailyPriceCents,
            currency: vehicle.currency,
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

  const viewHref = `/produits/locations/${vehicleId}/voir`;
  const editHref = `/produits/locations/${vehicleId}`;

  if (state.status === 'loading') {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-40" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-16 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="space-y-4">
        <AdminPageBackLink href={viewHref} label={backLabel} />
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
      </div>
    );
  }

  const { label, licensePlate, agencyName, categoryName, dailyPriceCents, currency } =
    state;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <AdminPageBackLink href={viewHref} label={backLabel} />
        <div className="flex flex-wrap items-center gap-2">
          <Button href={viewHref} variant="outline">
            {tDetail('viewButton')}
          </Button>
          <Button href={editHref}>{tView('editButton')}</Button>
        </div>
      </div>

      <div className="flex flex-wrap items-start gap-4">
        <VehicleThumbnail
          vehicleId={vehicleId}
          label={label}
          categoryName={categoryName}
          size="md"
        />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {licensePlate ? (
              <h2 className="font-mono text-xl font-semibold text-atg-fg">
                {licensePlate}
              </h2>
            ) : (
              <h2 className="text-xl font-semibold text-atg-fg">
                {tDetail('noLicensePlate')}
              </h2>
            )}
            <DataTableBadge variant="muted">{agencyName}</DataTableBadge>
            <DataTableBadge variant="default">{categoryName}</DataTableBadge>
          </div>
          <p className="text-sm text-atg-muted">{tAvailability('intro')}</p>
          <p className="tabular-nums text-sm font-semibold text-atg-fg">
            {formatPrice(dailyPriceCents, currency)}
          </p>
        </div>
      </div>

      <VehicleAvailabilitySection
        vehicleId={vehicleId}
        embedded
        variant="page"
        autoOpenAdd={autoOpenAdd}
      />

      <div className="flex justify-end">
        <Button href={editHref} variant="outline">
          {tActions('edit')}
        </Button>
      </div>
    </div>
  );
}

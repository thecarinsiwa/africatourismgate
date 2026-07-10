'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { Button, Card, DataTableBadge, Skeleton } from '@africatourismgate/ui';
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

  const vehicleBackHref = `/produits/locations/${vehicleId}`;

  if (state.status === 'loading') {
    return (
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-16 w-full max-w-3xl" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="mx-auto w-full max-w-7xl space-y-4">
        <AdminPageBackLink href={vehicleBackHref} label={backLabel} />
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
      </div>
    );
  }

  const { label, licensePlate, agencyName, categoryName, dailyPriceCents, currency } = state;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <AdminPageBackLink href={vehicleBackHref} label={backLabel} />

      <Card
        variant="dashboard"
        className="flex flex-col gap-4 border border-atg-border/80 bg-atg-elevated/70 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5"
      >
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <VehicleThumbnail
            vehicleId={vehicleId}
            label={label}
            categoryName={categoryName}
            size="md"
          />
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {licensePlate ? (
                <code className="rounded-md bg-atg-surface px-2.5 py-1 font-mono text-sm font-semibold text-atg-fg ring-1 ring-atg-border/60">
                  {licensePlate}
                </code>
              ) : (
                <span className="text-sm font-medium text-atg-fg">{tDetail('noLicensePlate')}</span>
              )}
              <DataTableBadge variant="muted">{agencyName}</DataTableBadge>
              <DataTableBadge variant="default">{categoryName}</DataTableBadge>
            </div>
            <p className="text-sm text-atg-muted">
              {tAvailability('summary', { label, agencyName, categoryName })}
            </p>
            <p className="tabular-nums text-sm font-medium text-atg-fg">
              {formatPrice(dailyPriceCents, currency)}
            </p>
          </div>
        </div>
        <Button href={vehicleBackHref} variant="outline" className="w-full shrink-0 sm:w-auto">
          {tDetail('editButton')}
        </Button>
      </Card>

      {tPage.has?.('description') ? (
        <p className="text-sm leading-relaxed text-atg-muted">{tPage('description')}</p>
      ) : null}

      <VehicleAvailabilitySection
        vehicleId={vehicleId}
        embedded
        variant="page"
        autoOpenAdd={autoOpenAdd}
      />
    </div>
  );
}

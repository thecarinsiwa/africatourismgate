'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import type { Vehicle } from '@africatourismgate/types';
import {
  Button,
  DataTableBadge,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@africatourismgate/ui';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
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

const TAB_VALUES = ['vehicule', 'disponibilites'] as const;
type TabValue = (typeof TAB_VALUES)[number];

function isTabValue(value: string | null): value is TabValue {
  return value !== null && (TAB_VALUES as readonly string[]).includes(value);
}

function formatPrice(cents: number, currency: string): string {
  return `${(cents / 100).toFixed(2)} ${currency}`;
}

export function VehicleEditPage({ vehicleId }: VehicleEditPageProps) {
  const { locations: getLocationsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.locations.detail');
  const tAvailability = useTranslations('modules.locations.sections.availability');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab: TabValue = isTabValue(tabParam) ? tabParam : 'vehicule';

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

  const handleTabChange = useCallback(
    (tab: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (tab === 'vehicule') {
        params.delete('tab');
      } else {
        params.set('tab', tab);
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const viewHref = `/produits/locations/${vehicleId}/voir`;
  const availabilityHref = `/produits/locations/${vehicleId}/disponibilites`;

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
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="space-y-4">
        <AdminPageBackLink href="/produits/locations" label={t('backLink')} />
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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <AdminPageBackLink href="/produits/locations" label={t('backLink')} />
        <div className="flex flex-wrap items-center gap-2">
          <Button href={viewHref} variant="outline">
            {t('viewButton')}
          </Button>
          <Button href={availabilityHref} variant="outline">
            {tAvailability('title')}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-start gap-4">
        <VehicleThumbnail
          vehicleId={vehicleId}
          label={thumbnailLabel}
          categoryName={categoryName}
          size="md"
        />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {vehicle.licensePlate ? (
              <h2 className="font-mono text-xl font-semibold text-atg-fg">
                {vehicle.licensePlate}
              </h2>
            ) : (
              <h2 className="text-xl font-semibold text-atg-fg">
                {t('noLicensePlate')}
              </h2>
            )}
            <DataTableBadge variant="muted">{agencyName}</DataTableBadge>
            <DataTableBadge variant="default">{categoryName}</DataTableBadge>
          </div>
          <p className="tabular-nums text-sm font-semibold text-atg-fg">
            {formatPrice(vehicle.dailyPriceCents, vehicle.currency)}
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList aria-label={t('tabsAria')}>
          <TabsTrigger value="vehicule">{t('tabs.vehicle')}</TabsTrigger>
          <TabsTrigger value="disponibilites">{t('tabs.availability')}</TabsTrigger>
        </TabsList>

        <TabsContent value="vehicule" className="space-y-4">
          <VehicleSpecsGrid categoryName={categoryName} />
          <VehicleForm
            mode="edit"
            vehicleId={vehicleId}
            initialVehicle={vehicle}
            identityAside={
              <VehicleImagesSection
                vehicleId={vehicleId}
                embedded
                variant="aside"
                altFallback={thumbnailLabel}
              />
            }
          />
        </TabsContent>

        <TabsContent value="disponibilites">
          <VehicleAvailabilitySection vehicleId={vehicleId} embedded />
        </TabsContent>
      </Tabs>
    </div>
  );
}

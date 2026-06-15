'use client';

import type { Property } from '@africatourismgate/types';
import {
  DataTableBadge,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@africatourismgate/ui';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { getApiClient } from '../../lib/auth/api';
import { getHebergementsErrorMessage } from '../../lib/hebergements-errors';
import { PropertyAmenitiesSection } from './property-amenities-section';
import { PropertyAvailabilitySection } from './property-availability-section';
import { PropertyForm } from './property-form';
import { PropertyImagesSection } from './property-images-section';
import { PropertyRoomsSection } from './property-rooms-section';
import { PropertyThumbnail } from './property-thumbnail';

type PropertyEditPageProps = {
  propertyId: string;
};

const TAB_VALUES = ['infos', 'chambres', 'equipements', 'disponibilites'] as const;
type TabValue = (typeof TAB_VALUES)[number];

const propertyTypeLabels: Record<Property['propertyType'], string> = {
  hotel: 'Hôtel',
  resort: 'Resort',
  apartment: 'Appartement',
  villa: 'Villa',
  hostel: 'Auberge',
  other: 'Autre',
};

function isTabValue(value: string | null): value is TabValue {
  return value !== null && (TAB_VALUES as readonly string[]).includes(value);
}

export function PropertyEditPage({ propertyId }: PropertyEditPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab: TabValue = isTabValue(tabParam) ? tabParam : 'infos';

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

  const handleTabChange = useCallback(
    (tab: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (tab === 'infos') {
        params.delete('tab');
        params.delete('roomId');
      } else {
        params.set('tab', tab);
        if (tab !== 'disponibilites') {
          params.delete('roomId');
        }
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  if (state.status === 'loading') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-16 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-10 w-full max-w-xl" />
        <Skeleton className="h-64 w-full" />
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
          href="/hebergements"
          className="text-sm font-medium text-primary hover:text-primary-hover"
        >
          ← Retour à la liste
        </Link>
      </div>
    );
  }

  const { property } = state;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <PropertyThumbnail propertyId={propertyId} name={property.name} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold text-atg-fg">{property.name}</h2>
            <DataTableBadge variant="muted">
              {propertyTypeLabels[property.propertyType]}
            </DataTableBadge>
            {property.starRating != null && Number(property.starRating) > 0 ? (
              <DataTableBadge variant="warning">{property.starRating} ★</DataTableBadge>
            ) : null}
          </div>
          <p className="mt-1 font-mono text-sm text-atg-muted">{property.slug}</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList aria-label="Sections de l'hébergement">
          <TabsTrigger value="infos">Infos</TabsTrigger>
          <TabsTrigger value="chambres">Chambres</TabsTrigger>
          <TabsTrigger value="equipements">Équipements</TabsTrigger>
          <TabsTrigger value="disponibilites">Disponibilités</TabsTrigger>
        </TabsList>

        <TabsContent value="infos">
          <div className="space-y-8">
            <PropertyForm mode="edit" propertyId={propertyId} initialProperty={property} />
            <PropertyImagesSection propertyId={propertyId} embedded />
          </div>
        </TabsContent>

        <TabsContent value="chambres">
          <PropertyRoomsSection propertyId={propertyId} embedded />
        </TabsContent>

        <TabsContent value="equipements">
          <PropertyAmenitiesSection propertyId={propertyId} embedded />
        </TabsContent>

        <TabsContent value="disponibilites">
          <PropertyAvailabilitySection propertyId={propertyId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

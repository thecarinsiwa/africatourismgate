'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';
import {
  useFormatDateTime,
  usePropertyTypeLabels,
} from '../../lib/i18n/use-module-labels';

import type { Amenity, Property, PropertyImage, Room } from '@africatourismgate/types';
import {
  Button,
  Card,
  DataTable,
  DataTableBadge,
  Skeleton,
  type ColumnDef,
} from '@africatourismgate/ui';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminPageBackLink } from '../admin-page-back-link';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { getAmenityIcon } from '../../lib/amenity-icon-map';
import { getApiClient } from '../../lib/auth/api';
import { formatMoney } from '../../lib/format-money';
import { resolveMediaUrl } from '../../lib/resolve-media-url';
import { PropertyExportPdfButton } from './property-export-pdf-button';
import { PropertyThumbnail } from './property-thumbnail';

type PropertyViewPageProps = {
  propertyId: string;
};

function ProfileField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-atg-muted">{label}</dt>
      <dd className="mt-0.5 break-words text-sm font-medium text-atg-fg">{value}</dd>
    </div>
  );
}

export function PropertyViewPage({ propertyId }: PropertyViewPageProps) {
  const { hebergements: getHebergementsErrorMessage } = useAdminErrorMessages();
  const tDetail = useTranslations('modules.properties.detail');
  const tView = useTranslations('modules.properties.view');
  const tPropForm = useTranslations('modules.properties.form');
  const tPropColumns = useTranslations('modules.properties.columns');
  const tRooms = useTranslations('modules.properties.sections.rooms');
  const tAmenities = useTranslations('modules.properties.sections.amenities');
  const tColumns = useTranslations('modules.common.columns');
  const tDates = useTranslations('modules.common.dates');
  const tCommon = useTranslations('modules.common');
  const tActions = useTranslations('common.actions');
  const propertyTypeLabels = usePropertyTypeLabels();
  const formatDateTime = useFormatDateTime('short');
  const emptyDash = tCommon('empty.dash');

  const [property, setProperty] = useState<Property | null>(null);
  const [destinationName, setDestinationName] = useState<string | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [images, setImages] = useState<PropertyImage[]>([]);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready' }
  >({ status: 'loading' });

  useAdminEditPageMeta({
    ready: state.status === 'ready' && property != null,
    title: tView('title'),
    entityLabel: property?.name,
  });

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const client = getApiClient();
      const loaded = await client.getProperty(propertyId);
      const [destination, roomsResult, amenityLinks, allAmenities, imagesResult] =
        await Promise.all([
          client.getDestination(loaded.destinationId).catch(() => null),
          client.listRooms({ propertyId, page: 1, limit: 100 }),
          client.listPropertyAmenities({ propertyId, page: 1, limit: 100 }),
          client.listAmenities({ page: 1, limit: 100 }),
          client.listPropertyImages({ propertyId, page: 1, limit: 100 }),
        ]);

      const selectedIds = new Set(amenityLinks.data.map((link) => link.amenityId));
      setProperty(loaded);
      setDestinationName(destination?.name ?? null);
      setRooms(roomsResult.data);
      setAmenities(allAmenities.data.filter((amenity) => selectedIds.has(amenity.id)));
      setImages(
        [...imagesResult.data].sort((a, b) => a.sortOrder - b.sortOrder || a.createdAt.localeCompare(b.createdAt)),
      );
      setState({ status: 'ready' });
    } catch (error) {
      setState({ status: 'error', message: getHebergementsErrorMessage(error) });
    }
  }, [propertyId, getHebergementsErrorMessage]);

  useEffect(() => {
    void load();
  }, [load]);

  const roomColumns = useMemo<ColumnDef<Room, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: tColumns('name'),
        cell: ({ row }) => (
          <span className="font-medium text-atg-fg">{row.original.name}</span>
        ),
      },
      {
        id: 'roomType',
        header: tRooms('roomType'),
        cell: ({ row }) => (
          <span className="text-sm text-atg-muted">
            {row.original.roomType?.trim() || emptyDash}
          </span>
        ),
      },
      {
        id: 'maxGuests',
        header: tRooms('maxCapacity'),
        meta: { align: 'right' },
        cell: ({ row }) => (
          <span className="tabular-nums text-sm text-atg-fg">{row.original.maxGuests}</span>
        ),
      },
      {
        id: 'price',
        header: tColumns('basePrice'),
        meta: { align: 'right' },
        cell: ({ row }) => (
          <span className="tabular-nums text-sm text-atg-fg">
            {formatMoney(row.original.basePriceCents, row.original.currency)}
          </span>
        ),
      },
    ],
    [emptyDash, tColumns, tRooms],
  );

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
        <Skeleton className="h-64 w-full max-w-3xl" />
      </div>
    );
  }

  if (state.status === 'error' || !property) {
    return (
      <div className="space-y-4">
        <AdminPageBackLink href="/hebergements" label={tDetail('backLink')} />
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.status === 'error' ? state.message : tView('notFound')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <AdminPageBackLink href="/hebergements" label={tDetail('backLink')} />
        <div className="flex flex-wrap items-center gap-2">
          <PropertyExportPdfButton propertyId={propertyId} />
          <Button href={`/hebergements/${propertyId}`}>{tView('editButton')}</Button>
        </div>
      </div>

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

      <Card variant="dashboard" padding="md" className="max-w-2xl">
        <h3 className="text-sm font-semibold text-atg-fg">{tView('infoTitle')}</h3>
        <dl className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2">
          <ProfileField
            label={tPropForm('destination')}
            value={destinationName ?? emptyDash}
          />
          <ProfileField label={tPropForm('slug')} value={property.slug} />
          <ProfileField
            label={tPropColumns('propertyType')}
            value={propertyTypeLabels[property.propertyType]}
          />
          <ProfileField
            label={tPropForm('starRating')}
            value={
              property.starRating != null && Number(property.starRating) > 0
                ? `${property.starRating} ★`
                : emptyDash
            }
          />
          <ProfileField
            label={tPropForm('address')}
            value={property.addressLine?.trim() || emptyDash}
          />
          <ProfileField
            label={tDates('createdAt')}
            value={formatDateTime(property.createdAt)}
          />
          <ProfileField
            label={tDates('updatedAt')}
            value={property.updatedAt ? formatDateTime(property.updatedAt) : emptyDash}
          />
          <div className="min-w-0 sm:col-span-2">
            <dt className="text-[11px] font-medium uppercase tracking-wide text-atg-muted">
              {tView('description')}
            </dt>
            <dd className="mt-0.5 text-sm text-atg-fg">
              {property.description?.trim() ? (
                <p className="whitespace-pre-wrap">{property.description}</p>
              ) : (
                emptyDash
              )}
            </dd>
          </div>
        </dl>
      </Card>

      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-atg-fg">{tView('imagesTitle')}</h3>
          <p className="mt-1 text-sm text-atg-muted">
            {tView('imagesIntro', { count: images.length })}
          </p>
        </div>
        {images.length === 0 ? (
          <p className="text-sm text-atg-muted">{tView('imagesEmpty')}</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {images.map((image) => (
              <li key={image.id} className="w-28 sm:w-32">
                <Card variant="dashboard" padding="none" className="overflow-hidden">
                  <div className="relative aspect-square bg-atg-surface">
                    <Image
                      src={resolveMediaUrl(image.url)}
                      alt={image.caption?.trim() || property.name}
                      fill
                      className="object-cover"
                      sizes="128px"
                      unoptimized
                    />
                  </div>
                  {image.caption?.trim() ? (
                    <p className="truncate px-1.5 py-1 text-[10px] text-atg-muted">
                      {image.caption}
                    </p>
                  ) : null}
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-atg-fg">{tRooms('title')}</h3>
          <p className="mt-1 text-sm text-atg-muted">
            {tView('roomsIntro', { count: rooms.length })}
          </p>
        </div>
        <Card variant="dashboard" padding="none" className="overflow-hidden">
          <DataTable
            columns={roomColumns}
            data={rooms}
            emptyMessage={tRooms('empty')}
            getRowId={(row) => row.id}
            aria-label={tRooms('title')}
            loadingMessage={tCommon('dataTable.loading')}
          />
        </Card>
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-atg-fg">{tAmenities('title')}</h3>
          <p className="mt-1 text-sm text-atg-muted">
            {tView('amenitiesIntro', { count: amenities.length })}
          </p>
        </div>
        {amenities.length === 0 ? (
          <p className="text-sm text-atg-muted">{tView('amenitiesEmpty')}</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {amenities.map((amenity) => (
              <li key={amenity.id}>
                <Card variant="dashboard" className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-atg-surface text-primary">
                    {getAmenityIcon(amenity.code, 'h-5 w-5')}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-atg-fg">{amenity.name}</p>
                    <code className="font-mono text-xs text-atg-muted">{amenity.code}</code>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex justify-end">
        <Button href={`/hebergements/${propertyId}`} variant="outline">
          {tActions('edit')}
        </Button>
      </div>
    </div>
  );
}

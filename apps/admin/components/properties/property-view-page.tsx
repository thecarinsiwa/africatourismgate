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
  DataTableActionButton,
  DataTableActions,
  DataTableBadge,
  Input,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  type ColumnDef,
} from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AdminPageBackLink } from '../admin-page-back-link';
import { RichTextContent } from '../rich-text-content';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { getAmenityIcon } from '../../lib/amenity-icon-map';
import { getApiClient } from '../../lib/auth/api';
import { formatMoney } from '../../lib/format-money';
import { isRichTextEmpty } from '../../lib/rich-text';
import { PropertyExportPdfButton } from './property-export-pdf-button';
import { PropertyPhotosCarousel } from './property-photos-carousel';
import { PropertyThumbnail } from './property-thumbnail';
import { RoomViewModal } from './room-view-modal';

type PropertyViewPageProps = {
  propertyId: string;
};

const TAB_VALUES = ['infos', 'chambres', 'equipements', 'disponibilites'] as const;
type TabValue = (typeof TAB_VALUES)[number];

function isTabValue(value: string | null): value is TabValue {
  return value !== null && (TAB_VALUES as readonly string[]).includes(value);
}

function ProfileField({ label, value }: { label: string; value: ReactNode }) {
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
  const tAvailability = useTranslations('modules.properties.sections.availability');
  const tColumns = useTranslations('modules.common.columns');
  const tDates = useTranslations('modules.common.dates');
  const tCommon = useTranslations('modules.common');
  const tActions = useTranslations('common.actions');
  const propertyTypeLabels = usePropertyTypeLabels();
  const formatDateTime = useFormatDateTime('short');
  const emptyDash = tCommon('empty.dash');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab: TabValue = isTabValue(tabParam) ? tabParam : 'infos';

  const [property, setProperty] = useState<Property | null>(null);
  const [destinationName, setDestinationName] = useState<string | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomSearch, setRoomSearch] = useState('');
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [amenitySearch, setAmenitySearch] = useState('');
  const [images, setImages] = useState<PropertyImage[]>([]);
  const [viewingRoom, setViewingRoom] = useState<Room | null>(null);
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

  const handleTabChange = useCallback(
    (tab: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (tab === 'infos') {
        params.delete('tab');
      } else {
        params.set('tab', tab);
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

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
        [...imagesResult.data].sort(
          (a, b) => a.sortOrder - b.sortOrder || a.createdAt.localeCompare(b.createdAt),
        ),
      );
      setState({ status: 'ready' });
    } catch (error) {
      setState({ status: 'error', message: getHebergementsErrorMessage(error) });
    }
  }, [propertyId, getHebergementsErrorMessage]);

  useEffect(() => {
    void load();
  }, [load]);

  const editHref = `/hebergements/${propertyId}`;
  const editRoomsHref = `${editHref}?tab=chambres`;
  const editAmenitiesHref = `${editHref}?tab=equipements`;
  const editAvailabilityHref = `${editHref}?tab=disponibilites`;

  const roomColumns = useMemo<ColumnDef<Room, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: tColumns('name'),
        cell: ({ row }) => {
          const bedConfig = row.original.bedConfig?.trim();
          return (
            <div className="min-w-0">
              <p className="truncate font-medium text-atg-fg">{row.original.name}</p>
              {bedConfig ? (
                <p className="mt-0.5 truncate text-xs text-atg-muted">{bedConfig}</p>
              ) : null}
            </div>
          );
        },
      },
      {
        id: 'roomType',
        header: tRooms('roomType'),
        meta: { hideOnMobile: true },
        cell: ({ row }) => {
          const roomType = row.original.roomType?.trim();
          if (!roomType) {
            return <span className="text-sm text-atg-muted">{emptyDash}</span>;
          }
          return <DataTableBadge variant="muted">{roomType}</DataTableBadge>;
        },
      },
      {
        id: 'maxGuests',
        header: tRooms('maxCapacity'),
        meta: { align: 'center', hideOnMobile: true },
        cell: ({ row }) => (
          <span className="inline-flex items-center justify-center rounded-md bg-atg-surface px-2 py-0.5 text-xs font-medium tabular-nums text-atg-fg">
            {tCommon('maxGuests', { count: row.original.maxGuests })}
          </span>
        ),
      },
      {
        id: 'price',
        header: tColumns('basePrice'),
        meta: { align: 'right' },
        cell: ({ row }) => (
          <div className="text-right">
            <p className="tabular-nums text-sm font-semibold text-atg-fg">
              {formatMoney(row.original.basePriceCents, row.original.currency)}
            </p>
            <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-atg-muted">
              {row.original.currency}
            </p>
          </div>
        ),
      },
      {
        id: 'actions',
        header: tColumns('actions'),
        meta: { align: 'right' },
        cell: ({ row }) => (
          <DataTableActions className="opacity-90 transition-opacity group-hover:opacity-100">
            <DataTableActionButton
              action="view"
              label={tRooms('viewAction')}
              onClick={() => setViewingRoom(row.original)}
            />
            <DataTableActionButton
              action="calendar"
              href={`/hebergements/${propertyId}/chambres/${row.original.id}/disponibilites`}
            />
            <DataTableActionButton
              action="edit"
              href={editRoomsHref}
              label={tActions('edit')}
            />
          </DataTableActions>
        ),
      },
    ],
    [editRoomsHref, emptyDash, propertyId, tActions, tColumns, tCommon, tRooms],
  );

  const filteredRooms = useMemo(() => {
    const query = roomSearch.trim().toLowerCase();
    const sorted = [...rooms].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
    );
    if (!query) return sorted;

    return sorted.filter((room) => {
      const haystack = [
        room.name,
        room.roomType,
        room.bedConfig,
        room.currency,
        String(room.maxGuests),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [rooms, roomSearch]);

  const hasRoomSearch = roomSearch.trim().length > 0;

  const filteredAmenities = useMemo(() => {
    const query = amenitySearch.trim().toLowerCase();
    const sorted = [...amenities].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
    );
    if (!query) return sorted;

    return sorted.filter((amenity) => {
      const haystack = `${amenity.name} ${amenity.code}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [amenities, amenitySearch]);

  const hasAmenitySearch = amenitySearch.trim().length > 0;

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
        <Skeleton className="h-10 w-full max-w-xl" />
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
          <Button href={editHref}>{tView('editButton')}</Button>
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

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList aria-label={tDetail('tabsAria')}>
          <TabsTrigger value="infos">{tDetail('tabs.infos')}</TabsTrigger>
          <TabsTrigger value="chambres">
            {tDetail('tabs.rooms')}
            {rooms.length > 0 ? (
              <DataTableBadge variant="muted" className="ml-1.5">
                {rooms.length}
              </DataTableBadge>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="equipements">
            {tDetail('tabs.amenities')}
            {amenities.length > 0 ? (
              <DataTableBadge variant="muted" className="ml-1.5">
                {amenities.length}
              </DataTableBadge>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="disponibilites">{tDetail('tabs.availability')}</TabsTrigger>
        </TabsList>

        <TabsContent value="infos" className="space-y-4">
          <Card variant="dashboard" padding="sm">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,18rem)] lg:items-start xl:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-atg-fg">{tView('infoTitle')}</h3>
                <dl className="mt-3 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
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
                    value={
                      property.updatedAt ? formatDateTime(property.updatedAt) : emptyDash
                    }
                  />
                  <div className="min-w-0 sm:col-span-2">
                    <dt className="text-[11px] font-medium uppercase tracking-wide text-atg-muted">
                      {tView('description')}
                    </dt>
                    <dd className="mt-0.5 text-sm text-atg-fg">
                      {property.description?.trim() &&
                      !isRichTextEmpty(property.description) ? (
                        <RichTextContent html={property.description} />
                      ) : (
                        emptyDash
                      )}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="min-w-0 lg:border-l lg:border-atg-border lg:pl-6">
                <h3 className="text-sm font-semibold text-atg-fg">{tView('imagesTitle')}</h3>
                <p className="mt-0.5 text-xs text-atg-muted">
                  {tView('imagesIntro', { count: images.length })}
                </p>
                <div className="mt-2">
                  <PropertyPhotosCarousel images={images} altFallback={property.name} />
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="chambres" className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold text-atg-fg">{tRooms('title')}</h3>
                <DataTableBadge variant="muted">
                  {hasRoomSearch ? `${filteredRooms.length}/${rooms.length}` : rooms.length}
                </DataTableBadge>
              </div>
              <p className="mt-1 text-sm text-atg-muted">
                {tView('roomsIntro', { count: rooms.length })}
              </p>
            </div>
            <Button href={editRoomsHref} variant="outline" size="sm">
              {tActions('edit')}
            </Button>
          </div>
          {rooms.length > 0 ? (
            <div className="max-w-md">
              <Input
                type="search"
                placeholder={tRooms('searchPlaceholder')}
                value={roomSearch}
                onChange={(e) => setRoomSearch(e.target.value)}
                aria-label={tRooms('searchPlaceholder')}
              />
            </div>
          ) : null}
          <Card variant="dashboard" padding="none" className="overflow-hidden">
            <DataTable
              columns={roomColumns}
              data={filteredRooms}
              emptyMessage={hasRoomSearch ? tRooms('searchEmpty') : tRooms('empty')}
              emptyVariant={hasRoomSearch ? 'search' : 'default'}
              getRowId={(row) => row.id}
              aria-label={tRooms('title')}
              loadingMessage={tCommon('dataTable.loading')}
              expandRowLabel={tCommon('dataTable.expandRow')}
              collapseRowLabel={tCommon('dataTable.collapseRow')}
              expandRowAriaLabel={tCommon('dataTable.expandRowAria')}
            />
          </Card>
        </TabsContent>

        <TabsContent value="equipements" className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold text-atg-fg">{tAmenities('title')}</h3>
                <DataTableBadge variant="muted">
                  {hasAmenitySearch
                    ? `${filteredAmenities.length}/${amenities.length}`
                    : amenities.length}
                </DataTableBadge>
              </div>
              <p className="mt-1 text-sm text-atg-muted">
                {tView('amenitiesIntro', { count: amenities.length })}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button href="/hebergements/equipements" variant="outline" size="sm">
                {tAmenities('createLink')}
              </Button>
              <Button href={editAmenitiesHref} variant="outline" size="sm">
                {tAmenities('editAmenities')}
              </Button>
            </div>
          </div>

          {amenities.length > 0 ? (
            <div className="max-w-md">
              <Input
                type="search"
                placeholder={tAmenities('searchPlaceholder')}
                value={amenitySearch}
                onChange={(e) => setAmenitySearch(e.target.value)}
                aria-label={tAmenities('searchPlaceholder')}
              />
            </div>
          ) : null}

          {amenities.length === 0 ? (
            <Card variant="dashboard" padding="sm">
              <p className="text-sm text-atg-muted">{tView('amenitiesEmpty')}</p>
            </Card>
          ) : filteredAmenities.length === 0 ? (
            <Card variant="dashboard" padding="sm">
              <p className="text-sm text-atg-muted">{tAmenities('searchEmpty')}</p>
            </Card>
          ) : (
            <ul className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredAmenities.map((amenity) => (
                <li key={amenity.id}>
                  <Card variant="dashboard" padding="sm" className="h-full">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-atg-surface text-primary">
                        {getAmenityIcon(amenity.code, 'h-5 w-5')}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-atg-fg">
                          {amenity.name}
                        </p>
                        <code className="mt-0.5 inline-block max-w-full truncate rounded-md bg-atg-surface px-1.5 py-0.5 font-mono text-[11px] text-atg-muted">
                          {amenity.code}
                        </code>
                      </div>
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="disponibilites" className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-atg-fg">{tAvailability('title')}</h3>
              <p className="mt-1 text-sm text-atg-muted">{tView('availabilityIntro')}</p>
            </div>
            <Button href={editAvailabilityHref} variant="outline" size="sm">
              {tActions('edit')}
            </Button>
          </div>

          {rooms.length === 0 ? (
            <Card variant="dashboard" padding="sm">
              <p className="text-sm text-atg-muted">{tAvailability('noRooms')}</p>
              <Button href={editRoomsHref} variant="outline" size="sm" className="mt-3">
                {tAvailability('goToRoomsTab')}
              </Button>
            </Card>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {rooms.map((room) => (
                <li key={room.id}>
                  <Card variant="dashboard" padding="sm" className="h-full">
                    <div className="flex flex-col gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-atg-fg">{room.name}</p>
                        <p className="mt-0.5 text-xs text-atg-muted">
                          {formatMoney(room.basePriceCents, room.currency)}
                          {room.roomType?.trim() ? ` · ${room.roomType.trim()}` : ''}
                        </p>
                      </div>
                      <Button
                        href={`/hebergements/${propertyId}/chambres/${room.id}/disponibilites`}
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto"
                      >
                        {tRooms('availabilityAction')}
                      </Button>
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>

      <RoomViewModal
        room={viewingRoom}
        propertyId={propertyId}
        open={!!viewingRoom}
        onOpenChange={(open) => {
          if (!open) setViewingRoom(null);
        }}
        onEdit={() => {
          setViewingRoom(null);
          router.push(editRoomsHref);
        }}
      />
    </div>
  );
}

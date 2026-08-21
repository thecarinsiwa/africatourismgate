'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';
import { useFormatDateTime, useFlightClassLabels } from '../../lib/i18n/use-module-labels';

import type { Airline, Airport, Flight, FlightClass, FlightImage } from '@africatourismgate/types';
import {
  Button,
  Card,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  DataTableBadge,
  Input,
  Skeleton,
  type ColumnDef,
} from '@africatourismgate/ui';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminPageBackLink } from '../admin-page-back-link';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { getApiClient } from '../../lib/auth/api';
import {
  formatDurationMinutes,
  formatFlightSchedule,
} from '../../lib/flight-datetime';
import { FlightExportPdfButton } from './flight-export-pdf-button';
import { FlightPhotosCarousel } from './flight-photos-carousel';
import { FlightThumbnail } from './flight-thumbnail';
import { FlightTimeline } from './flight-timeline';

type FlightViewPageProps = {
  flightId: string;
};

function ProfileField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-atg-muted">{label}</dt>
      <dd className="mt-0.5 break-words text-sm font-medium text-atg-fg">{value}</dd>
    </div>
  );
}

function formatPrice(cents: number): string {
  return `${(cents / 100).toFixed(2)} USD`;
}

function formatAirportLabel(airport: Airport | null, emptyDash: string): string {
  if (!airport) return emptyDash;
  return `${airport.iataCode} — ${airport.city}`;
}

export function FlightViewPage({ flightId }: FlightViewPageProps) {
  const { vols: getVolsErrorMessage } = useAdminErrorMessages();
  const tDetail = useTranslations('modules.flights.detail');
  const tView = useTranslations('modules.flights.view');
  const tForm = useTranslations('modules.flights.form');
  const tSections = useTranslations('modules.flights.sections.classes');
  const tColumns = useTranslations('modules.common.columns');
  const tDates = useTranslations('modules.common.dates');
  const tCommon = useTranslations('modules.common');
  const tActions = useTranslations('common.actions');
  const classLabels = useFlightClassLabels();
  const formatDateTime = useFormatDateTime('short');
  const locale = useLocale();
  const emptyDash = tCommon('empty.dash');

  const [flight, setFlight] = useState<Flight | null>(null);
  const [airline, setAirline] = useState<Airline | null>(null);
  const [departureAirport, setDepartureAirport] = useState<Airport | null>(null);
  const [arrivalAirport, setArrivalAirport] = useState<Airport | null>(null);
  const [classes, setClasses] = useState<FlightClass[]>([]);
  const [classSearch, setClassSearch] = useState('');
  const [images, setImages] = useState<FlightImage[]>([]);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready' }
  >({ status: 'loading' });

  useAdminEditPageMeta({
    ready: state.status === 'ready' && flight != null,
    title: tView('title'),
    entityLabel: flight?.flightNumber,
  });

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const client = getApiClient();
      const flightData = await client.getFlight(flightId);
      const [classesResult, imagesResult, airlineData, departureData, arrivalData] =
        await Promise.all([
          client.listFlightClasses({ flightId, page: 1, limit: 100 }),
          client.listFlightImages({ flightId, page: 1, limit: 100 }),
          client.getAirline(flightData.airlineId).catch(() => null),
          client.getAirport(flightData.departureAirportId).catch(() => null),
          client.getAirport(flightData.arrivalAirportId).catch(() => null),
        ]);

      setFlight(flightData);
      setClasses(classesResult.data);
      setImages(
        [...imagesResult.data].sort(
          (a, b) => a.sortOrder - b.sortOrder || a.createdAt.localeCompare(b.createdAt),
        ),
      );
      setAirline(airlineData);
      setDepartureAirport(departureData);
      setArrivalAirport(arrivalData);
      setState({ status: 'ready' });
    } catch (error) {
      setState({ status: 'error', message: getVolsErrorMessage(error) });
    }
  }, [flightId, getVolsErrorMessage]);

  useEffect(() => {
    void load();
  }, [load]);

  const classColumns = useMemo<ColumnDef<FlightClass, unknown>[]>(
    () => [
      {
        accessorKey: 'className',
        header: tSections('cabinType'),
        cell: ({ row }) => (
          <DataTableBadge variant="muted">
            {classLabels[row.original.className] ?? row.original.className}
          </DataTableBadge>
        ),
      },
      {
        accessorKey: 'seatsTotal',
        header: tSections('totalSeats'),
        meta: { align: 'center', hideOnMobile: true },
        cell: ({ row }) => (
          <span className="inline-flex items-center justify-center rounded-md bg-atg-surface px-2 py-0.5 text-xs font-medium tabular-nums text-atg-fg">
            {row.original.seatsTotal}
          </span>
        ),
      },
      {
        id: 'basePrice',
        header: tColumns('price'),
        meta: { align: 'right' },
        cell: ({ row }) => (
          <div className="text-right">
            <p className="tabular-nums text-sm font-semibold text-atg-fg">
              {formatPrice(row.original.basePriceCents)}
            </p>
            <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-atg-muted">
              USD
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
              action="calendar"
              href={`/produits/vols/${flightId}/classes/${row.original.id}/disponibilites`}
            />
            <DataTableActionButton
              action="edit"
              href={`/produits/vols/${flightId}`}
              label={tActions('edit')}
            />
          </DataTableActions>
        ),
      },
    ],
    [classLabels, flightId, tActions, tColumns, tSections],
  );

  const filteredClasses = useMemo(() => {
    const query = classSearch.trim().toLowerCase();
    const sorted = [...classes].sort((a, b) => {
      const labelA = classLabels[a.className] ?? a.className;
      const labelB = classLabels[b.className] ?? b.className;
      return labelA.localeCompare(labelB, undefined, { sensitivity: 'base' });
    });
    if (!query) return sorted;

    return sorted.filter((flightClass) => {
      const label = classLabels[flightClass.className] ?? flightClass.className;
      const haystack = [
        label,
        flightClass.className,
        String(flightClass.seatsTotal),
        formatPrice(flightClass.basePriceCents),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [classes, classSearch, classLabels]);

  const hasClassSearch = classSearch.trim().length > 0;

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

  if (state.status === 'error' || !flight) {
    return (
      <div className="space-y-4">
        <AdminPageBackLink href="/produits/vols" label={tDetail('backLink')} />
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.status === 'error' ? state.message : tView('notFound')}
        </p>
      </div>
    );
  }

  const schedule = formatFlightSchedule(flight.departureTime, flight.arrivalTime, locale);
  const editHref = `/produits/vols/${flightId}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <AdminPageBackLink href="/produits/vols" label={tDetail('backLink')} />
        <div className="flex flex-wrap items-center gap-2">
          <FlightExportPdfButton flightId={flightId} />
          <Button href={editHref}>{tView('editButton')}</Button>
        </div>
      </div>

      <div className="flex flex-wrap items-start gap-4">
        <FlightThumbnail flightId={flightId} label={flight.flightNumber} size="md" />
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold text-atg-fg">{flight.flightNumber}</h2>
            {airline ? (
              <DataTableBadge variant="muted">
                {airline.iataCode} — {airline.name}
              </DataTableBadge>
            ) : null}
          </div>
          <FlightTimeline
            departureAirport={departureAirport}
            arrivalAirport={arrivalAirport}
            departureTime={flight.departureTime}
            arrivalTime={flight.arrivalTime}
            durationMinutes={flight.durationMinutes}
          />
        </div>
      </div>

      <Card variant="dashboard" padding="sm">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,18rem)] lg:items-start xl:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-atg-fg">{tView('infoTitle')}</h3>
            <dl className="mt-3 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
              <ProfileField
                label={tForm('airline')}
                value={
                  airline ? `${airline.iataCode} — ${airline.name}` : emptyDash
                }
              />
              <ProfileField label={tForm('flightNumber')} value={flight.flightNumber} />
              <ProfileField
                label={tForm('departure')}
                value={
                  <span>
                    {formatAirportLabel(departureAirport, emptyDash)}
                    {departureAirport?.name ? (
                      <span className="mt-0.5 block text-xs font-normal text-atg-muted">
                        {departureAirport.name}
                      </span>
                    ) : null}
                  </span>
                }
              />
              <ProfileField
                label={tForm('arrival')}
                value={
                  <span>
                    {formatAirportLabel(arrivalAirport, emptyDash)}
                    {arrivalAirport?.name ? (
                      <span className="mt-0.5 block text-xs font-normal text-atg-muted">
                        {arrivalAirport.name}
                      </span>
                    ) : null}
                  </span>
                }
              />
              <ProfileField label={tForm('departureTime')} value={schedule.departure} />
              <ProfileField label={tForm('arrivalTime')} value={schedule.arrival} />
              <ProfileField
                label={tForm('durationMinutes')}
                value={formatDurationMinutes(flight.durationMinutes, locale)}
              />
              <ProfileField
                label={tDates('createdAt')}
                value={formatDateTime(flight.createdAt)}
              />
              <ProfileField
                label={tDates('updatedAt')}
                value={flight.updatedAt ? formatDateTime(flight.updatedAt) : emptyDash}
              />
            </dl>
          </div>

          <div className="min-w-0 lg:border-l lg:border-atg-border lg:pl-6">
            <h3 className="text-sm font-semibold text-atg-fg">{tView('imagesTitle')}</h3>
            <p className="mt-0.5 text-xs text-atg-muted">
              {tView('imagesIntro', { count: images.length })}
            </p>
            <div className="mt-2">
              <FlightPhotosCarousel images={images} altFallback={flight.flightNumber} />
            </div>
          </div>
        </div>
      </Card>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold text-atg-fg">{tSections('title')}</h3>
              <DataTableBadge variant="muted">
                {hasClassSearch
                  ? `${filteredClasses.length}/${classes.length}`
                  : classes.length}
              </DataTableBadge>
            </div>
            <p className="mt-1 text-sm text-atg-muted">
              {tView('classesIntro', { count: classes.length })}
            </p>
          </div>
          <Button href={editHref} variant="outline" size="sm">
            {tSections('editClass')}
          </Button>
        </div>

        {classes.length > 0 ? (
          <div className="max-w-md">
            <Input
              type="search"
              placeholder={tSections('searchPlaceholder')}
              value={classSearch}
              onChange={(e) => setClassSearch(e.target.value)}
              aria-label={tSections('searchPlaceholder')}
            />
          </div>
        ) : null}

        <Card variant="dashboard" padding="none" className="overflow-hidden">
          <DataTable
            columns={classColumns}
            data={filteredClasses}
            emptyMessage={hasClassSearch ? tSections('searchEmpty') : tSections('empty')}
            emptyVariant={hasClassSearch ? 'search' : 'default'}
            getRowId={(row) => row.id}
            aria-label={tSections('title')}
            loadingMessage={tCommon('dataTable.loading')}
            expandRowLabel={tCommon('dataTable.expandRow')}
            collapseRowLabel={tCommon('dataTable.collapseRow')}
            expandRowAriaLabel={tCommon('dataTable.expandRowAria')}
          />
        </Card>
      </section>

      <div className="flex justify-end">
        <Button href={editHref} variant="outline">
          {tActions('edit')}
        </Button>
      </div>
    </div>
  );
}

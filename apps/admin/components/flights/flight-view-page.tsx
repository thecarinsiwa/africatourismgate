'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  Button,
  Card,
  DataTable,
  DataTableBadge,
  Skeleton,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { Airline, Airport, Flight, FlightClass, FlightImage } from '@africatourismgate/types';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminPageBackLink } from '../admin-page-back-link';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { getApiClient } from '../../lib/auth/api';
import { useFlightClassLabels } from '../../lib/i18n/use-module-labels';
import { FlightThumbnail } from './flight-thumbnail';
import { FlightTimeline } from './flight-timeline';

type FlightViewPageProps = {
  flightId: string;
};

function formatPrice(cents: number): string {
  return `${(cents / 100).toFixed(2)} USD`;
}

export function FlightViewPage({ flightId }: FlightViewPageProps) {
  const { vols: getVolsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.flights.detail');
  const tSections = useTranslations('modules.flights.sections.classes');
  const tCommon = useTranslations('modules.common');
  const classLabels = useFlightClassLabels();
  const emptyDash = tCommon('empty.dash');

  const [flight, setFlight] = useState<Flight | null>(null);
  const [airline, setAirline] = useState<Airline | null>(null);
  const [departureAirport, setDepartureAirport] = useState<Airport | null>(null);
  const [arrivalAirport, setArrivalAirport] = useState<Airport | null>(null);
  const [classes, setClasses] = useState<FlightClass[]>([]);
  const [images, setImages] = useState<FlightImage[]>([]);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready' }
  >({ status: 'loading' });

  useAdminEditPageMeta({
    ready: state.status === 'ready' && flight != null,
    title: t('viewTitle'),
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
      setImages(imagesResult.data);
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
        cell: ({ row }) => classLabels[row.original.className] ?? row.original.className,
      },
      {
        accessorKey: 'seatsTotal',
        header: tSections('totalSeats'),
        meta: { align: 'right' },
      },
      {
        id: 'basePrice',
        header: tCommon('columns.price'),
        meta: { align: 'right' },
        cell: ({ row }) => formatPrice(row.original.basePriceCents),
      },
    ],
    [classLabels, tCommon, tSections],
  );

  if (state.status === 'loading') {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-24 w-full max-w-3xl" />
        <Skeleton className="h-48 w-full max-w-2xl" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (state.status === 'error' || !flight) {
    return (
      <div className="space-y-4">
        <AdminPageBackLink href="/produits/vols" label={t('backLink')} />
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.status === 'error' ? state.message : t('notFound')}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <AdminPageBackLink href="/produits/vols" label={t('backLink')} />

      <Card
        variant="dashboard"
        className="flex flex-col gap-4 border border-atg-border/80 bg-atg-elevated/70 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5"
      >
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <FlightThumbnail flightId={flightId} label={flight.flightNumber} size="md" />
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <code className="rounded-md bg-atg-surface px-2.5 py-1 font-mono text-sm font-semibold text-atg-fg ring-1 ring-atg-border/60">
                {flight.flightNumber}
              </code>
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
        <Button href={`/produits/vols/${flightId}`} className="w-full sm:w-auto">
          {t('editButton')}
        </Button>
      </Card>

      <section className="space-y-4 rounded-xl border border-atg-border/80 bg-atg-elevated/40 p-4 sm:p-5">
        <div>
          <h3 className="text-lg font-semibold text-atg-fg">{tSections('title')}</h3>
          <p className="mt-1 text-sm text-atg-muted">{tSections('intro')}</p>
        </div>
        {classes.length === 0 ? (
          <Card variant="dashboard">
            <p className="text-sm text-atg-muted">{tSections('empty')}</p>
          </Card>
        ) : (
          <Card variant="dashboard" padding="none" className="overflow-hidden">
            <DataTable
              columns={classColumns}
              data={classes}
              getRowId={(row) => row.id}
              emptyMessage={tSections('empty')}
              aria-label={tSections('title')}
            />
          </Card>
        )}
      </section>

      <section className="space-y-4 rounded-xl border border-atg-border/80 bg-atg-elevated/40 p-4 sm:p-5">
        <div>
          <h3 className="text-lg font-semibold text-atg-fg">{t('photoGallery')}</h3>
          <p className="mt-1 text-sm text-atg-muted">
            {t('photoGalleryIntro', { count: images.length })}
          </p>
        </div>
        {images.length === 0 ? (
          <Card variant="dashboard">
            <p className="text-sm text-atg-muted">{t('noPhotos')}</p>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {images.map((image) => (
              <figure
                key={image.id}
                className="overflow-hidden rounded-lg border border-atg-border bg-atg-elevated shadow-sm"
              >
                <Image
                  src={image.url}
                  alt={image.caption ?? flight.flightNumber}
                  width={240}
                  height={160}
                  unoptimized
                  className="aspect-[3/2] w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                {image.caption ? (
                  <figcaption className="truncate px-2 py-1.5 text-xs text-atg-muted">
                    {image.caption}
                  </figcaption>
                ) : null}
              </figure>
            ))}
          </div>
        )}
      </section>

      <Card variant="dashboard" className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-atg-muted">
            {tCommon('columns.departure')}
          </p>
          <p className="mt-1 text-sm font-medium text-atg-fg">
            {departureAirport
              ? `${departureAirport.iataCode} — ${departureAirport.city}`
              : emptyDash}
          </p>
          {departureAirport?.name ? (
            <p className="text-xs text-atg-muted">{departureAirport.name}</p>
          ) : null}
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-atg-muted">
            {tCommon('columns.arrival')}
          </p>
          <p className="mt-1 text-sm font-medium text-atg-fg">
            {arrivalAirport ? `${arrivalAirport.iataCode} — ${arrivalAirport.city}` : emptyDash}
          </p>
          {arrivalAirport?.name ? (
            <p className="text-xs text-atg-muted">{arrivalAirport.name}</p>
          ) : null}
        </div>
      </Card>
    </div>
  );
}

'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import type { Airline, Airport, Flight } from '@africatourismgate/types';
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
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { AdminPageBackLink } from '../admin-page-back-link';
import { getApiClient } from '../../lib/auth/api';
import { FlightClassesSection } from './flight-classes-section';
import { FlightForm } from './flight-form';
import { FlightImagesSection } from './flight-images-section';
import { FlightThumbnail } from './flight-thumbnail';
import { FlightTimeline } from './flight-timeline';

type FlightEditPageProps = {
  flightId: string;
};

const TAB_VALUES = ['vol', 'classes'] as const;
type TabValue = (typeof TAB_VALUES)[number];

function isTabValue(value: string | null): value is TabValue {
  return value !== null && (TAB_VALUES as readonly string[]).includes(value);
}

export function FlightEditPage({ flightId }: FlightEditPageProps) {
  const { vols: getVolsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.flights.detail');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab: TabValue = isTabValue(tabParam) ? tabParam : 'vol';

  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | {
        status: 'ready';
        flight: Flight;
        airlines: Airline[];
        airports: Airport[];
      }
  >({ status: 'loading' });

  useAdminEditPageMeta({
    ready: state.status === 'ready',
    title: t('title'),
    entityLabel: state.status === 'ready' ? state.flight.flightNumber : undefined,
  });

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const client = getApiClient();
        const [flight, airlinesResult, airportsResult] = await Promise.all([
          client.getFlight(flightId),
          client.listAirlines({ page: 1, limit: 100 }),
          client.listAirports({ page: 1, limit: 100 }),
        ]);
        if (!cancelled) {
          setState({
            status: 'ready',
            flight,
            airlines: airlinesResult.data,
            airports: airportsResult.data,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setState({ status: 'error', message: getVolsErrorMessage(error) });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [flightId, getVolsErrorMessage]);

  const handleTabChange = useCallback(
    (tab: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (tab === 'vol') {
        params.delete('tab');
      } else {
        params.set('tab', tab);
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const airportById = useMemo(() => {
    if (state.status !== 'ready') return new Map<string, Airport>();
    return new Map(state.airports.map((a) => [a.id, a]));
  }, [state]);

  const airlineById = useMemo(() => {
    if (state.status !== 'ready') return new Map<string, Airline>();
    return new Map(state.airlines.map((a) => [a.id, a]));
  }, [state]);

  if (state.status === 'loading') {
    return (
      <div className="space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-16 w-full max-w-xl" />
        </div>
        <Skeleton className="h-10 w-full max-w-md" />
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
          href="/produits/vols"
          className="text-sm font-medium text-primary hover:text-primary-hover"
        >
          {t('backLink')}
        </Link>
      </div>
    );
  }

  const { flight, airlines, airports } = state;
  const departureAirport = airportById.get(flight.departureAirportId) ?? null;
  const arrivalAirport = airportById.get(flight.arrivalAirportId) ?? null;
  const airline = airlineById.get(flight.airlineId);

  return (
    <div className="space-y-6">
      <AdminPageBackLink href="/produits/vols" label={t('backLink')} />
      <div className="flex flex-col gap-4 rounded-xl border border-atg-border bg-atg-elevated p-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <FlightThumbnail flightId={flightId} label={flight.flightNumber} size="md" />
          <div className="min-w-0 flex-1 space-y-4">
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
        <Button href={`/produits/vols/${flightId}/voir`} variant="outline" className="w-full sm:w-auto">
          {t('viewButton')}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList aria-label={t('tabsAria')}>
          <TabsTrigger value="vol">{t('tabs.flight')}</TabsTrigger>
          <TabsTrigger value="classes">{t('tabs.classes')}</TabsTrigger>
        </TabsList>

        <TabsContent value="vol">
          <FlightForm
            mode="edit"
            flightId={flightId}
            initialFlight={flight}
            airlines={airlines}
            airports={airports}
            identityAside={
              <FlightImagesSection
                flightId={flightId}
                embedded
                variant="aside"
                altFallback={flight.flightNumber}
              />
            }
          />
        </TabsContent>

        <TabsContent value="classes">
          <FlightClassesSection flightId={flightId} embedded />
        </TabsContent>
      </Tabs>
    </div>
  );
}

'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import type { CruiseSailing, Itinerary, Ship } from '@africatourismgate/types';
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
import { buildCruiseBreadcrumbTail } from '../../lib/cruise-breadcrumbs';
import { CabinAvailabilitySection } from './cabin-availability-section';
import { SailingForm } from './sailing-form';
import { ShipThumbnail } from './ship-thumbnail';

type SailingEditPageProps = { sailingId: string };

const TAB_VALUES = ['depart', 'cabines'] as const;
type TabValue = (typeof TAB_VALUES)[number];

function isTabValue(value: string | null): value is TabValue {
  return value !== null && (TAB_VALUES as readonly string[]).includes(value);
}

export function SailingEditPage({ sailingId }: SailingEditPageProps) {
  const { croisieres: getCroisieresErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.cruises.detail');
  const tColumns = useTranslations('modules.cruises.columns');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab: TabValue = isTabValue(tabParam) ? tabParam : 'depart';

  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | {
        status: 'ready';
        sailing: CruiseSailing;
        itinerary: Itinerary;
        ship: Ship;
        lineName: string;
      }
  >({ status: 'loading' });

  useAdminEditPageMeta({
    ready: state.status === 'ready',
    title: t('sailingTitle'),
    breadcrumbTail:
      state.status === 'ready'
        ? buildCruiseBreadcrumbTail({
            lineName: state.lineName,
            shipName: state.ship.name,
            shipId: state.ship.id,
            itineraryName: state.itinerary.name,
            itineraryId: state.itinerary.id,
            departureLabel: state.sailing.departureDate.slice(0, 10),
          })
        : undefined,
  });

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const client = getApiClient();
        const sailing = await client.getCruiseSailing(sailingId);
        const itinerary = await client.getItinerary(sailing.itineraryId);
        const ship = await client.getShip(itinerary.shipId);
        const line = await client.getCruiseLine(ship.cruiseLineId);
        if (!cancelled) {
          setState({ status: 'ready', sailing, itinerary, ship, lineName: line.name });
        }
      } catch (error) {
        if (!cancelled) {
          setState({ status: 'error', message: getCroisieresErrorMessage(error) });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sailingId, getCroisieresErrorMessage]);

  const handleTabChange = useCallback(
    (tab: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (tab === 'depart') {
        params.delete('tab');
      } else {
        params.set('tab', tab);
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  if (state.status === 'loading') {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-40" />
        <div className="flex items-center gap-4 rounded-xl border border-atg-border bg-atg-elevated p-4">
          <Skeleton className="h-12 w-16 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-64 w-full max-w-2xl" />
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="space-y-4">
        <AdminPageBackLink href="/produits/croisieres" label={t('backToSailings')} />
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
        <Link
          href="/produits/croisieres"
          className="text-sm font-medium text-primary hover:text-primary-hover"
        >
          {t('backToSailings')}
        </Link>
      </div>
    );
  }

  const { sailing, itinerary, ship, lineName } = state;
  const departureLabel = sailing.departureDate.slice(0, 10);
  const shipHref = `/produits/croisieres/navires/${ship.id}`;
  const itineraryHref = `${shipHref}/itineraires/${itinerary.id}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <AdminPageBackLink href="/produits/croisieres" label={t('backToSailings')} />
        <div className="flex flex-wrap items-center gap-2">
          <Button href={shipHref} variant="outline">
            {t('viewShip')}
          </Button>
          <Button href={itineraryHref} variant="outline">
            {t('viewItinerary')}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-atg-border bg-atg-elevated p-4 sm:flex-row sm:items-start">
        <ShipThumbnail shipId={ship.id} label={ship.name} size="md" />
        <div className="min-w-0 flex-1 space-y-2">
          <h2 className="text-xl font-semibold tabular-nums text-atg-fg">
            {departureLabel}
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <DataTableBadge variant="muted">{lineName}</DataTableBadge>
            <DataTableBadge variant="default">{ship.name}</DataTableBadge>
            <DataTableBadge variant="muted">{itinerary.name}</DataTableBadge>
            <DataTableBadge variant="muted">
              {itinerary.durationNights} {tColumns('nights')}
            </DataTableBadge>
          </div>
          <p className="text-sm text-atg-muted">{t('sailingSubtitle')}</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList aria-label={t('tabsAria')}>
          <TabsTrigger value="depart">{t('tabs.sailing')}</TabsTrigger>
          <TabsTrigger value="cabines">{t('tabs.cabins')}</TabsTrigger>
        </TabsList>

        <TabsContent value="depart">
          <SailingForm mode="edit" sailingId={sailingId} initialSailing={sailing} />
        </TabsContent>

        <TabsContent value="cabines">
          <CabinAvailabilitySection
            sailingId={sailingId}
            shipId={ship.id}
            itineraryId={itinerary.id}
            embedded
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

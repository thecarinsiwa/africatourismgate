'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import type { Ship } from '@africatourismgate/types';
import {
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
import { CabinsSection } from './cabins-section';
import { ItinerariesSection } from './itineraries-section';
import { ShipForm } from './ship-form';
import { ShipImagesSection } from './ship-images-section';
import { ShipThumbnail } from './ship-thumbnail';

type ShipEditPageProps = { shipId: string };

const TAB_VALUES = ['navire', 'photos', 'itineraires', 'cabines'] as const;
type TabValue = (typeof TAB_VALUES)[number];

function isTabValue(value: string | null): value is TabValue {
  return value !== null && (TAB_VALUES as readonly string[]).includes(value);
}

export function ShipEditPage({ shipId }: ShipEditPageProps) {
  const { croisieres: getCroisieresErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.cruises.detail');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab: TabValue = isTabValue(tabParam) ? tabParam : 'navire';

  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; ship: Ship; lineName: string }
  >({ status: 'loading' });

  useAdminEditPageMeta({
    ready: state.status === 'ready',
    title: t('shipTitle'),
    breadcrumbTail:
      state.status === 'ready'
        ? buildCruiseBreadcrumbTail({
            lineName: state.lineName,
            shipName: state.ship.name,
            shipId,
          })
        : undefined,
  });

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const client = getApiClient();
        const ship = await client.getShip(shipId);
        const line = await client.getCruiseLine(ship.cruiseLineId);
        if (!cancelled) {
          setState({ status: 'ready', ship, lineName: line.name });
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
  }, [shipId, getCroisieresErrorMessage]);

  const handleTabChange = useCallback(
    (tab: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (tab === 'navire') {
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
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
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
        <AdminPageBackLink href="/produits/croisieres/navires" label={t('backToShips')} />
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
        <Link
          href="/produits/croisieres/navires"
          className="text-sm font-medium text-primary hover:text-primary-hover"
        >
          {t('backToShips')}
        </Link>
      </div>
    );
  }

  const { ship, lineName } = state;

  return (
    <div className="space-y-6">
      <AdminPageBackLink href="/produits/croisieres/navires" label={t('backToShips')} />

      <div className="flex flex-col gap-4 rounded-xl border border-atg-border bg-atg-elevated p-4 sm:flex-row sm:items-start">
        <ShipThumbnail shipId={shipId} label={ship.name} size="md" />
        <div className="min-w-0 flex-1 space-y-2">
          <h2 className="text-xl font-semibold text-atg-fg">{ship.name}</h2>
          <div className="flex flex-wrap items-center gap-2">
            <DataTableBadge variant="muted">{lineName}</DataTableBadge>
            {ship.builtYear != null ? (
              <DataTableBadge variant="default">{ship.builtYear}</DataTableBadge>
            ) : null}
          </div>
          <p className="text-sm text-atg-muted">{t('shipSubtitle')}</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList aria-label={t('shipTabsAria')}>
          <TabsTrigger value="navire">{t('tabs.ship')}</TabsTrigger>
          <TabsTrigger value="photos">{t('tabs.photos')}</TabsTrigger>
          <TabsTrigger value="itineraires">{t('tabs.itineraries')}</TabsTrigger>
          <TabsTrigger value="cabines">{t('tabs.shipCabins')}</TabsTrigger>
        </TabsList>

        <TabsContent value="navire">
          <ShipForm mode="edit" shipId={shipId} initialShip={ship} />
        </TabsContent>

        <TabsContent value="photos">
          <ShipImagesSection shipId={shipId} embedded />
        </TabsContent>

        <TabsContent value="itineraires">
          <ItinerariesSection shipId={shipId} embedded />
        </TabsContent>

        <TabsContent value="cabines">
          <CabinsSection shipId={shipId} embedded />
        </TabsContent>
      </Tabs>
    </div>
  );
}

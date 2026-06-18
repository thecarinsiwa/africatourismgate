'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  Button,
  Card,
  DataTable,
  Skeleton,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { Destination, PointOfInterest } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminPageBackLink } from '../admin-page-back-link';
import { RichTextContent } from '../rich-text-content';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { getApiClient } from '../../lib/auth/api';
import { DestinationHeroBanner } from './destination-hero-banner';
import { DestinationRelatedStatCards } from './destination-related-stat-cards';
import { DestinationStaticMap } from './destination-static-map';

type DestinationViewPageProps = {
  destinationId: string;
};

function formatCoord(value: string | null, emptyDash: string): string {
  if (value === null || value === '') return emptyDash;
  const num = Number(value);
  return Number.isFinite(num) ? num.toFixed(5) : value;
}

export function DestinationViewPage({ destinationId }: DestinationViewPageProps) {
  const { destinations: getDestinationsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.destinations.detail');
  const tView = useTranslations('modules.destinations.view');
  const tCommon = useTranslations('modules.common');
  const emptyDash = tCommon('empty.dash');
  const [destination, setDestination] = useState<Destination | null>(null);
  const [pois, setPois] = useState<PointOfInterest[]>([]);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready' }
  >({ status: 'loading' });

  useAdminEditPageMeta({
    ready: state.status === 'ready' && destination != null,
    title: t('viewTitle'),
    entityLabel: destination?.name,
  });

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const client = getApiClient();
      const [loadedDestination, poisResult] = await Promise.all([
        client.getDestination(destinationId),
        client.listPointsOfInterest({ destinationId, page: 1, limit: 100 }),
      ]);
      setDestination(loadedDestination);
      setPois(poisResult.data);
      setState({ status: 'ready' });
    } catch (error) {
      setState({ status: 'error', message: getDestinationsErrorMessage(error) });
    }
  }, [destinationId, getDestinationsErrorMessage]);

  useEffect(() => {
    void load();
  }, [load]);

  const poiColumns = useMemo<ColumnDef<PointOfInterest, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: tCommon('columns.name'),
        cell: ({ row }) => (
          <span className="font-medium text-atg-fg">{row.original.name}</span>
        ),
      },
      {
        id: 'latitude',
        header: tCommon('form.latitude'),
        meta: { align: 'right', hideOnMobile: true },
        cell: ({ row }) => (
          <span className="font-mono text-xs tabular-nums text-atg-muted">
            {formatCoord(row.original.latitude, emptyDash)}
          </span>
        ),
      },
      {
        id: 'longitude',
        header: tCommon('form.longitude'),
        meta: { align: 'right', hideOnMobile: true },
        cell: ({ row }) => (
          <span className="font-mono text-xs tabular-nums text-atg-muted">
            {formatCoord(row.original.longitude, emptyDash)}
          </span>
        ),
      },
    ],
    [emptyDash, tCommon],
  );

  if (state.status === 'loading') {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-44 w-full rounded-xl" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <Skeleton className="h-64 w-full max-w-2xl" />
      </div>
    );
  }

  if (state.status === 'error' || !destination) {
    return (
      <div className="space-y-4">
        <AdminPageBackLink href="/produits/destinations" label={t('backLink')} />
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.status === 'error' ? state.message : t('notFound')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <AdminPageBackLink href="/produits/destinations" label={t('backLink')} />
        <Button href={`/produits/destinations/${destinationId}`}>{t('editButton')}</Button>
      </div>

      <DestinationHeroBanner
        name={destination.name}
        slug={destination.slug}
        countryCode={destination.countryCode}
        imageUrl={destination.imageUrl}
      />

      <DestinationRelatedStatCards destinationId={destinationId} />

      <Card variant="dashboard" className="max-w-3xl">
        <h3 className="text-sm font-semibold text-atg-fg">{t('description')}</h3>
        {destination.description?.trim() ? (
          <RichTextContent html={destination.description} className="mt-2" />
        ) : (
          <p className="mt-2 text-sm text-atg-muted">{t('noDescription')}</p>
        )}
      </Card>

      <DestinationStaticMap
        latitude={destination.latitude}
        longitude={destination.longitude}
        title={t('mapTitle')}
        className="max-w-2xl"
      />

      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-atg-fg">{tView('poisTitle')}</h3>
          <p className="mt-1 text-sm text-atg-muted">{tView('poisIntro', { count: pois.length })}</p>
        </div>
        <Card variant="dashboard" padding="none" className="overflow-hidden">
          <DataTable
            columns={poiColumns}
            data={pois}
            emptyMessage={tView('poisEmpty')}
            getRowId={(row) => row.id}
            aria-label={tView('poisAriaLabel')}
            loadingMessage={tCommon('dataTable.loading')}
            expandRowLabel={tCommon('dataTable.expandRow')}
            collapseRowLabel={tCommon('dataTable.collapseRow')}
            expandRowAriaLabel={tCommon('dataTable.expandRowAria')}
          />
        </Card>
      </section>
    </div>
  );
}

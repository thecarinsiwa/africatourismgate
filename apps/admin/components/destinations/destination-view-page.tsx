'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';
import { useFormatDateTime } from '../../lib/i18n/use-module-labels';

import {
  Button,
  Card,
  DataTable,
  DataTableBadge,
  Skeleton,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { Destination, PointOfInterest } from '@africatourismgate/types';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AdminPageBackLink } from '../admin-page-back-link';
import { CountryFlagPlaceholder } from '../flights/country-flag-placeholder';
import { RichTextContent } from '../rich-text-content';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { getApiClient } from '../../lib/auth/api';
import { hasValidDestinationCoords } from '../../lib/destination-coords';
import { getIsoCountryLabel } from '../../lib/iso-countries';
import { resolveMediaUrl } from '../../lib/resolve-media-url';
import { DestinationRelatedStatCards } from './destination-related-stat-cards';
import { DestinationStaticMap } from './destination-static-map';
import { DestinationThumbnail } from './destination-thumbnail';

type DestinationViewPageProps = {
  destinationId: string;
};

function ProfileField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-atg-muted">{label}</dt>
      <dd className="mt-0.5 break-words text-sm font-medium text-atg-fg">{value}</dd>
    </div>
  );
}

function formatCoord(value: string | null, emptyDash: string): string {
  if (value === null || value === '') return emptyDash;
  const num = Number(value);
  return Number.isFinite(num) ? num.toFixed(5) : value;
}

export function DestinationViewPage({ destinationId }: DestinationViewPageProps) {
  const { destinations: getDestinationsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.destinations.detail');
  const tView = useTranslations('modules.destinations.view');
  const tForm = useTranslations('modules.destinations.form');
  const tColumns = useTranslations('modules.destinations.columns');
  const tCommon = useTranslations('modules.common');
  const tCommonColumns = useTranslations('modules.common.columns');
  const tDates = useTranslations('modules.common.dates');
  const tActions = useTranslations('common.actions');
  const formatDateTime = useFormatDateTime('short');
  const locale = useLocale();
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
    title: tView('title'),
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
        header: tCommonColumns('name'),
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
    [emptyDash, tCommon, tCommonColumns],
  );

  const editHref = `/produits/destinations/${destinationId}`;

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
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full max-w-3xl" />
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

  const countryLabel = getIsoCountryLabel(destination.countryCode, locale);
  const heroUrl = destination.imageUrl?.trim() || null;
  const hasMap = hasValidDestinationCoords(destination.latitude, destination.longitude);
  const coordsLabel =
    hasMap
      ? `${formatCoord(destination.latitude, emptyDash)}, ${formatCoord(destination.longitude, emptyDash)}`
      : emptyDash;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <AdminPageBackLink href="/produits/destinations" label={t('backLink')} />
        <Button href={editHref} className="w-full sm:w-auto">
          {tView('editButton')}
        </Button>
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-atg-border bg-atg-elevated p-4 sm:flex-row sm:items-start">
        <DestinationThumbnail
          name={destination.name}
          countryCode={destination.countryCode}
          imageUrl={destination.imageUrl}
          size="md"
        />
        <div className="min-w-0 flex-1 space-y-2">
          <h2 className="text-xl font-semibold text-atg-fg">{destination.name}</h2>
          <div className="flex flex-wrap items-center gap-2">
            <DataTableBadge variant="muted" className="font-mono">
              {destination.slug}
            </DataTableBadge>
            <DataTableBadge variant="default">
              <span className="inline-flex items-center gap-1.5">
                <CountryFlagPlaceholder
                  countryCode={destination.countryCode}
                  className="h-4 w-4 rounded-sm text-[10px]"
                />
                {countryLabel}
              </span>
            </DataTableBadge>
            {destination.isFeatured ? (
              <DataTableBadge variant="success">{t('featuredBadge')}</DataTableBadge>
            ) : null}
          </div>
          <p className="text-sm text-atg-muted">{tView('subtitle')}</p>
        </div>
      </div>

      <DestinationRelatedStatCards destinationId={destinationId} />

      <Card variant="dashboard" padding="sm">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,18rem)] lg:items-start xl:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
          <div className="min-w-0 space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-atg-fg">{tView('infoTitle')}</h3>
              <dl className="mt-3 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
                <ProfileField label={tCommonColumns('slug')} value={destination.slug} />
                <ProfileField
                  label={tColumns('country')}
                  value={`${countryLabel} (${destination.countryCode})`}
                />
                <ProfileField
                  label={tForm('isFeatured')}
                  value={
                    destination.isFeatured ? t('featuredBadge') : tView('featuredNo')
                  }
                />
                <ProfileField label={tView('coordinates')} value={coordsLabel} />
                <ProfileField
                  label={tDates('createdAt')}
                  value={formatDateTime(destination.createdAt)}
                />
                <ProfileField
                  label={tDates('updatedAt')}
                  value={
                    destination.updatedAt
                      ? formatDateTime(destination.updatedAt)
                      : emptyDash
                  }
                />
              </dl>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-atg-fg">{t('description')}</h3>
              {destination.description?.trim() ? (
                <RichTextContent html={destination.description} className="mt-2" />
              ) : (
                <p className="mt-2 text-sm text-atg-muted">{t('noDescription')}</p>
              )}
            </div>
          </div>

          <div className="min-w-0 space-y-4 lg:border-l lg:border-atg-border lg:pl-6">
            <div>
              <h3 className="text-sm font-semibold text-atg-fg">{tView('heroTitle')}</h3>
              <p className="mt-0.5 text-xs text-atg-muted">{tView('heroIntro')}</p>
              <div className="mt-2 max-w-sm lg:max-w-none">
                {heroUrl ? (
                  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-atg-border">
                    <Image
                      src={resolveMediaUrl(heroUrl)}
                      alt={tView('heroAlt', { name: destination.name })}
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 20rem"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-[16/9] w-full items-center justify-center rounded-lg border border-dashed border-atg-border bg-atg-muted/5 px-4 text-center text-sm text-atg-muted">
                    {tView('heroEmpty')}
                  </div>
                )}
              </div>
            </div>

            {hasMap ? (
              <DestinationStaticMap
                latitude={destination.latitude}
                longitude={destination.longitude}
                title={t('mapTitle')}
                compact
              />
            ) : (
              <p className="text-sm text-atg-muted">{tView('mapEmpty')}</p>
            )}
          </div>
        </div>
      </Card>

      <section className="space-y-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-atg-fg">{tView('poisTitle')}</h3>
            <DataTableBadge variant="muted">{pois.length}</DataTableBadge>
          </div>
          <p className="mt-1 text-sm text-atg-muted">
            {tView('poisIntro', { count: pois.length })}
          </p>
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

      <div className="flex justify-end">
        <Button href={editHref} variant="outline">
          {tActions('edit')}
        </Button>
      </div>
    </div>
  );
}

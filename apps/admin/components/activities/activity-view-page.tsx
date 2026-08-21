'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';
import {
  useActivityDifficultyLabels,
  useFormatDateTime,
} from '../../lib/i18n/use-module-labels';

import {
  Button,
  Card,
  DataTable,
  DataTableBadge,
  Skeleton,
  type ColumnDef,
} from '@africatourismgate/ui';
import type {
  Activity,
  ActivityDescriptionAsset,
  ActivityImage,
  ActivityItineraryStop,
  ActivityProvider,
  ActivitySchedule,
} from '@africatourismgate/types';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminPageBackLink } from '../admin-page-back-link';
import { RichTextContent } from '../rich-text-content';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { getApiClient } from '../../lib/auth/api';
import { getActivityDifficultyLabel } from '../../lib/activity-difficulty';
import { formatMoney } from '../../lib/format-money';
import { formatDurationMinutes } from '../../lib/flight-datetime';
import { ActivityMetaBadges } from './activity-meta-badges';
import { ActivityItineraryStopsTimeline } from './activity-itinerary-stops-timeline';
import { ActivityPhotosCarousel } from './activity-photos-carousel';
import { ActivityThumbnail } from './activity-thumbnail';

type ActivityViewPageProps = {
  activityId: string;
};

function ProfileField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-atg-muted">{label}</dt>
      <dd className="mt-0.5 break-words text-sm font-medium text-atg-fg">{value}</dd>
    </div>
  );
}

export function ActivityViewPage({ activityId }: ActivityViewPageProps) {
  const { activities: getActivitiesErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.activities.detail');
  const tView = useTranslations('modules.activities.view');
  const tForm = useTranslations('modules.activities.form');
  const tSchedules = useTranslations('modules.activities.sections.schedules');
  const tItinerary = useTranslations('modules.activities.sections.itineraryStops');
  const tCommon = useTranslations('modules.common');
  const tColumns = useTranslations('modules.common.columns');
  const tDates = useTranslations('modules.common.dates');
  const tActions = useTranslations('common.actions');
  const difficultyLabels = useActivityDifficultyLabels();
  const formatDateTime = useFormatDateTime('short');
  const locale = useLocale();
  const emptyDash = tCommon('empty.dash');

  const [activity, setActivity] = useState<Activity | null>(null);
  const [provider, setProvider] = useState<ActivityProvider | null>(null);
  const [images, setImages] = useState<ActivityImage[]>([]);
  const [assets, setAssets] = useState<ActivityDescriptionAsset[]>([]);
  const [schedules, setSchedules] = useState<ActivitySchedule[]>([]);
  const [itineraryStops, setItineraryStops] = useState<ActivityItineraryStop[]>([]);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready' }
  >({ status: 'loading' });

  useAdminEditPageMeta({
    ready: state.status === 'ready' && activity != null,
    title: tView('title'),
    entityLabel: activity?.title,
  });

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const client = getApiClient();
      const activityData = await client.getActivity(activityId);
      const [imagesResult, assetsResult, schedulesResult, itineraryStopsResult, providerData] =
        await Promise.all([
          client.listActivityImages({ activityId, page: 1, limit: 100 }),
          client.listActivityDescriptionAssets({ activityId, page: 1, limit: 100 }),
          client.listActivitySchedules({ activityId, page: 1, limit: 100 }),
          client.listActivityItineraryStops({ activityId, page: 1, limit: 100 }),
          client.getActivityProvider(activityData.providerId).catch(() => null),
        ]);
      setActivity(activityData);
      setProvider(providerData);
      setImages([...imagesResult.data].sort((a, b) => a.sortOrder - b.sortOrder));
      setAssets([...assetsResult.data].sort((a, b) => a.sortOrder - b.sortOrder));
      setSchedules(schedulesResult.data);
      setItineraryStops(
        [...itineraryStopsResult.data].sort((a, b) => a.stopOrder - b.stopOrder),
      );
      setState({ status: 'ready' });
    } catch (error) {
      setState({ status: 'error', message: getActivitiesErrorMessage(error) });
    }
  }, [activityId, getActivitiesErrorMessage]);

  useEffect(() => {
    void load();
  }, [load]);

  const formatDatetime = useCallback(
    (iso: string) => {
      const d = new Date(iso);
      return Number.isNaN(d.getTime()) ? iso : d.toLocaleString(locale);
    },
    [locale],
  );

  const scheduleColumns = useMemo<ColumnDef<ActivitySchedule, unknown>[]>(
    () => [
      {
        id: 'start',
        header: tColumns('start'),
        cell: ({ row }) => formatDatetime(row.original.startDatetime),
      },
      {
        accessorKey: 'capacity',
        header: tSchedules('capacity'),
        meta: { align: 'center' },
      },
      {
        accessorKey: 'bookedCount',
        header: tColumns('reserved'),
        meta: { align: 'center' },
      },
    ],
    [formatDatetime, tColumns, tSchedules],
  );

  const formatCoord = useCallback(
    (value: string | null): string => {
      if (value === null || value === '') return emptyDash;
      const num = Number(value);
      return Number.isFinite(num) ? num.toFixed(5) : value;
    },
    [emptyDash],
  );

  const itineraryColumns = useMemo<ColumnDef<ActivityItineraryStop, unknown>[]>(
    () => [
      {
        accessorKey: 'stopOrder',
        header: tItinerary('order'),
        meta: { align: 'center' },
      },
      {
        accessorKey: 'name',
        header: tColumns('name'),
      },
      {
        id: 'latitude',
        header: tCommon('form.latitude'),
        cell: ({ row }) => formatCoord(row.original.latitude),
      },
      {
        id: 'longitude',
        header: tCommon('form.longitude'),
        cell: ({ row }) => formatCoord(row.original.longitude),
      },
      {
        id: 'durationMinutes',
        header: tColumns('duration'),
        cell: ({ row }) => {
          const value = row.original.durationMinutes;
          if (value == null || value <= 0) return emptyDash;
          return formatDurationMinutes(value);
        },
      },
    ],
    [emptyDash, formatCoord, tColumns, tCommon, tItinerary],
  );

  const editHref = `/produits/activites/${activityId}`;

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
        <Skeleton className="h-64 w-full max-w-3xl" />
      </div>
    );
  }

  if (state.status === 'error' || !activity) {
    return (
      <div className="space-y-4">
        <AdminPageBackLink href="/produits/activites" label={t('backLink')} />
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.status === 'error' ? state.message : tView('notFound')}
        </p>
      </div>
    );
  }

  const difficultyLabel = getActivityDifficultyLabel(
    activity.difficultyLevel,
    difficultyLabels,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <AdminPageBackLink href="/produits/activites" label={t('backLink')} />
        <Button href={editHref} className="w-full sm:w-auto">
          {tView('editButton')}
        </Button>
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-atg-border bg-atg-elevated p-4 sm:flex-row sm:items-start">
        <ActivityThumbnail activityId={activityId} label={activity.title} size="md" />
        <div className="min-w-0 flex-1 space-y-2">
          <h2 className="text-xl font-semibold text-atg-fg">{activity.title}</h2>
          <div className="flex flex-wrap items-center gap-2">
            {provider ? <DataTableBadge variant="muted">{provider.name}</DataTableBadge> : null}
            <DataTableBadge variant="default">
              {formatMoney(activity.priceCents, activity.currency)}
            </DataTableBadge>
            <ActivityMetaBadges
              durationMinutes={activity.durationMinutes}
              difficultyLevel={activity.difficultyLevel}
            />
          </div>
          <p className="text-sm text-atg-muted">{tView('subtitle')}</p>
        </div>
      </div>

      <Card variant="dashboard" padding="sm">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,18rem)] lg:items-start xl:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
          <div className="min-w-0 space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-atg-fg">{tView('infoTitle')}</h3>
              <dl className="mt-3 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
                <ProfileField
                  label={tForm('provider')}
                  value={provider?.name ?? emptyDash}
                />
                <ProfileField
                  label={tColumns('price')}
                  value={formatMoney(activity.priceCents, activity.currency)}
                />
                <ProfileField
                  label={tColumns('duration')}
                  value={
                    activity.durationMinutes != null
                      ? formatDurationMinutes(activity.durationMinutes)
                      : emptyDash
                  }
                />
                <ProfileField
                  label={tForm('difficulty')}
                  value={difficultyLabel ?? emptyDash}
                />
                <ProfileField
                  label={tDates('createdAt')}
                  value={formatDateTime(activity.createdAt)}
                />
                <ProfileField
                  label={tDates('updatedAt')}
                  value={
                    activity.updatedAt ? formatDateTime(activity.updatedAt) : emptyDash
                  }
                />
              </dl>
            </div>

            {activity.description ? (
              <div>
                <h3 className="text-sm font-semibold text-atg-fg">{t('description')}</h3>
                <RichTextContent html={activity.description} className="mt-2" />
              </div>
            ) : null}
          </div>

          <div className="min-w-0 lg:border-l lg:border-atg-border lg:pl-6">
            <h3 className="text-sm font-semibold text-atg-fg">{tView('imagesTitle')}</h3>
            <p className="mt-0.5 text-xs text-atg-muted">
              {tView('imagesIntro', { count: images.length })}
            </p>
            <div className="mt-2 max-w-sm lg:max-w-none">
              <ActivityPhotosCarousel images={images} altFallback={activity.title} />
            </div>
          </div>
        </div>
      </Card>

      {assets.length > 0 ? (
        <section className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-atg-fg">{t('descriptionAssets')}</h3>
            <DataTableBadge variant="muted">{assets.length}</DataTableBadge>
          </div>
          <p className="text-sm text-atg-muted">
            {t('descriptionAssetsIntro', { count: assets.length })}
          </p>
          <Card variant="dashboard" className="divide-y divide-atg-border" padding="none">
            {assets.map((asset) => (
              <a
                key={asset.id}
                href={asset.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-3 px-4 py-3 text-sm transition hover:bg-atg-muted/10"
              >
                <span className="min-w-0 truncate font-medium text-atg-fg">
                  {asset.name ?? asset.url}
                </span>
                <span className="shrink-0 text-xs uppercase text-atg-muted">
                  {asset.assetType}
                </span>
              </a>
            ))}
          </Card>
        </section>
      ) : null}

      <section className="space-y-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-atg-fg">{tItinerary('title')}</h3>
            <DataTableBadge variant="muted">{itineraryStops.length}</DataTableBadge>
          </div>
          <p className="mt-1 text-sm text-atg-muted">
            {t('itineraryStopsIntro', { count: itineraryStops.length })}
          </p>
        </div>
        {itineraryStops.length > 0 ? (
          <ActivityItineraryStopsTimeline stops={itineraryStops} />
        ) : null}
        <Card variant="dashboard" padding="none" className="overflow-hidden">
          <DataTable
            columns={itineraryColumns}
            data={itineraryStops}
            emptyMessage={tItinerary('empty')}
            getRowId={(row) => row.id}
          />
        </Card>
      </section>

      <section className="space-y-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-atg-fg">{tSchedules('title')}</h3>
            <DataTableBadge variant="muted">{schedules.length}</DataTableBadge>
          </div>
          <p className="mt-1 text-sm text-atg-muted">
            {t('schedulesIntro', { count: schedules.length })}
          </p>
        </div>
        <Card variant="dashboard" padding="none" className="overflow-hidden">
          <DataTable
            columns={scheduleColumns}
            data={schedules}
            emptyMessage={tSchedules('empty')}
            getRowId={(row) => row.id}
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

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
import type {
  Activity,
  ActivityDescriptionAsset,
  ActivityImage,
  ActivityProvider,
  ActivitySchedule,
} from '@africatourismgate/types';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminPageBackLink } from '../admin-page-back-link';
import { RichTextContent } from '../rich-text-content';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { getApiClient } from '../../lib/auth/api';
import { formatMoney } from '../../lib/format-money';
import { ActivityMetaBadges } from './activity-meta-badges';

type ActivityViewPageProps = {
  activityId: string;
};

export function ActivityViewPage({ activityId }: ActivityViewPageProps) {
  const { activities: getActivitiesErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.activities.detail');
  const tSchedules = useTranslations('modules.activities.sections.schedules');
  const tColumns = useTranslations('modules.common.columns');
  const locale = useLocale();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [provider, setProvider] = useState<ActivityProvider | null>(null);
  const [images, setImages] = useState<ActivityImage[]>([]);
  const [assets, setAssets] = useState<ActivityDescriptionAsset[]>([]);
  const [schedules, setSchedules] = useState<ActivitySchedule[]>([]);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready' }
  >({ status: 'loading' });

  useAdminEditPageMeta({
    ready: state.status === 'ready' && activity != null,
    title: t('viewTitle'),
    entityLabel: activity?.title,
  });

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const client = getApiClient();
      const activityData = await client.getActivity(activityId);
      const [imagesResult, assetsResult, schedulesResult, providerData] = await Promise.all([
        client.listActivityImages({ activityId, page: 1, limit: 100 }),
        client.listActivityDescriptionAssets({ activityId, page: 1, limit: 100 }),
        client.listActivitySchedules({ activityId, page: 1, limit: 100 }),
        client.getActivityProvider(activityData.providerId).catch(() => null),
      ]);
      setActivity(activityData);
      setProvider(providerData);
      setImages(imagesResult.data);
      setAssets(assetsResult.data);
      setSchedules(schedulesResult.data);
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

  if (state.status === 'loading') {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-40" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-64 w-full max-w-2xl" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (state.status === 'error' || !activity) {
    return (
      <div className="space-y-4">
        <AdminPageBackLink href="/produits/activites" label={t('backLink')} />
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.status === 'error' ? state.message : t('notFound')}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <AdminPageBackLink href="/produits/activites" label={t('backLink')} />

      <Card
        variant="dashboard"
        className="flex flex-col gap-4 border border-atg-border/80 bg-atg-elevated/70 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5"
      >
        <div className="space-y-2">
          <h2 className="text-xl font-semibold leading-tight text-atg-fg sm:text-2xl">
            {activity.title}
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <DataTableBadge variant="muted">
              {formatMoney(activity.priceCents, activity.currency)}
            </DataTableBadge>
            {provider ? <DataTableBadge variant="muted">{provider.name}</DataTableBadge> : null}
            <ActivityMetaBadges
              durationMinutes={activity.durationMinutes}
              difficultyLevel={activity.difficultyLevel}
            />
          </div>
        </div>
        <Button href={`/produits/activites/${activityId}`} className="w-full sm:w-auto">
          {t('editButton')}
        </Button>
      </Card>

      {activity.description ? (
        <Card variant="dashboard" className="border border-atg-border/80">
          <h3 className="text-base font-semibold text-atg-fg">{t('description')}</h3>
          <RichTextContent html={activity.description} className="mt-3" />
        </Card>
      ) : null}

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
                  alt={image.caption ?? activity.title}
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

      {assets.length > 0 ? (
        <section className="space-y-4 rounded-xl border border-atg-border/80 bg-atg-elevated/40 p-4 sm:p-5">
          <div>
            <h3 className="text-lg font-semibold text-atg-fg">{t('descriptionAssets')}</h3>
            <p className="mt-1 text-sm text-atg-muted">
              {t('descriptionAssetsIntro', { count: assets.length })}
            </p>
          </div>
          <Card variant="dashboard" className="divide-y divide-atg-border">
            {assets.map((asset) => (
              <a
                key={asset.id}
                href={asset.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-3 px-4 py-3 text-sm transition hover:bg-atg-muted/10"
              >
                <span className="font-medium text-atg-fg">{asset.name ?? asset.url}</span>
                <span className="text-xs uppercase text-atg-muted">{asset.assetType}</span>
              </a>
            ))}
          </Card>
        </section>
      ) : null}

      <section className="space-y-4 rounded-xl border border-atg-border/80 bg-atg-elevated/40 p-4 sm:p-5">
        <div>
          <h3 className="text-lg font-semibold text-atg-fg">{tSchedules('title')}</h3>
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
    </div>
  );
}

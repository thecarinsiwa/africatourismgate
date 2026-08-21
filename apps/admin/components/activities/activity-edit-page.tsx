'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import type { Activity } from '@africatourismgate/types';
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
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { AdminPageBackLink } from '../admin-page-back-link';
import { getApiClient } from '../../lib/auth/api';
import { formatMoney } from '../../lib/format-money';
import { ActivityForm } from './activity-form';
import { ActivityImagesSection } from './activity-images-section';
import { ActivityDescriptionAssetsSection } from './activity-description-assets-section';
import { ActivityMetaBadges } from './activity-meta-badges';
import { ActivitySchedulesSection } from './activity-schedules-section';
import { ActivityItineraryStopsSection } from './activity-itinerary-stops-section';
import { ActivityThumbnail } from './activity-thumbnail';

type ActivityEditPageProps = {
  activityId: string;
};

const TAB_VALUES = ['activite', 'photos', 'pieces', 'itineraire', 'creneaux'] as const;
type TabValue = (typeof TAB_VALUES)[number];

function isTabValue(value: string | null): value is TabValue {
  return value !== null && (TAB_VALUES as readonly string[]).includes(value);
}

export function ActivityEditPage({ activityId }: ActivityEditPageProps) {
  const { activities: getActivitiesErrorMessage } = useAdminErrorMessages();
  const tDetail = useTranslations('modules.activities.detail');
  const tCommon = useTranslations('modules.common');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab: TabValue = isTabValue(tabParam) ? tabParam : 'activite';

  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; activity: Activity; providerName: string | null }
  >({ status: 'loading' });

  useAdminEditPageMeta({
    ready: state.status === 'ready',
    title: tDetail('title'),
    entityLabel: state.status === 'ready' ? state.activity.title : undefined,
  });

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const client = getApiClient();
        const activity = await client.getActivity(activityId);
        let providerName: string | null = null;
        try {
          const provider = await client.getActivityProvider(activity.providerId);
          providerName = provider.name;
        } catch {
          providerName = null;
        }
        if (!cancelled) {
          setState({ status: 'ready', activity, providerName });
        }
      } catch (error) {
        if (!cancelled) {
          setState({ status: 'error', message: getActivitiesErrorMessage(error) });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activityId, getActivitiesErrorMessage]);

  const handleTabChange = useCallback(
    (tab: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (tab === 'activite') {
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
        <AdminPageBackLink href="/produits/activites" label={tDetail('backLink')} />
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
        <Link
          href="/produits/activites"
          className="text-sm font-medium text-primary hover:text-primary-hover"
        >
          {tCommon('back.toList')}
        </Link>
      </div>
    );
  }

  const { activity, providerName } = state;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <AdminPageBackLink href="/produits/activites" label={tDetail('backLink')} />
        <Button
          href={`/produits/activites/${activityId}/voir`}
          variant="outline"
          className="w-full sm:w-auto"
        >
          {tDetail('viewButton')}
        </Button>
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-atg-border bg-atg-elevated p-4 sm:flex-row sm:items-start">
        <ActivityThumbnail activityId={activityId} label={activity.title} size="md" />
        <div className="min-w-0 flex-1 space-y-2">
          <h2 className="text-xl font-semibold text-atg-fg">{activity.title}</h2>
          <div className="flex flex-wrap items-center gap-2">
            {providerName ? (
              <DataTableBadge variant="muted">{providerName}</DataTableBadge>
            ) : null}
            <DataTableBadge variant="default">
              {formatMoney(activity.priceCents, activity.currency)}
            </DataTableBadge>
            <ActivityMetaBadges
              durationMinutes={activity.durationMinutes}
              difficultyLevel={activity.difficultyLevel}
            />
          </div>
          <p className="text-sm text-atg-muted">{tDetail('subtitle')}</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList aria-label={tDetail('tabsAria')}>
          <TabsTrigger value="activite">{tDetail('tabs.activity')}</TabsTrigger>
          <TabsTrigger value="photos">{tDetail('tabs.photos')}</TabsTrigger>
          <TabsTrigger value="pieces">{tDetail('tabs.attachments')}</TabsTrigger>
          <TabsTrigger value="itineraire">{tDetail('tabs.itinerary')}</TabsTrigger>
          <TabsTrigger value="creneaux">{tDetail('tabs.schedules')}</TabsTrigger>
        </TabsList>

        <TabsContent value="activite">
          <ActivityForm
            mode="edit"
            activityId={activityId}
            initialActivity={activity}
            onUpdated={(updated) => {
              void (async () => {
                let nextProviderName = providerName;
                if (updated.providerId !== activity.providerId) {
                  try {
                    const provider = await getApiClient().getActivityProvider(
                      updated.providerId,
                    );
                    nextProviderName = provider.name;
                  } catch {
                    nextProviderName = null;
                  }
                }
                setState({
                  status: 'ready',
                  activity: updated,
                  providerName: nextProviderName,
                });
              })();
            }}
          />
        </TabsContent>

        <TabsContent value="photos">
          <ActivityImagesSection activityId={activityId} embedded />
        </TabsContent>

        <TabsContent value="pieces">
          <ActivityDescriptionAssetsSection activityId={activityId} embedded />
        </TabsContent>

        <TabsContent value="itineraire">
          <ActivityItineraryStopsSection
            activityId={activityId}
            activityDurationMinutes={activity.durationMinutes}
            embedded
          />
        </TabsContent>

        <TabsContent value="creneaux">
          <ActivitySchedulesSection activityId={activityId} embedded />
        </TabsContent>
      </Tabs>
    </div>
  );
}

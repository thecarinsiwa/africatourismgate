'use client';

import type { Activity } from '@africatourismgate/types';
import { Skeleton, Tabs, TabsContent, TabsList, TabsTrigger } from '@africatourismgate/ui';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { AdminPageBackLink } from '../admin-page-back-link';
import { getApiClient } from '../../lib/auth/api';
import { getActivitiesErrorMessage } from '../../lib/activities-errors';
import { ActivityForm } from './activity-form';
import { ActivityGallerySection } from './activity-gallery-section';
import { ActivityMetaBadges } from './activity-meta-badges';
import { ActivitySchedulesSection } from './activity-schedules-section';

type ActivityEditPageProps = {
  activityId: string;
};

const TAB_VALUES = ['activite', 'creneaux'] as const;
type TabValue = (typeof TAB_VALUES)[number];

function isTabValue(value: string | null): value is TabValue {
  return value !== null && (TAB_VALUES as readonly string[]).includes(value);
}

export function ActivityEditPage({ activityId }: ActivityEditPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab: TabValue = isTabValue(tabParam) ? tabParam : 'activite';

  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; activity: Activity }
  >({ status: 'loading' });

  useAdminEditPageMeta({
    ready: state.status === 'ready',
    title: "Modifier l'activité",
    entityLabel: state.status === 'ready' ? state.activity.title : undefined,
  });

  useEffect(() => {
    let cancelled = false;
    void getApiClient()
      .getActivity(activityId)
      .then((activity) => {
        if (!cancelled) setState({ status: 'ready', activity });
      })
      .catch((error) => {
        if (!cancelled) {
          setState({ status: 'error', message: getActivitiesErrorMessage(error) });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [activityId]);

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
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-64 w-full max-w-2xl" />
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="space-y-4">
        <p role="alert" className="text-sm text-red-600">
          {state.message}
        </p>
        <Link href="/produits/activites" className="text-sm font-medium text-primary">
          ← Retour à la liste
        </Link>
      </div>
    );
  }

  const { activity } = state;

  return (
    <div className="space-y-6">
      <AdminPageBackLink href="/produits/activites" label="Retour aux activités" />

      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-atg-fg">{activity.title}</h2>
        <ActivityMetaBadges
          durationMinutes={activity.durationMinutes}
          difficultyLevel={activity.difficultyLevel}
        />
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList aria-label="Sections de l'activité">
          <TabsTrigger value="activite">Activité</TabsTrigger>
          <TabsTrigger value="creneaux">Créneaux</TabsTrigger>
        </TabsList>

        <TabsContent value="activite">
          <ActivityForm
            mode="edit"
            activityId={activityId}
            initialActivity={activity}
            onUpdated={(updated) => setState({ status: 'ready', activity: updated })}
          />
          <ActivityGallerySection embedded />
        </TabsContent>

        <TabsContent value="creneaux">
          <ActivitySchedulesSection activityId={activityId} embedded />
        </TabsContent>
      </Tabs>
    </div>
  );
}

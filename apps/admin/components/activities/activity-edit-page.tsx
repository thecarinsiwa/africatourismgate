'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import type { Activity } from '@africatourismgate/types';
import { Skeleton, Tabs, TabsContent, TabsList, TabsTrigger } from '@africatourismgate/ui';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { AdminPageBackLink } from '../admin-page-back-link';
import { getApiClient } from '../../lib/auth/api';
import { ActivityForm } from './activity-form';
import { ActivityImagesSection } from './activity-images-section';
import { ActivityDescriptionAssetsSection } from './activity-description-assets-section';
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
  const { activities: getActivitiesErrorMessage } = useAdminErrorMessages();
  const tDetail = useTranslations('modules.activities.detail');
  const tCommon = useTranslations('modules.common');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab: TabValue = isTabValue(tabParam) ? tabParam : 'activite';
  const stepItems: Array<{ value: TabValue; label: string }> = [
    { value: 'activite', label: tDetail('tabs.activity') },
    { value: 'creneaux', label: tDetail('tabs.schedules') },
  ];
  const activeStepIndex = Math.max(
    0,
    stepItems.findIndex((step) => step.value === activeTab),
  );
  const progressPercent = Math.round(((activeStepIndex + 1) / stepItems.length) * 100);

  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; activity: Activity }
  >({ status: 'loading' });

  useAdminEditPageMeta({
    ready: state.status === 'ready',
    title: tDetail('title'),
    entityLabel: state.status === 'ready' ? state.activity.title : undefined,
  });

  const loadActivity = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const activity = await getApiClient().getActivity(activityId);
      setState({ status: 'ready', activity });
    } catch (error) {
      setState({ status: 'error', message: getActivitiesErrorMessage(error) });
    }
  }, [activityId, getActivitiesErrorMessage]);

  useEffect(() => {
    void loadActivity();
  }, [loadActivity]);

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
        <div className="space-y-2">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-6 w-48" />
        </div>
        <Skeleton className="h-10 w-full max-w-xs" />
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

  const { activity } = state;

  return (
    <div className="space-y-6">
      <AdminPageBackLink href="/produits/activites" label={tDetail('backLink')} />

      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-atg-fg">{activity.title}</h2>
        <ActivityMetaBadges
          durationMinutes={activity.durationMinutes}
          difficultyLevel={activity.difficultyLevel}
        />
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <div className="rounded-xl border border-atg-border bg-atg-elevated p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-atg-fg">{tDetail('tabsAria')}</p>
            <p className="text-xs font-medium text-atg-muted">
              {activeStepIndex + 1}/{stepItems.length} · {progressPercent}%
            </p>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-atg-border/70">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
              aria-hidden
            />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {stepItems.map((step, index) => {
              const isActive = step.value === activeTab;
              const isDone = index < activeStepIndex;
              return (
                <button
                  key={step.value}
                  type="button"
                  onClick={() => handleTabChange(step.value)}
                  className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-xs transition ${
                    isActive
                      ? 'border-primary bg-primary/10 text-primary'
                      : isDone
                        ? 'border-emerald-500/40 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300'
                        : 'border-atg-border text-atg-muted hover:border-primary/40 hover:text-atg-fg'
                  }`}
                >
                  <span
                    className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                      isActive ? 'bg-primary/20' : isDone ? 'bg-emerald-500/20' : 'bg-atg-surface/70'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className="truncate">{step.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <TabsList
          aria-label={tDetail('tabsAria')}
          className="rounded-xl border border-atg-border bg-atg-elevated px-1.5 py-1"
        >
          <TabsTrigger value="activite" className="rounded-lg">
            {tDetail('tabs.activity')}
          </TabsTrigger>
          <TabsTrigger value="creneaux" className="rounded-lg">
            {tDetail('tabs.schedules')}
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="activite"
          className="rounded-xl border border-atg-border bg-atg-elevated/60 p-4 sm:p-6"
        >
          <div className="space-y-6">
            <ActivityForm
              mode="edit"
              activityId={activityId}
              initialActivity={activity}
              onUpdated={(updated) => setState({ status: 'ready', activity: updated })}
            />
            <ActivityImagesSection activityId={activityId} embedded />
            <ActivityDescriptionAssetsSection activityId={activityId} />
          </div>
        </TabsContent>

        <TabsContent
          value="creneaux"
          className="rounded-xl border border-atg-border bg-atg-elevated/60 p-4 sm:p-6"
        >
          <ActivitySchedulesSection activityId={activityId} embedded />
        </TabsContent>
      </Tabs>
    </div>
  );
}

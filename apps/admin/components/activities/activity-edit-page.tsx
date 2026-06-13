'use client';

import type { Activity } from '@africatourismgate/types';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { getApiClient } from '../../lib/auth/api';
import { getActivitiesErrorMessage } from '../../lib/activities-errors';
import { ActivityForm } from './activity-form';
import { ActivitySchedulesSection } from './activity-schedules-section';

type ActivityEditPageProps = {
  activityId: string;
};

export function ActivityEditPage({ activityId }: ActivityEditPageProps) {
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

  if (state.status === 'loading') {
    return <p className="text-sm text-atg-muted">Chargement…</p>;
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
    <div>
      <ActivityForm mode="edit" activityId={activityId} initialActivity={activity} />
      <ActivitySchedulesSection activityId={activityId} />
    </div>
  );
}

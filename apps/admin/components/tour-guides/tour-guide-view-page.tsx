'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  Button,
  Card,
  DataTableBadge,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@africatourismgate/ui';
import type { Destination, Organization, TourGuide, TourGuideStatus } from '@africatourismgate/types';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminPageBackLink } from '../admin-page-back-link';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { getApiClient } from '../../lib/auth/api';
import {
  useFormatDateTime,
  useTourGuideStatusLabels,
  useTourGuideTypeLabels,
} from '../../lib/i18n/use-module-labels';
import { GuideAssignedBookingsSection } from './guide-assigned-bookings-section';
import { GuidePersonalCalendar } from './guide-personal-calendar';
import { TourGuideAvatar } from './tour-guide-avatar';

type TourGuideViewPageProps = {
  guideId: string;
};

const STATUS_VARIANTS: Record<TourGuideStatus, 'success' | 'muted'> = {
  active: 'success',
  inactive: 'muted',
};

function ProfileField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid gap-1 py-3.5 first:pt-0 last:pb-0 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-4">
      <dt className="text-xs font-medium uppercase tracking-wide text-atg-muted sm:pt-0.5">
        {label}
      </dt>
      <dd className="min-w-0 break-words text-sm font-medium text-atg-fg">{value}</dd>
    </div>
  );
}

export function TourGuideViewPage({ guideId }: TourGuideViewPageProps) {
  const { tourGuides: getTourGuidesErrorMessage } = useAdminErrorMessages();
  const tDetail = useTranslations('modules.tourGuides.detail');
  const tView = useTranslations('modules.tourGuides.view');
  const tSections = useTranslations('modules.tourGuides.sections.bookings');
  const tForm = useTranslations('modules.tourGuides.form');
  const tCommon = useTranslations('modules.common');
  const tDates = useTranslations('modules.common.dates');
  const statusLabels = useTourGuideStatusLabels();
  const guideTypeLabels = useTourGuideTypeLabels();
  const formatDateTime = useFormatDateTime('short');
  const emptyDash = tCommon('empty.dash');

  const [guide, setGuide] = useState<TourGuide | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [canWrite, setCanWrite] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready' }
  >({ status: 'loading' });

  useAdminEditPageMeta({
    ready: state.status === 'ready' && guide != null,
    title: tView('title'),
    entityLabel: guide?.displayName,
  });

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const me = await getApiClient().getAuthMe();
        if (!cancelled) {
          setCanWrite(me.isSuperAdmin || me.permissions.includes('guides.write'));
        }
      } catch {
        if (!cancelled) setCanWrite(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const client = getApiClient();
      const guideData = await client.getTourGuide(guideId);
      const [destinationRows, organizationData] = await Promise.all([
        guideData.destinations.length > 0
          ? Promise.all(
              guideData.destinations.map((id) =>
                client.getDestination(id).catch(() => null),
              ),
            )
          : Promise.resolve([]),
        guideData.organizationId
          ? client.getOrganization(guideData.organizationId).catch(() => null)
          : Promise.resolve(null),
      ]);

      setGuide(guideData);
      setOrganization(organizationData);
      setDestinations(
        destinationRows.filter((destination): destination is Destination => destination != null),
      );
      setState({ status: 'ready' });
    } catch (error) {
      setState({ status: 'error', message: getTourGuidesErrorMessage(error) });
    }
  }, [getTourGuidesErrorMessage, guideId]);

  useEffect(() => {
    void load();
  }, [load]);

  const destinationById = useMemo(
    () => new Map(destinations.map((destination) => [destination.id, destination])),
    [destinations],
  );

  const contactEmail = useMemo(() => {
    if (!guide) return emptyDash;
    if (guide.user?.email) return guide.user.email;
    if (guide.contactEmail) return guide.contactEmail;
    return emptyDash;
  }, [emptyDash, guide]);

  const linkedUserLabel = useMemo(() => {
    if (!guide?.user) return null;
    const name = [guide.user.firstName, guide.user.lastName].filter(Boolean).join(' ').trim();
    return name || guide.user.email;
  }, [guide]);

  const editHref = `/guides/${guideId}`;

  if (state.status === 'loading') {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-40" />
        <div className="flex items-center gap-4 rounded-xl border border-atg-border bg-atg-elevated p-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-64 w-full max-w-3xl" />
      </div>
    );
  }

  if (state.status === 'error' || !guide) {
    return (
      <div className="space-y-4">
        <AdminPageBackLink href="/guides" label={tDetail('backLink')} />
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.status === 'error' ? state.message : tView('notFound')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <AdminPageBackLink href="/guides" label={tDetail('backLink')} />
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button href="/guides/calendrier" variant="outline" className="w-full sm:w-auto">
            {tView('openFullCalendar')}
          </Button>
          <Button href={editHref} className="w-full sm:w-auto">
            {tView('editButton')}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-atg-border bg-atg-elevated p-4 sm:flex-row sm:items-start">
        <TourGuideAvatar guide={guide} size="lg" />
        <div className="min-w-0 flex-1 space-y-2">
          <h2 className="text-xl font-semibold text-atg-fg">{guide.displayName}</h2>
          <div className="flex flex-wrap items-center gap-2">
            <DataTableBadge variant="muted">{guideTypeLabels[guide.type]}</DataTableBadge>
            <DataTableBadge variant={STATUS_VARIANTS[guide.status]}>
              {statusLabels[guide.status]}
            </DataTableBadge>
          </div>
          <p className="text-sm text-atg-muted">{tView('subtitle')}</p>
          {guide.status === 'inactive' ? (
            <p className="text-xs text-amber-700 dark:text-amber-300">{tView('inactiveHint')}</p>
          ) : null}
        </div>
      </div>

      <Card variant="dashboard" padding="sm">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList aria-label={tView('tabsAria')}>
            <TabsTrigger value="profile">{tView('tabs.profile')}</TabsTrigger>
            <TabsTrigger value="schedule">{tView('tabs.schedule')}</TabsTrigger>
            <TabsTrigger value="missions">{tView('tabs.missions')}</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-4 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-atg-fg">{tView('infoTitle')}</h3>
              <dl className="mt-1 divide-y divide-atg-border/60">
                <ProfileField label={tForm('type')} value={guideTypeLabels[guide.type]} />
                <ProfileField label={tView('contactEmail')} value={contactEmail} />
                {linkedUserLabel && guide.user ? (
                  <ProfileField
                    label={tView('linkedUser')}
                    value={
                      <Link
                        href={`/utilisateurs/${guide.user.id}/voir`}
                        className="text-primary hover:underline"
                      >
                        {linkedUserLabel}
                      </Link>
                    }
                  />
                ) : null}
                <ProfileField
                  label={tForm('organizationId')}
                  value={organization?.name ?? emptyDash}
                />
                <ProfileField
                  label={tForm('languages')}
                  value={guide.languages.length > 0 ? guide.languages.join(', ') : emptyDash}
                />
                <ProfileField label={tDates('createdAt')} value={formatDateTime(guide.createdAt)} />
                <ProfileField
                  label={tDates('updatedAt')}
                  value={guide.updatedAt ? formatDateTime(guide.updatedAt) : emptyDash}
                />
              </dl>
            </div>

            {guide.bio ? (
              <div>
                <h3 className="text-sm font-semibold text-atg-fg">{tForm('bio')}</h3>
                <p className="mt-2 whitespace-pre-wrap text-sm text-atg-fg">{guide.bio}</p>
              </div>
            ) : null}

            <div>
              <h3 className="text-sm font-semibold text-atg-fg">{tForm('destinations')}</h3>
              {guide.destinations.length > 0 ? (
                <ul className="mt-2 flex flex-wrap gap-2">
                  {guide.destinations.map((destinationId) => {
                    const destination = destinationById.get(destinationId);
                    const label = destination?.name ?? destinationId.slice(0, 8);
                    return (
                      <li key={destinationId}>
                        {destination ? (
                          <Link href={`/produits/destinations/${destinationId}/voir`}>
                            <DataTableBadge variant="muted" className="hover:bg-atg-surface">
                              {label}
                            </DataTableBadge>
                          </Link>
                        ) : (
                          <DataTableBadge variant="muted">{label}</DataTableBadge>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-atg-muted">{tForm('destinationsEmpty')}</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="schedule" className="mt-4">
            <GuidePersonalCalendar guideId={guideId} canWrite={canWrite} />
          </TabsContent>

          <TabsContent value="missions" className="mt-4">
            <p className="mb-4 text-xs text-atg-muted">{tSections('intro')}</p>
            <GuideAssignedBookingsSection guideId={guideId} embedded />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}

'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import type { TourGuide, TourGuideStatus } from '@africatourismgate/types';
import {
  Button,
  DataTableBadge,
  Skeleton,
  Tabs,
  TabsList,
  TabsTrigger,
} from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminPageBackLink } from '../admin-page-back-link';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { getApiClient } from '../../lib/auth/api';
import {
  useTourGuideStatusLabels,
  useTourGuideTypeLabels,
} from '../../lib/i18n/use-module-labels';
import { GuideAssignedBookingsSection } from './guide-assigned-bookings-section';
import { TourGuideAvatar } from './tour-guide-avatar';
import { TourGuideForm } from './tour-guide-form';

type TourGuideEditPageProps = {
  guideId: string;
};

const TAB_VALUES = ['profil', 'couverture', 'missions'] as const;
type TabValue = (typeof TAB_VALUES)[number];

const STATUS_VARIANTS: Record<TourGuideStatus, 'success' | 'muted'> = {
  active: 'success',
  inactive: 'muted',
};

function isTabValue(value: string | null): value is TabValue {
  return value !== null && (TAB_VALUES as readonly string[]).includes(value);
}

function guideContactLine(guide: TourGuide): string | null {
  if (guide.user?.email) return guide.user.email;
  if (guide.contactEmail) return guide.contactEmail;
  return null;
}

export function TourGuideEditPage({ guideId }: TourGuideEditPageProps) {
  const { tourGuides: getTourGuidesErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.tourGuides.detail');
  const guideTypeLabels = useTourGuideTypeLabels();
  const statusLabels = useTourGuideStatusLabels();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab: TabValue = isTabValue(tabParam) ? tabParam : 'profil';

  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; guide: TourGuide }
  >({ status: 'loading' });

  useAdminEditPageMeta({
    ready: state.status === 'ready',
    title: t('title'),
    entityLabel: state.status === 'ready' ? state.guide.displayName : undefined,
  });

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const guide = await getApiClient().getTourGuide(guideId);
      setState({ status: 'ready', guide });
    } catch (error) {
      setState({ status: 'error', message: getTourGuidesErrorMessage(error) });
    }
  }, [guideId, getTourGuidesErrorMessage]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleTabChange = useCallback(
    (tab: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (tab === 'profil') {
        params.delete('tab');
      } else {
        params.set('tab', tab);
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const headerMeta = useMemo(() => {
    if (state.status !== 'ready') return null;
    const guide = state.guide;
    const contact = guideContactLine(guide);
    const languages =
      guide.languages.length > 0 ? guide.languages.join(', ').toUpperCase() : null;
    return [contact, languages].filter(Boolean).join(' · ');
  }, [state]);

  if (state.status === 'loading') {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-40" />
        <div className="flex items-center gap-4 rounded-xl border border-atg-border bg-atg-elevated p-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="space-y-4">
        <AdminPageBackLink href="/guides" label={t('backLink')} />
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
      </div>
    );
  }

  const { guide } = state;
  const viewHref = `/guides/${guideId}/voir`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <AdminPageBackLink href="/guides" label={t('backLink')} />
        <Button href={viewHref} variant="outline" className="w-full sm:w-auto">
          {t('viewButton')}
        </Button>
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-atg-border bg-atg-elevated p-4 sm:flex-row sm:items-center">
        <TourGuideAvatar guide={guide} size="lg" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h2 className="text-xl font-semibold text-atg-fg">{guide.displayName}</h2>
            <div className="flex flex-wrap items-center gap-2">
              <DataTableBadge variant="muted">{guideTypeLabels[guide.type]}</DataTableBadge>
              <DataTableBadge variant={STATUS_VARIANTS[guide.status]}>
                {statusLabels[guide.status]}
              </DataTableBadge>
            </div>
          </div>
          {headerMeta ? <p className="text-sm text-atg-muted">{headerMeta}</p> : null}
          <p className="text-xs text-atg-muted">{t('subtitle')}</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList aria-label={t('tabsAria')}>
          <TabsTrigger value="profil">{t('tabs.profile')}</TabsTrigger>
          <TabsTrigger value="couverture">{t('tabs.coverage')}</TabsTrigger>
          <TabsTrigger value="missions">{t('tabs.missions')}</TabsTrigger>
        </TabsList>
      </Tabs>

      {activeTab === 'missions' ? (
        <GuideAssignedBookingsSection guideId={guideId} />
      ) : (
        <TourGuideForm
          mode="edit"
          layout="wide"
          activeSection={activeTab === 'profil' ? 'identity' : 'coverage'}
          guideId={guideId}
          initialGuide={guide}
          onUpdated={(updatedGuide) => setState({ status: 'ready', guide: updatedGuide })}
        />
      )}
    </div>
  );
}

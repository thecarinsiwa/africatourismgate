'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import type { Destination } from '@africatourismgate/types';
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
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { AdminPageBackLink } from '../admin-page-back-link';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { getApiClient } from '../../lib/auth/api';
import { DestinationForm } from './destination-form';
import { DestinationPoisSection } from './destination-pois-section';
import { DestinationRelatedStatCards } from './destination-related-stat-cards';
import { DestinationThumbnail } from './destination-thumbnail';

type DestinationEditPageProps = {
  destinationId: string;
};

const TAB_VALUES = ['informations', 'pois'] as const;
type TabValue = (typeof TAB_VALUES)[number];

function isTabValue(value: string | null): value is TabValue {
  return value !== null && (TAB_VALUES as readonly string[]).includes(value);
}

export function DestinationEditPage({ destinationId }: DestinationEditPageProps) {
  const { destinations: getDestinationsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.destinations.detail');
  const tForm = useTranslations('modules.destinations.form');
  const tCommon = useTranslations('modules.common');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab: TabValue = isTabValue(tabParam) ? tabParam : 'informations';

  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; destination: Destination }
  >({ status: 'loading' });

  useAdminEditPageMeta({
    ready: state.status === 'ready',
    title: t('title'),
    entityLabel: state.status === 'ready' ? state.destination.name : undefined,
  });

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const destination = await getApiClient().getDestination(destinationId);
        if (!cancelled) {
          setState({ status: 'ready', destination });
        }
      } catch (error) {
        if (!cancelled) {
          setState({ status: 'error', message: getDestinationsErrorMessage(error) });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [destinationId, getDestinationsErrorMessage]);

  const handleTabChange = useCallback(
    (tab: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (tab === 'informations') {
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
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="space-y-4">
        <AdminPageBackLink href="/produits/destinations" label={t('backLink')} />
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
        <Link
          href="/produits/destinations"
          className="text-sm font-medium text-primary hover:text-primary-hover"
        >
          {tCommon('back.toList')}
        </Link>
      </div>
    );
  }

  const { destination } = state;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <AdminPageBackLink href="/produits/destinations" label={t('backLink')} />
        <Button
          href={`/produits/destinations/${destinationId}/voir`}
          variant="outline"
          className="w-full sm:w-auto"
        >
          {t('viewButton')}
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
            <DataTableBadge variant="default">{destination.countryCode}</DataTableBadge>
            {destination.isFeatured ? (
              <DataTableBadge variant="success">{tForm('isFeatured')}</DataTableBadge>
            ) : null}
          </div>
          <p className="text-sm text-atg-muted">{t('subtitle')}</p>
        </div>
      </div>

      <DestinationRelatedStatCards destinationId={destinationId} />

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList aria-label={t('tabsAria')}>
          <TabsTrigger value="informations">{t('tabs.informations')}</TabsTrigger>
          <TabsTrigger value="pois">{t('tabs.pois')}</TabsTrigger>
        </TabsList>

        <TabsContent value="informations">
          <DestinationForm
            mode="edit"
            destinationId={destinationId}
            initialDestination={destination}
            onUpdated={(updated) => setState({ status: 'ready', destination: updated })}
          />
        </TabsContent>

        <TabsContent value="pois">
          <DestinationPoisSection destinationId={destinationId} embedded />
        </TabsContent>
      </Tabs>
    </div>
  );
}

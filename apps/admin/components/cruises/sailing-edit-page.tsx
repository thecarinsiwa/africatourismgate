'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import type { CruiseSailing, Itinerary, Ship } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { AdminPageBackLink } from '../admin-page-back-link';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { getApiClient } from '../../lib/auth/api';
import { buildCruiseBreadcrumbTail } from '../../lib/cruise-breadcrumbs';
import { CabinAvailabilitySection } from './cabin-availability-section';
import { SailingForm } from './sailing-form';

type SailingEditPageProps = { sailingId: string };

export function SailingEditPage({ sailingId }: SailingEditPageProps) {
  const { croisieres: getCroisieresErrorMessage } = useAdminErrorMessages();
  const tDetail = useTranslations('modules.cruises.detail');
  const tColumns = useTranslations('modules.cruises.columns');
  const tCommon = useTranslations('modules.common');
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | {
        status: 'ready';
        sailing: CruiseSailing;
        itinerary: Itinerary;
        ship: Ship;
        lineName: string;
      }
  >({ status: 'loading' });

  useAdminEditPageMeta({
    ready: state.status === 'ready',
    title: tDetail('sailingTitle'),
    breadcrumbTail:
      state.status === 'ready'
        ? buildCruiseBreadcrumbTail({
            lineName: state.lineName,
            shipName: state.ship.name,
            shipId: state.ship.id,
            itineraryName: state.itinerary.name,
            itineraryId: state.itinerary.id,
            departureLabel: state.sailing.departureDate.slice(0, 10),
          })
        : undefined,
  });

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const client = getApiClient();
        const sailing = await client.getCruiseSailing(sailingId);
        const itinerary = await client.getItinerary(sailing.itineraryId);
        const ship = await client.getShip(itinerary.shipId);
        const line = await client.getCruiseLine(ship.cruiseLineId);
        if (!cancelled) {
          setState({ status: 'ready', sailing, itinerary, ship, lineName: line.name });
        }
      } catch (error) {
        if (!cancelled) {
          setState({ status: 'error', message: getCroisieresErrorMessage(error) });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sailingId, getCroisieresErrorMessage]);

  if (state.status === 'loading') {
    return <p className="text-sm text-atg-muted">{tCommon('loading')}</p>;
  }

  if (state.status === 'error') {
    return (
      <div className="space-y-4">
        <AdminPageBackLink
          href="/produits/croisieres"
          label={tDetail('backToSailings')}
        />
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
      </div>
    );
  }

  const { sailing, itinerary, ship } = state;
  const departureLabel = sailing.departureDate.slice(0, 10);

  return (
    <div className="space-y-6">
      <AdminPageBackLink
        href="/produits/croisieres"
        label={tDetail('backToSailings')}
      />
      <p className="text-sm text-atg-muted">
        {departureLabel} · {itinerary.name} · {ship.name} ({itinerary.durationNights}{' '}
        {tColumns('nights')})
      </p>
      <SailingForm mode="edit" sailingId={sailingId} initialSailing={sailing} />
      <CabinAvailabilitySection
        sailingId={sailingId}
        shipId={itinerary.shipId}
        itineraryId={itinerary.id}
      />
    </div>
  );
}

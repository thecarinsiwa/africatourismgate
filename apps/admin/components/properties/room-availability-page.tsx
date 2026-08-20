'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { AdminPageBackLink } from '../admin-page-back-link';
import { getApiClient } from '../../lib/auth/api';
import { currentYearMonth } from '../../lib/availability-dates';
import { RoomAvailabilityBulkForm } from './room-availability-bulk-form';
import { RoomAvailabilityGrid } from './room-availability-grid';

type RoomAvailabilityPageProps = {
  propertyId: string;
  roomId: string;
};

export function RoomAvailabilityPage({ propertyId, roomId }: RoomAvailabilityPageProps) {
  const { hebergements: getHebergementsErrorMessage } = useAdminErrorMessages();
  const tPage = useTranslations('pages.hebergements.id.chambres.roomId.disponibilites');
  const tAvailability = useTranslations('modules.properties.sections.availability');
  const tDetail = useTranslations('modules.properties.detail');
  const tCommon = useTranslations('modules.common');
  const [yearMonth, setYearMonth] = useState(currentYearMonth);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | {
        status: 'ready';
        propertyName: string;
        roomName: string;
        currency: string;
        basePriceCents: number;
      }
  >({ status: 'loading' });
  const [gridKey, setGridKey] = useState(0);

  const backLabel = useMemo(() => {
    if (tPage.has?.('backLabel')) return tPage('backLabel');
    if (tAvailability.has?.('backToProperty')) return tAvailability('backToProperty');
    return tDetail('backLink');
  }, [tPage, tAvailability, tDetail]);

  const pageTitle = tPage.has?.('title') ? tPage('title') : tAvailability('title');

  const breadcrumbTail = useMemo(() => {
    if (state.status !== 'ready') return undefined;
    return [
      { label: state.propertyName, href: `/hebergements/${propertyId}` },
      { label: state.roomName },
    ];
  }, [state, propertyId]);

  useAdminEditPageMeta({
    ready: state.status === 'ready',
    title: pageTitle,
    breadcrumbTail,
  });

  const handleBulkApplied = useCallback(() => {
    setGridKey((k) => k + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setState({ status: 'loading' });
      try {
        const client = getApiClient();
        const [property, room] = await Promise.all([
          client.getProperty(propertyId),
          client.getRoom(roomId),
        ]);
        if (room.propertyId !== propertyId) {
          if (!cancelled) {
            setState({
              status: 'error',
              message: tAvailability('roomMismatch'),
            });
          }
          return;
        }
        if (!cancelled) {
          setState({
            status: 'ready',
            propertyName: property.name,
            roomName: room.name,
            currency: room.currency,
            basePriceCents: room.basePriceCents,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setState({ status: 'error', message: getHebergementsErrorMessage(error) });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [propertyId, roomId, getHebergementsErrorMessage, tAvailability]);

  const propertyBackHref = `/hebergements/${propertyId}?tab=chambres`;

  if (state.status === 'loading') {
    return <p className="text-sm text-atg-muted">{tCommon('loading')}</p>;
  }

  if (state.status === 'error') {
    return (
      <div className="space-y-4">
        <AdminPageBackLink href={propertyBackHref} label={backLabel} />
        <p role="alert" className="text-sm text-red-600">
          {state.message}
        </p>
      </div>
    );
  }

  const { roomName, currency, basePriceCents } = state;

  return (
    <div className="min-w-0 space-y-6">
      <AdminPageBackLink href={propertyBackHref} label={backLabel} />
      <p className="text-sm text-atg-muted">
        {tAvailability.has?.('summary')
          ? tAvailability('summary', { roomName, currency })
          : `${tAvailability('room')} ${roomName} — ${tAvailability('stockHint', { currency })}`}
      </p>

      <div className="space-y-10">
        <RoomAvailabilityBulkForm
          roomId={roomId}
          yearMonth={yearMonth}
          defaultPriceCents={basePriceCents}
          onApplied={handleBulkApplied}
        />
        <RoomAvailabilityGrid
          key={gridKey}
          roomId={roomId}
          currency={currency}
          defaultPriceCents={basePriceCents}
          yearMonth={yearMonth}
          onYearMonthChange={setYearMonth}
        />
      </div>
    </div>
  );
}

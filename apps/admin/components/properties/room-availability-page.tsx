'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { getApiClient } from '../../lib/auth/api';
import { currentYearMonth } from '../../lib/availability-dates';
import { getHebergementsErrorMessage } from '../../lib/hebergements-errors';
import { RoomAvailabilityBulkForm } from './room-availability-bulk-form';
import { RoomAvailabilityGrid } from './room-availability-grid';

type RoomAvailabilityPageProps = {
  propertyId: string;
  roomId: string;
};

export function RoomAvailabilityPage({ propertyId, roomId }: RoomAvailabilityPageProps) {
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

  useAdminEditPageMeta({
    ready: state.status === 'ready',
    title: 'Disponibilités',
    breadcrumbTail:
      state.status === 'ready'
        ? [
            { label: state.propertyName, href: `/hebergements/${propertyId}` },
            { label: state.roomName },
          ]
        : undefined,
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
              message: 'Cette chambre n’appartient pas à cet hébergement.',
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
  }, [propertyId, roomId]);

  if (state.status === 'loading') {
    return <p className="text-sm text-atg-muted">Chargement…</p>;
  }

  if (state.status === 'error') {
    return (
      <div className="space-y-4">
        <p role="alert" className="text-sm text-red-600">
          {state.message}
        </p>
        <Link href="/hebergements" className="text-sm font-medium text-primary">
          ← Retour aux hébergements
        </Link>
      </div>
    );
  }

  const { roomName, currency, basePriceCents } = state;

  return (
    <div>
      <p className="mb-8 text-sm text-atg-muted">
        Chambre {roomName} — stock et prix par nuit ({currency}).
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

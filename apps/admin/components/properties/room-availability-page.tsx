'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
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

  const { propertyName, roomName, currency, basePriceCents } = state;

  return (
    <div>
      <nav className="mb-6 text-sm text-atg-muted">
        <Link href="/hebergements" className="text-primary hover:underline">
          Hébergements
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={`/hebergements/${propertyId}`}
          className="text-primary hover:underline"
        >
          {propertyName}
        </Link>
        <span className="mx-2">/</span>
        <span>{roomName}</span>
        <span className="mx-2">/</span>
        <span className="text-atg-fg">Disponibilités</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atg-fg">Disponibilités</h1>
        <p className="mt-2 text-sm text-atg-muted">
          Chambre {roomName} — stock et prix par nuit ({currency}).
        </p>
      </div>

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

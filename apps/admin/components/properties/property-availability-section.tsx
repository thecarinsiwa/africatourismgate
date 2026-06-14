'use client';

import { Button, Select } from '@africatourismgate/ui';
import type { Room } from '@africatourismgate/types';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { currentYearMonth } from '../../lib/availability-dates';
import { getHebergementsErrorMessage } from '../../lib/hebergements-errors';
import { RoomAvailabilityBulkForm } from './room-availability-bulk-form';
import { RoomAvailabilityGrid } from './room-availability-grid';

type PropertyAvailabilitySectionProps = {
  propertyId: string;
};

export function PropertyAvailabilitySection({ propertyId }: PropertyAvailabilitySectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const roomIdParam = searchParams.get('roomId');

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [yearMonth, setYearMonth] = useState(currentYearMonth);
  const [gridKey, setGridKey] = useState(0);

  const selectedRoomId =
    roomIdParam && rooms.some((r) => r.id === roomIdParam)
      ? roomIdParam
      : rooms[0]?.id ?? null;

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId) ?? null;

  const loadRooms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getApiClient().listRooms({
        propertyId,
        page: 1,
        limit: 100,
      });
      setRooms(result.data);
    } catch (err) {
      setError(getHebergementsErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    void loadRooms();
  }, [loadRooms]);

  const handleRoomChange = useCallback(
    (roomId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('tab', 'disponibilites');
      if (roomId) {
        params.set('roomId', roomId);
      } else {
        params.delete('roomId');
      }
      const qs = params.toString();
      router.replace(`${pathname}?${qs}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const handleBulkApplied = useCallback(() => {
    setGridKey((k) => k + 1);
  }, []);

  if (loading) {
    return <p className="text-sm text-atg-muted">Chargement des chambres…</p>;
  }

  if (error) {
    return (
      <p role="alert" className="text-sm text-red-600 dark:text-red-400">
        {error}
      </p>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-atg-border bg-atg-surface/50 px-6 py-10 text-center">
        <p className="text-sm text-atg-muted">
          Aucune chambre pour cet hébergement. Créez une chambre pour gérer les
          disponibilités.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-4"
          onClick={() => {
            const params = new URLSearchParams(searchParams.toString());
            params.set('tab', 'chambres');
            params.delete('roomId');
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });
          }}
        >
          Aller à l’onglet Chambres
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="max-w-md">
        <Select
          label="Chambre"
          value={selectedRoomId ?? ''}
          onChange={(e) => handleRoomChange(e.target.value)}
          options={rooms.map((room) => ({
            value: room.id,
            label: room.name,
          }))}
        />
        {selectedRoom ? (
          <p className="mt-2 text-sm text-atg-muted">
            Stock et prix par nuit ({selectedRoom.currency}).
          </p>
        ) : null}
      </div>

      {selectedRoom ? (
        <>
          <RoomAvailabilityBulkForm
            roomId={selectedRoom.id}
            yearMonth={yearMonth}
            defaultPriceCents={selectedRoom.basePriceCents}
            onApplied={handleBulkApplied}
          />
          <RoomAvailabilityGrid
            key={`${selectedRoom.id}-${gridKey}`}
            roomId={selectedRoom.id}
            currency={selectedRoom.currency}
            defaultPriceCents={selectedRoom.basePriceCents}
            yearMonth={yearMonth}
            onYearMonthChange={setYearMonth}
          />
        </>
      ) : null}
    </div>
  );
}

'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { Button, Select, useToast } from '@africatourismgate/ui';
import type { Room, RoomAvailability } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { currentYearMonth, formatDateLabel } from '../../lib/availability-dates';
import { RoomAvailabilityBulkForm } from './room-availability-bulk-form';
import { RoomAvailabilityGrid } from './room-availability-grid';
import { RoomAvailabilityTable } from './room-availability-table';

type PropertyAvailabilitySectionProps = {
  propertyId: string;
};

export function PropertyAvailabilitySection({ propertyId }: PropertyAvailabilitySectionProps) {
  const { hebergements: getHebergementsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.properties.sections.availability');
  const tToast = useTranslations('modules.common.toast');
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const roomIdParam = searchParams.get('roomId');

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [yearMonth, setYearMonth] = useState(currentYearMonth);
  const [gridKey, setGridKey] = useState(0);
  const [availabilityRows, setAvailabilityRows] = useState<RoomAvailability[]>([]);
  const [pendingEditDate, setPendingEditDate] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
  }, [propertyId, getHebergementsErrorMessage]);

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
      setAvailabilityRows([]);
    },
    [pathname, router, searchParams],
  );

  const handleBulkApplied = useCallback(() => {
    setGridKey((k) => k + 1);
  }, []);

  const handleRowsChange = useCallback((rows: RoomAvailability[]) => {
    setAvailabilityRows(rows);
  }, []);

  const handleDeleteRow = useCallback(
    async (row: RoomAvailability) => {
      setDeletingId(row.id);
      try {
        await getApiClient().deleteRoomAvailability(row.id);
        toast({
          title: tToast('availabilityDeleted'),
          message: formatDateLabel(row.date.slice(0, 10)),
          variant: 'success',
        });
        setGridKey((k) => k + 1);
      } catch (err) {
        toast({
          title: tToast('deleteError'),
          message: getHebergementsErrorMessage(err),
          variant: 'error',
        });
      } finally {
        setDeletingId(null);
      }
    },
    [getHebergementsErrorMessage, tToast, toast],
  );

  if (loading) {
    return <p className="text-sm text-atg-muted">{t('loadingRooms')}</p>;
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
        <p className="text-sm text-atg-muted">{t('noRooms')}</p>
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
          {t('goToRoomsTab')}
        </Button>
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-8">
      <div className="max-w-md">
        <Select
          label={t('room')}
          value={selectedRoomId ?? ''}
          onChange={(e) => handleRoomChange(e.target.value)}
          options={rooms.map((room) => ({
            value: room.id,
            label: room.name,
          }))}
        />
        {selectedRoom ? (
          <p className="mt-2 text-sm text-atg-muted">
            {t('stockHint', { currency: selectedRoom.currency })}
          </p>
        ) : null}
      </div>

      {selectedRoom ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,28rem)_minmax(0,1fr)] lg:items-start xl:grid-cols-[minmax(0,32rem)_minmax(0,1fr)]">
          <div className="flex min-w-0 flex-col gap-6">
            <RoomAvailabilityBulkForm
              roomId={selectedRoom.id}
              yearMonth={yearMonth}
              defaultPriceCents={selectedRoom.basePriceCents}
              onApplied={handleBulkApplied}
            />
            <RoomAvailabilityTable
              rows={availabilityRows}
              currency={selectedRoom.currency}
              onEditDate={(date) => {
                const ym = date.slice(0, 7);
                if (ym !== yearMonth) {
                  setYearMonth(ym);
                }
                setPendingEditDate(date);
              }}
              onDelete={(row) => void handleDeleteRow(row)}
              deletingId={deletingId}
            />
          </div>
          <RoomAvailabilityGrid
            key={`${selectedRoom.id}-${gridKey}`}
            roomId={selectedRoom.id}
            currency={selectedRoom.currency}
            defaultPriceCents={selectedRoom.basePriceCents}
            yearMonth={yearMonth}
            onYearMonthChange={setYearMonth}
            onRowsChange={handleRowsChange}
            pendingEditDate={pendingEditDate}
            onPendingEditHandled={() => setPendingEditDate(null)}
          />
        </div>
      ) : null}
    </div>
  );
}

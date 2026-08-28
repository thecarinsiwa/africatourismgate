'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import type { RoomAvailability } from '@africatourismgate/types';
import { AlertDialog, Skeleton, Spinner, useToast } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { AdminPageBackLink } from '../admin-page-back-link';
import { getApiClient } from '../../lib/auth/api';
import { currentYearMonth, formatDateLabel } from '../../lib/availability-dates';
import { RoomAvailabilityBulkForm } from './room-availability-bulk-form';
import { RoomAvailabilityGrid } from './room-availability-grid';
import { RoomAvailabilityTable } from './room-availability-table';

type RoomAvailabilityPageProps = {
  propertyId: string;
  roomId: string;
};

export function RoomAvailabilityPage({ propertyId, roomId }: RoomAvailabilityPageProps) {
  const { hebergements: getHebergementsErrorMessage } = useAdminErrorMessages();
  const tPage = useTranslations('pages.hebergements.id.chambres.roomId.disponibilites');
  const tAvailability = useTranslations('modules.properties.sections.availability');
  const tDetail = useTranslations('modules.properties.detail');
  const tToast = useTranslations('modules.common.toast');
  const { toast } = useToast();
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
  const [availabilityRows, setAvailabilityRows] = useState<RoomAvailability[]>([]);
  const [pendingEditDate, setPendingEditDate] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<RoomAvailability | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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

  const handleRowsChange = useCallback((rows: RoomAvailability[]) => {
    setAvailabilityRows(rows);
  }, []);

  const handleDeleteRequest = useCallback((row: RoomAvailability) => {
    setDeleteError(null);
    setConfirmTarget(row);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!confirmTarget) return;
    const row = confirmTarget;
    setDeletingId(row.id);
    setDeleteError(null);
    try {
      await getApiClient().deleteRoomAvailability(row.id);
      setConfirmTarget(null);
      toast({
        title: tToast('availabilityDeleted'),
        message: formatDateLabel(row.date.slice(0, 10)),
        variant: 'success',
      });
      setGridKey((k) => k + 1);
    } catch (error) {
      const message = getHebergementsErrorMessage(error);
      setDeleteError(message);
      toast({
        title: tToast('deleteError'),
        message,
        variant: 'error',
      });
    } finally {
      setDeletingId(null);
    }
  }, [confirmTarget, getHebergementsErrorMessage, tToast, toast]);

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
    return (
      <div className="min-w-0 space-y-6">
        <div className="flex items-center gap-3">
          <Spinner size="sm" variant="primary" />
          <Skeleton className="h-6 w-48 rounded" />
        </div>
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
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
      <AlertDialog
        open={!!confirmTarget}
        onOpenChange={(open) => {
          if (!open && !deletingId) setConfirmTarget(null);
        }}
        title={tAvailability('deleteTitle')}
        description={
          confirmTarget
            ? tAvailability('deleteConfirm', {
                date: formatDateLabel(confirmTarget.date.slice(0, 10)),
              })
            : undefined
        }
        confirmLabel={tAvailability('deleteConfirmButton')}
        cancelLabel={tAvailability('cancel')}
        variant="danger"
        loading={!!deletingId}
        error={deleteError}
        onConfirm={() => void handleDeleteConfirm()}
      />

      <AdminPageBackLink href={propertyBackHref} label={backLabel} />
      <p className="text-sm text-atg-muted">
        {tAvailability.has?.('summary')
          ? tAvailability('summary', { roomName, currency })
          : `${tAvailability('room')} ${roomName} — ${tAvailability('stockHint', { currency })}`}
      </p>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,28rem)_minmax(0,1fr)] lg:items-start xl:grid-cols-[minmax(0,32rem)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-6">
          <RoomAvailabilityBulkForm
            roomId={roomId}
            yearMonth={yearMonth}
            defaultPriceCents={basePriceCents}
            onApplied={handleBulkApplied}
          />
          <RoomAvailabilityTable
            rows={availabilityRows}
            currency={currency}
            onEditDate={(date) => {
              const ym = date.slice(0, 7);
              if (ym !== yearMonth) {
                setYearMonth(ym);
              }
              setPendingEditDate(date);
            }}
            onDelete={handleDeleteRequest}
            deletingId={deletingId}
          />
        </div>
        <RoomAvailabilityGrid
          key={gridKey}
          roomId={roomId}
          currency={currency}
          defaultPriceCents={basePriceCents}
          yearMonth={yearMonth}
          onYearMonthChange={setYearMonth}
          onRowsChange={handleRowsChange}
          pendingEditDate={pendingEditDate}
          onPendingEditHandled={() => setPendingEditDate(null)}
        />
      </div>
    </div>
  );
}

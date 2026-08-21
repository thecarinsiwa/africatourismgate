'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import type { FlightClassAvailability } from '@africatourismgate/types';
import { useToast } from '@africatourismgate/ui';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { AdminPageBackLink } from '../admin-page-back-link';
import { getApiClient } from '../../lib/auth/api';
import { currentYearMonth, formatDateLabel } from '../../lib/availability-dates';
import { getFlightClassLabel } from '../../lib/flight-class-labels';
import { useFlightClassLabels } from '../../lib/i18n/use-module-labels';
import { FlightClassAvailabilityBulkForm } from './flight-class-availability-bulk-form';
import { FlightClassAvailabilityGrid } from './flight-class-availability-grid';
import { FlightClassAvailabilityTable } from './flight-class-availability-table';

type FlightClassAvailabilityPageProps = {
  flightId: string;
  classId: string;
};

export function FlightClassAvailabilityPage({
  flightId,
  classId,
}: FlightClassAvailabilityPageProps) {
  const { vols: getVolsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.flights.sections.availability');
  const tDetail = useTranslations('modules.flights.detail');
  const tCommon = useTranslations('modules.common');
  const classLabels = useFlightClassLabels();
  const { toast } = useToast();
  const tToast = useTranslations('modules.common.toast');
  const [yearMonth, setYearMonth] = useState(currentYearMonth);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | {
        status: 'ready';
        flightNumber: string;
        classLabel: string;
        basePriceCents: number;
      }
  >({ status: 'loading' });
  const [gridKey, setGridKey] = useState(0);
  const [availabilityRows, setAvailabilityRows] = useState<FlightClassAvailability[]>([]);
  const [pendingEditDate, setPendingEditDate] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useAdminEditPageMeta({
    ready: state.status === 'ready',
    title: t('title'),
    breadcrumbTail:
      state.status === 'ready'
        ? [
            { label: state.flightNumber, href: `/produits/vols/${flightId}` },
            { label: state.classLabel },
          ]
        : undefined,
  });

  const handleBulkApplied = useCallback(() => {
    setGridKey((k) => k + 1);
  }, []);

  const handleRowsChange = useCallback((rows: FlightClassAvailability[]) => {
    setAvailabilityRows(rows);
  }, []);

  const handleDeleteRow = useCallback(
    async (row: FlightClassAvailability) => {
      setDeletingId(row.id);
      try {
        await getApiClient().deleteFlightClassAvailability(row.id);
        toast({
          title: tToast('availabilityDeleted'),
          message: formatDateLabel(row.date.slice(0, 10)),
          variant: 'success',
        });
        setGridKey((k) => k + 1);
      } catch (error) {
        toast({
          title: tToast('deleteError'),
          message: getVolsErrorMessage(error),
          variant: 'error',
        });
      } finally {
        setDeletingId(null);
      }
    },
    [getVolsErrorMessage, tToast, toast],
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setState({ status: 'loading' });
      try {
        const client = getApiClient();
        const [flight, flightClass] = await Promise.all([
          client.getFlight(flightId),
          client.getFlightClass(classId),
        ]);
        if (flightClass.flightId !== flightId) {
          if (!cancelled) {
            setState({
              status: 'error',
              message: t('classMismatch'),
            });
          }
          return;
        }
        if (!cancelled) {
          setState({
            status: 'ready',
            flightNumber: flight.flightNumber,
            classLabel: getFlightClassLabel(flightClass.className, classLabels),
            basePriceCents: flightClass.basePriceCents,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setState({ status: 'error', message: getVolsErrorMessage(error) });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [flightId, classId, classLabels, t, getVolsErrorMessage]);

  if (state.status === 'loading') {
    return <p className="text-sm text-atg-muted">{tCommon('loading')}</p>;
  }

  if (state.status === 'error') {
    return (
      <div className="space-y-4">
        <p role="alert" className="text-sm text-red-600">
          {state.message}
        </p>
        <Link href="/produits/vols" className="text-sm font-medium text-primary">
          {tDetail('backLink')}
        </Link>
      </div>
    );
  }

  const { flightNumber, classLabel, basePriceCents } = state;

  return (
    <div className="min-w-0 space-y-8">
      <AdminPageBackLink
        href={`/produits/vols/${flightId}?tab=classes`}
        label={t('backToFlight')}
      />
      <p className="text-sm text-atg-muted">
        {t('summary', { flightNumber, classLabel })}
      </p>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,28rem)_minmax(0,1fr)] lg:items-start xl:grid-cols-[minmax(0,32rem)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-6">
          <FlightClassAvailabilityBulkForm
            flightClassId={classId}
            yearMonth={yearMonth}
            defaultPriceCents={basePriceCents}
            onApplied={handleBulkApplied}
          />
          <FlightClassAvailabilityTable
            rows={availabilityRows}
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
        <FlightClassAvailabilityGrid
          key={gridKey}
          flightClassId={classId}
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

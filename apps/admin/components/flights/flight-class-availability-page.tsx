'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { AdminPageBackLink } from '../admin-page-back-link';
import { getApiClient } from '../../lib/auth/api';
import { currentYearMonth } from '../../lib/availability-dates';
import { getFlightClassLabel } from '../../lib/flight-class-labels';
import { useFlightClassLabels } from '../../lib/i18n/use-module-labels';
import { FlightClassAvailabilityBulkForm } from './flight-class-availability-bulk-form';
import { FlightClassAvailabilityGrid } from './flight-class-availability-grid';

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
    <div>
      <AdminPageBackLink
        href={`/produits/vols/${flightId}?tab=classes`}
        label={t('backToFlight')}
        className="mb-6 block"
      />
      <p className="mb-8 text-sm text-atg-muted">
        {t('summary', { flightNumber, classLabel })}
      </p>

      <div className="space-y-10">
        <FlightClassAvailabilityBulkForm
          flightClassId={classId}
          yearMonth={yearMonth}
          defaultPriceCents={basePriceCents}
          onApplied={handleBulkApplied}
        />
        <FlightClassAvailabilityGrid
          key={gridKey}
          flightClassId={classId}
          defaultPriceCents={basePriceCents}
          yearMonth={yearMonth}
          onYearMonthChange={setYearMonth}
        />
      </div>
    </div>
  );
}

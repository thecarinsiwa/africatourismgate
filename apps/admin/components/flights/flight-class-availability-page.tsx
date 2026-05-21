'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { currentYearMonth } from '../../lib/availability-dates';
import { flightClassLabels } from '../../lib/flight-class-labels';
import { getVolsErrorMessage } from '../../lib/vols-errors';
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
              message: 'Cette classe n’appartient pas à ce vol.',
            });
          }
          return;
        }
        if (!cancelled) {
          setState({
            status: 'ready',
            flightNumber: flight.flightNumber,
            classLabel: flightClassLabels[flightClass.className],
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
  }, [flightId, classId]);

  if (state.status === 'loading') {
    return <p className="text-sm text-atg-muted">Chargement…</p>;
  }

  if (state.status === 'error') {
    return (
      <div className="space-y-4">
        <p role="alert" className="text-sm text-red-600">
          {state.message}
        </p>
        <Link href="/produits/vols" className="text-sm font-medium text-primary">
          ← Retour aux vols
        </Link>
      </div>
    );
  }

  const { flightNumber, classLabel, basePriceCents } = state;

  return (
    <div>
      <nav className="mb-6 text-sm text-atg-muted">
        <Link href="/produits/vols" className="text-primary hover:underline">
          Vols
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/produits/vols/${flightId}`} className="text-primary hover:underline">
          {flightNumber}
        </Link>
        <span className="mx-2">/</span>
        <span>{classLabel}</span>
        <span className="mx-2">/</span>
        <span className="text-atg-fg">Disponibilités</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atg-fg">Disponibilités</h1>
        <p className="mt-2 text-sm text-atg-muted">
          Vol {flightNumber} — {classLabel} : sièges et prix par date.
        </p>
      </div>

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

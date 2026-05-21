'use client';

import { Button, Card, Input } from '@africatourismgate/ui';
import { useEffect, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { endOfMonth, startOfMonth } from '../../lib/availability-dates';
import { getVolsErrorMessage } from '../../lib/vols-errors';

type FlightClassAvailabilityBulkFormProps = {
  flightClassId: string;
  yearMonth: string;
  defaultPriceCents: number;
  onApplied: () => void;
};

export function FlightClassAvailabilityBulkForm({
  flightClassId,
  yearMonth,
  defaultPriceCents,
  onApplied,
}: FlightClassAvailabilityBulkFormProps) {
  const [dateFrom, setDateFrom] = useState(startOfMonth(yearMonth));
  const [dateTo, setDateTo] = useState(endOfMonth(yearMonth));
  const [availableSeats, setAvailableSeats] = useState('10');
  const [priceCents, setPriceCents] = useState(String(defaultPriceCents));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setDateFrom(startOfMonth(yearMonth));
    setDateTo(endOfMonth(yearMonth));
  }, [yearMonth]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const seats = Number(availableSeats);
    const cents = Number(priceCents);
    if (!Number.isFinite(seats) || seats < 0) {
      setError('Sièges invalides.');
      return;
    }
    if (!Number.isFinite(cents) || cents < 0) {
      setError('Prix invalide (centimes).');
      return;
    }
    if (!dateFrom || !dateTo || dateFrom > dateTo) {
      setError('Plage de dates invalide.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await getApiClient().bulkUpsertFlightClassAvailability({
        flightClassId,
        dateFrom,
        dateTo,
        availableSeats: seats,
        priceCents: cents,
      });
      setSuccess(`${result.upsertedCount} jour(s) mis à jour.`);
      onApplied();
    } catch (err) {
      setError(getVolsErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card variant="dashboard" className="max-w-3xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h3 className="text-sm font-medium text-atg-fg">Mise à jour en masse</h3>
        <p className="text-sm text-atg-muted">
          Applique les mêmes sièges et le même prix à toutes les dates de la plage (max. 90
          jours).
        </p>
        {error ? (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="text-sm text-green-700" role="status">
            {success}
          </p>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Du" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          <Input label="Au" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Sièges disponibles"
            type="number"
            min={0}
            value={availableSeats}
            onChange={(e) => setAvailableSeats(e.target.value)}
          />
          <Input
            label="Prix (centimes)"
            type="number"
            min={0}
            value={priceCents}
            onChange={(e) => setPriceCents(e.target.value)}
          />
        </div>
        <Button type="submit" loading={submitting}>
          Appliquer à la plage
        </Button>
      </form>
    </Card>
  );
}

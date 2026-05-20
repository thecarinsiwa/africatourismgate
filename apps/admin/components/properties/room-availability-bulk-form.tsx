'use client';

import { Button, Card, Input } from '@africatourismgate/ui';
import { useEffect, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { endOfMonth, startOfMonth } from '../../lib/availability-dates';
import { getHebergementsErrorMessage } from '../../lib/hebergements-errors';

type RoomAvailabilityBulkFormProps = {
  roomId: string;
  yearMonth: string;
  defaultPriceCents: number;
  onApplied: () => void;
};

export function RoomAvailabilityBulkForm({
  roomId,
  yearMonth,
  defaultPriceCents,
  onApplied,
}: RoomAvailabilityBulkFormProps) {
  const [dateFrom, setDateFrom] = useState(startOfMonth(yearMonth));
  const [dateTo, setDateTo] = useState(endOfMonth(yearMonth));

  useEffect(() => {
    setDateFrom(startOfMonth(yearMonth));
    setDateTo(endOfMonth(yearMonth));
  }, [yearMonth]);
  const [availableUnits, setAvailableUnits] = useState('5');
  const [priceCents, setPriceCents] = useState(String(defaultPriceCents));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const units = Number(availableUnits);
    const cents = Number(priceCents);
    if (!Number.isFinite(units) || units < 0) {
      setError('Stock invalide.');
      return;
    }
    if (!Number.isFinite(cents) || cents < 0) {
      setError('Prix invalide (centimes).');
      return;
    }
    if (!dateFrom || !dateTo) {
      setError('Les dates sont obligatoires.');
      return;
    }
    if (dateFrom > dateTo) {
      setError('La date de début doit être avant la date de fin.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await getApiClient().bulkUpsertRoomAvailability({
        roomId,
        dateFrom,
        dateTo,
        availableUnits: units,
        priceCents: cents,
      });
      setSuccess(`${result.upsertedCount} jour(s) mis à jour.`);
      onApplied();
    } catch (err) {
      setError(getHebergementsErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card variant="dashboard" className="max-w-3xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h3 className="text-sm font-medium text-atg-fg">Mise à jour en masse</h3>
        <p className="text-sm text-atg-muted">
          Applique le même stock et le même prix/nuit à toutes les dates de la plage
          (max. 90 jours).
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
          <Input
            label="Du"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            required
          />
          <Input
            label="Au"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Stock (unités)"
            type="number"
            min={0}
            value={availableUnits}
            onChange={(e) => setAvailableUnits(e.target.value)}
            required
          />
          <Input
            label="Prix/nuit (centimes)"
            type="number"
            min={0}
            value={priceCents}
            onChange={(e) => setPriceCents(e.target.value)}
            hint="Ex. 8500 = 85,00"
            required
          />
        </div>
        <Button type="submit" loading={submitting}>
          Appliquer à la plage
        </Button>
      </form>
    </Card>
  );
}

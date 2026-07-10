'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { Button, Card, Input } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { endOfMonth, startOfMonth } from '../../lib/availability-dates';

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
  const { hebergements: getHebergementsErrorMessage } = useAdminErrorMessages();
  const tCalendar = useTranslations('modules.common.availabilityCalendar');
  const tCommon = useTranslations('modules.common');
  const [dateFrom, setDateFrom] = useState(startOfMonth(yearMonth));
  const [dateTo, setDateTo] = useState(endOfMonth(yearMonth));
  const [availableUnits, setAvailableUnits] = useState('5');
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

    const units = Number(availableUnits);
    const cents = Number(priceCents);
    if (!Number.isFinite(units) || units < 0) {
      setError(tCommon('validation.invalidStock'));
      return;
    }
    if (!Number.isFinite(cents) || cents < 0) {
      setError(tCommon('validation.invalidPriceCents'));
      return;
    }
    if (!dateFrom || !dateTo) {
      setError(tCommon('validation.datesRequired'));
      return;
    }
    if (dateFrom > dateTo) {
      setError(tCommon('validation.dateRangeInvalid'));
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
      setSuccess(tCalendar('bulkSuccess', { count: result.upsertedCount }));
      onApplied();
    } catch (err) {
      setError(getHebergementsErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card variant="dashboard" className="w-full min-w-0">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h3 className="text-sm font-medium text-atg-fg">{tCalendar('bulkTitle')}</h3>
        <p className="text-sm text-atg-muted">{tCalendar('bulkIntro')}</p>
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label={tCommon('form.dateFrom')}
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            required
          />
          <Input
            label={tCommon('form.dateTo')}
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            required
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label={tCalendar('stockUnits')}
            type="number"
            min={0}
            value={availableUnits}
            onChange={(e) => setAvailableUnits(e.target.value)}
            required
          />
          <Input
            label={tCommon('form.priceCentsShort')}
            type="number"
            min={0}
            value={priceCents}
            onChange={(e) => setPriceCents(e.target.value)}
            hint={tCommon('form.centsHint')}
            required
          />
        </div>
        <Button type="submit" loading={submitting}>
          {tCommon('filters.apply')}
        </Button>
      </form>
    </Card>
  );
}


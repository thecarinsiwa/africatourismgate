'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { Button, Input } from '@africatourismgate/ui';
import type {
  CreateCruiseSailingRequest,
  CruiseSailing,
  Itinerary,
  Ship,
} from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';

export type SailingFormValues = {
  itineraryId: string;
  departureDate: string;
};

const defaultValues: SailingFormValues = {
  itineraryId: '',
  departureDate: '',
};

function sailingToFormValues(sailing: CruiseSailing): SailingFormValues {
  return {
    itineraryId: sailing.itineraryId,
    departureDate: sailing.departureDate.slice(0, 10),
  };
}

function toPayload(values: SailingFormValues): CreateCruiseSailingRequest {
  return {
    itineraryId: values.itineraryId,
    departureDate: values.departureDate,
  };
}

type SailingFormProps = {
  mode: 'create' | 'edit';
  sailingId?: string;
  initialSailing?: CruiseSailing;
};

export function SailingForm({ mode, sailingId, initialSailing }: SailingFormProps) {
  const { croisieres: getCroisieresErrorMessage } = useAdminErrorMessages();
  const tForm = useTranslations('modules.cruises.form.sailing');
  const tActions = useTranslations('common.actions');
  const tLoading = useTranslations('common.loading');
  const tSelect = useTranslations('modules.common.select');
  const router = useRouter();
  const itinerarySelectId = useId();
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [ships, setShips] = useState<Ship[]>([]);
  const [values, setValues] = useState<SailingFormValues>(() =>
    initialSailing ? sailingToFormValues(initialSailing) : defaultValues,
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const client = getApiClient();
    void Promise.all([
      client.listItineraries({ page: 1, limit: 100 }),
      client.listShips({ page: 1, limit: 100 }),
    ])
      .then(([i, s]) => {
        setItineraries(i.data);
        setShips(s.data);
      })
      .catch(() => {
        setItineraries([]);
        setShips([]);
      });
  }, []);

  const shipById = useMemo(() => new Map(ships.map((s) => [s.id, s])), [ships]);

  const itineraryOptions = useMemo(
    () =>
      itineraries.map((it) => {
        const ship = shipById.get(it.shipId);
        return {
          id: it.id,
          label: tForm('itineraryOption', {
            name: it.name,
            shipName: ship?.name ?? tForm('fallbackShip'),
            nights: it.durationNights,
          }),
        };
      }),
    [itineraries, shipById, tForm],
  );

  const updateField = useCallback((field: keyof SailingFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (!values.itineraryId || !values.departureDate) {
      setFormError(tForm('validation'));
      return;
    }
    setSubmitting(true);
    try {
      const client = getApiClient();
      const body = toPayload(values);
      if (mode === 'create') {
        const created = await client.createCruiseSailing(body);
        router.push(`/produits/croisieres/${created.id}`);
        router.refresh();
      } else if (sailingId) {
        await client.updateCruiseSailing(sailingId, body);
        router.refresh();
      }
    } catch (error) {
      setFormError(getCroisieresErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  const selectClass =
    'w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg';

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {formError ? (
        <p role="alert" className="text-sm text-red-600">
          {formError}
        </p>
      ) : null}
      <div>
        <label htmlFor={itinerarySelectId} className="mb-2 block text-sm font-medium">
          {tForm('itinerary')}
        </label>
        <select
          id={itinerarySelectId}
          className={selectClass}
          value={values.itineraryId}
          onChange={(e) => updateField('itineraryId', e.target.value)}
          required
        >
          <option value="">{tSelect('choose')}</option>
          {itineraryOptions.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
        {itineraryOptions.length === 0 ? (
          <p className="mt-2 text-sm text-atg-muted">{tForm('noItinerariesHint')}</p>
        ) : null}
      </div>
      <Input
        label={tForm('departureDate')}
        type="date"
        value={values.departureDate}
        onChange={(e) => updateField('departureDate', e.target.value)}
        required
      />
      <div className="flex gap-3">
        <Button type="submit" loading={submitting} loadingText={tLoading('submit')}>
          {mode === 'create' ? tForm('submitCreate') : tActions('save')}
        </Button>
        <Button href="/produits/croisieres" variant="outline" disabled={submitting}>
          {tActions('cancel')}
        </Button>
      </div>
    </form>
  );
}

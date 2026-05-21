'use client';

import { Button, Input } from '@africatourismgate/ui';
import type { CreateShipRequest, CruiseLine, Ship } from '@africatourismgate/types';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useId, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { getCroisieresErrorMessage } from '../../lib/croisieres-errors';

export type ShipFormValues = {
  cruiseLineId: string;
  name: string;
  builtYear: string;
};

const defaultValues: ShipFormValues = {
  cruiseLineId: '',
  name: '',
  builtYear: '',
};

function shipToFormValues(ship: Ship): ShipFormValues {
  return {
    cruiseLineId: ship.cruiseLineId,
    name: ship.name,
    builtYear: ship.builtYear != null ? String(ship.builtYear) : '',
  };
}

function toPayload(values: ShipFormValues): CreateShipRequest {
  const year = values.builtYear.trim();
  return {
    cruiseLineId: values.cruiseLineId,
    name: values.name.trim(),
    builtYear: year ? Number(year) : null,
  };
}

type ShipFormProps = {
  mode: 'create' | 'edit';
  shipId?: string;
  initialShip?: Ship;
};

export function ShipForm({ mode, shipId, initialShip }: ShipFormProps) {
  const router = useRouter();
  const lineId = useId();
  const [lines, setLines] = useState<CruiseLine[]>([]);
  const [values, setValues] = useState<ShipFormValues>(() =>
    initialShip ? shipToFormValues(initialShip) : defaultValues,
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void getApiClient()
      .listCruiseLines({ page: 1, limit: 100 })
      .then((r) => setLines(r.data))
      .catch(() => setLines([]));
  }, []);

  const updateField = useCallback(
    (field: keyof ShipFormValues, value: string) => {
      setValues((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (!values.cruiseLineId || !values.name.trim()) {
      setFormError('Ligne et nom du navire sont obligatoires.');
      return;
    }
    setSubmitting(true);
    try {
      const client = getApiClient();
      const body = toPayload(values);
      if (mode === 'create') {
        const created = await client.createShip(body);
        router.push(`/produits/croisieres/navires/${created.id}`);
        router.refresh();
      } else if (shipId) {
        await client.updateShip(shipId, body);
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
        <label htmlFor={lineId} className="mb-2 block text-sm font-medium">
          Ligne de croisière
        </label>
        <select
          id={lineId}
          className={selectClass}
          value={values.cruiseLineId}
          onChange={(e) => updateField('cruiseLineId', e.target.value)}
          required
        >
          <option value="">Choisir une ligne…</option>
          {lines.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      </div>
      <Input
        label="Nom du navire"
        value={values.name}
        onChange={(e) => updateField('name', e.target.value)}
        required
      />
      <Input
        label="Année de construction (optionnel)"
        type="number"
        min={1900}
        max={2100}
        value={values.builtYear}
        onChange={(e) => updateField('builtYear', e.target.value)}
      />
      <div className="flex gap-3">
        <Button type="submit" loading={submitting}>
          {mode === 'create' ? 'Créer le navire' : 'Enregistrer'}
        </Button>
        <Button href="/produits/croisieres/navires" variant="outline">
          Annuler
        </Button>
      </div>
    </form>
  );
}

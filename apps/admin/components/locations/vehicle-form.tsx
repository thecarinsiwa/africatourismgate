'use client';

import { Button, Input } from '@africatourismgate/ui';
import type {
  CreateVehicleRequest,
  RentalAgency,
  Vehicle,
  VehicleCategory,
} from '@africatourismgate/types';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useId, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { getLocationsErrorMessage } from '../../lib/locations-errors';

export type VehicleFormValues = {
  agencyId: string;
  categoryId: string;
  licensePlate: string;
  dailyPriceCents: string;
  currency: string;
};

const defaultValues: VehicleFormValues = {
  agencyId: '',
  categoryId: '',
  licensePlate: '',
  dailyPriceCents: '',
  currency: 'USD',
};

function vehicleToFormValues(vehicle: Vehicle): VehicleFormValues {
  return {
    agencyId: vehicle.agencyId,
    categoryId: vehicle.categoryId,
    licensePlate: vehicle.licensePlate ?? '',
    dailyPriceCents: String(vehicle.dailyPriceCents),
    currency: vehicle.currency,
  };
}

function toPayload(values: VehicleFormValues): CreateVehicleRequest {
  return {
    agencyId: values.agencyId,
    categoryId: values.categoryId,
    dailyPriceCents: Number(values.dailyPriceCents),
    currency: values.currency.trim().toUpperCase(),
    ...(values.licensePlate.trim()
      ? { licensePlate: values.licensePlate.trim().toUpperCase() }
      : {}),
  };
}

type VehicleFormProps = {
  mode: 'create' | 'edit';
  vehicleId?: string;
  initialVehicle?: Vehicle;
};

export function VehicleForm({ mode, vehicleId, initialVehicle }: VehicleFormProps) {
  const router = useRouter();
  const agencyId = useId();
  const categoryId = useId();
  const [agencies, setAgencies] = useState<RentalAgency[]>([]);
  const [categories, setCategories] = useState<VehicleCategory[]>([]);
  const [values, setValues] = useState<VehicleFormValues>(() =>
    initialVehicle ? vehicleToFormValues(initialVehicle) : defaultValues,
  );
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof VehicleFormValues, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void Promise.all([
      getApiClient().listRentalAgencies({ page: 1, limit: 100 }),
      getApiClient().listVehicleCategories({ page: 1, limit: 100 }),
    ])
      .then(([a, c]) => {
        setAgencies(a.data);
        setCategories(c.data);
      })
      .catch(() => {
        setAgencies([]);
        setCategories([]);
      });
  }, []);

  const updateField = useCallback(
    <K extends keyof VehicleFormValues>(key: K, value: VehicleFormValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    [],
  );

  function validate(): boolean {
    const errors: Partial<Record<keyof VehicleFormValues, string>> = {};
    if (!values.agencyId) errors.agencyId = 'Agence obligatoire.';
    if (!values.categoryId) errors.categoryId = 'Catégorie obligatoire.';
    const cents = Number(values.dailyPriceCents);
    if (!Number.isFinite(cents) || cents < 0) {
      errors.dailyPriceCents = 'Prix invalide (centimes).';
    }
    if (values.currency.trim().length !== 3) {
      errors.currency = 'Devise à 3 lettres (ex. USD).';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const client = getApiClient();
      const payload = toPayload(values);
      if (mode === 'create') {
        const created = await client.createVehicle(payload);
        router.push(`/produits/locations/${created.id}`);
        router.refresh();
      } else if (vehicleId) {
        await client.updateVehicle(vehicleId, payload);
        router.push('/produits/locations');
        router.refresh();
      }
    } catch (error) {
      setFormError(getLocationsErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  const selectClass =
    'w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg outline-none focus:border-primary focus:ring-1 focus:ring-primary';

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
      {formError ? (
        <p role="alert" className="text-sm text-red-600">
          {formError}
        </p>
      ) : null}

      <div>
        <label htmlFor={agencyId} className="mb-2 block text-sm font-medium text-atg-fg">
          Agence de location
        </label>
        <select
          id={agencyId}
          className={selectClass}
          value={values.agencyId}
          onChange={(e) => updateField('agencyId', e.target.value)}
        >
          <option value="">— Choisir —</option>
          {agencies.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
        {fieldErrors.agencyId ? (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.agencyId}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor={categoryId} className="mb-2 block text-sm font-medium text-atg-fg">
          Catégorie
        </label>
        <select
          id={categoryId}
          className={selectClass}
          value={values.categoryId}
          onChange={(e) => updateField('categoryId', e.target.value)}
        >
          <option value="">— Choisir —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
              {c.exampleModel ? ` (${c.exampleModel})` : ''}
            </option>
          ))}
        </select>
        {fieldErrors.categoryId ? (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.categoryId}</p>
        ) : null}
      </div>

      <Input
        label="Plaque d’immatriculation"
        value={values.licensePlate}
        onChange={(e) => updateField('licensePlate', e.target.value.toUpperCase())}
        hint="Optionnel"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Prix journalier (centimes)"
          type="number"
          min={0}
          value={values.dailyPriceCents}
          onChange={(e) => updateField('dailyPriceCents', e.target.value)}
          error={fieldErrors.dailyPriceCents}
        />
        <Input
          label="Devise"
          maxLength={3}
          value={values.currency}
          onChange={(e) => updateField('currency', e.target.value.toUpperCase())}
          error={fieldErrors.currency}
        />
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <Button type="submit" loading={submitting}>
          {mode === 'create' ? 'Créer le véhicule' : 'Enregistrer'}
        </Button>
        <Button type="button" variant="outline" href="/produits/locations">
          Annuler
        </Button>
      </div>
    </form>
  );
}

'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { Button, Input } from '@africatourismgate/ui';
import type {
  CreateVehicleRequest,
  RentalAgency,
  Vehicle,
  VehicleCategory,
} from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useId, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';

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
  const { locations: getLocationsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.locations.form');
  const tActions = useTranslations('common.actions');
  const tCommon = useTranslations('modules.common');
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
    if (!values.agencyId) errors.agencyId = t('validation.agencyRequired');
    if (!values.categoryId) errors.categoryId = t('validation.categoryRequired');
    const cents = Number(values.dailyPriceCents);
    if (!Number.isFinite(cents) || cents < 0) {
      errors.dailyPriceCents = tCommon('validation.invalidPriceCents');
    }
    if (values.currency.trim().length !== 3) {
      errors.currency = tCommon('validation.currencyThreeLettersExample');
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
          {t('rentalAgency')}
        </label>
        <select
          id={agencyId}
          className={selectClass}
          value={values.agencyId}
          onChange={(e) => updateField('agencyId', e.target.value)}
        >
          <option value="">{tCommon('select.chooseDash')}</option>
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
          {t('category')}
        </label>
        <select
          id={categoryId}
          className={selectClass}
          value={values.categoryId}
          onChange={(e) => updateField('categoryId', e.target.value)}
        >
          <option value="">{tCommon('select.chooseDash')}</option>
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
        label={t('licensePlate')}
        value={values.licensePlate}
        onChange={(e) => updateField('licensePlate', e.target.value.toUpperCase())}
        hint={tCommon('form.optional')}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label={t('dailyPriceCents')}
          type="number"
          min={0}
          value={values.dailyPriceCents}
          onChange={(e) => updateField('dailyPriceCents', e.target.value)}
          error={fieldErrors.dailyPriceCents}
        />
        <Input
          label={tCommon('form.currency')}
          maxLength={3}
          value={values.currency}
          onChange={(e) => updateField('currency', e.target.value.toUpperCase())}
          error={fieldErrors.currency}
        />
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <Button type="submit" loading={submitting}>
          {mode === 'create' ? t('submitCreate') : tActions('save')}
        </Button>
        <Button type="button" variant="outline" href="/produits/locations">
          {tActions('cancel')}
        </Button>
      </div>
    </form>
  );
}

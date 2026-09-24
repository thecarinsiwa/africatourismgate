'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { Button, Card, Input, SearchableSelect } from '@africatourismgate/ui';
import type {
  CreateVehicleRequest,
  RentalAgency,
  Vehicle,
  VehicleCategory,
} from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
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
  identityAside?: ReactNode;
};

export function VehicleForm({
  mode,
  vehicleId,
  initialVehicle,
  identityAside,
}: VehicleFormProps) {
  const { locations: getLocationsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.locations.form');
  const tActions = useTranslations('common.actions');
  const tLoading = useTranslations('common.loading');
  const tCommon = useTranslations('modules.common');
  const tSelect = useTranslations('modules.common.select');
  const router = useRouter();
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

  const agencyOptions = useMemo(
    () => [
      { value: '', label: tSelect('chooseDash') },
      ...agencies.map((a) => ({ value: a.id, label: a.name })),
    ],
    [agencies, tSelect],
  );

  const categoryOptions = useMemo(
    () => [
      { value: '', label: tSelect('chooseDash') },
      ...categories.map((c) => ({
        value: c.id,
        label: c.exampleModel ? `${c.name} (${c.exampleModel})` : c.name,
      })),
    ],
    [categories, tSelect],
  );

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

  const fields = (
    <div className="space-y-6">
      <SearchableSelect
        label={t('rentalAgency')}
        name="agencyId"
        value={values.agencyId}
        options={agencyOptions}
        onChange={(next) => updateField('agencyId', next)}
        searchPlaceholder={tSelect('searchPlaceholder')}
        emptyMessage={tSelect('empty')}
        placeholder={tSelect('chooseDash')}
        error={fieldErrors.agencyId}
        required
      />

      <SearchableSelect
        label={t('category')}
        name="categoryId"
        value={values.categoryId}
        options={categoryOptions}
        onChange={(next) => updateField('categoryId', next)}
        searchPlaceholder={tSelect('searchPlaceholder')}
        emptyMessage={tSelect('empty')}
        placeholder={tSelect('chooseDash')}
        error={fieldErrors.categoryId}
        required
      />

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
    </div>
  );

  return (
    <form
      onSubmit={handleSubmit}
      className={identityAside ? 'w-full space-y-4' : 'mx-auto max-w-2xl space-y-6'}
    >
      {formError ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {formError}
        </p>
      ) : null}

      {identityAside ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:items-start xl:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
          <Card variant="dashboard" padding="sm">
            {fields}
          </Card>
          <div className="min-w-0">{identityAside}</div>
        </div>
      ) : (
        fields
      )}

      <div className="flex flex-wrap gap-3 pt-2">
        <Button type="submit" loading={submitting} loadingText={tLoading('submit')}>
          {mode === 'create' ? t('submitCreate') : tActions('save')}
        </Button>
        <Button type="button" variant="outline" href="/produits/locations" disabled={submitting}>
          {tActions('cancel')}
        </Button>
      </div>
    </form>
  );
}

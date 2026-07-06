'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { Button, Input } from '@africatourismgate/ui';
import type {
  CreateHappyCustomersStatRequest,
  HappyCustomersColorKey,
  HappyCustomersStat,
  HappyCustomersStatus,
} from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useId, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';

const COLOR_KEYS: HappyCustomersColorKey[] = ['primary', 'secondary'];

export type HappyCustomersStatFormValues = {
  label: string;
  percentValue: string;
  colorKey: HappyCustomersColorKey;
  sortOrder: string;
  status: HappyCustomersStatus;
  locale: string;
};

const defaultValues: HappyCustomersStatFormValues = {
  label: '',
  percentValue: '0',
  colorKey: 'primary',
  sortOrder: '0',
  status: 'draft',
  locale: 'fr',
};

function statToFormValues(stat: HappyCustomersStat): HappyCustomersStatFormValues {
  return {
    label: stat.label,
    percentValue: String(stat.percentValue),
    colorKey: stat.colorKey,
    sortOrder: String(stat.sortOrder),
    status: stat.status,
    locale: stat.locale,
  };
}

function toPayload(values: HappyCustomersStatFormValues): CreateHappyCustomersStatRequest {
  const percent = Number.parseInt(values.percentValue, 10);
  return {
    label: values.label.trim(),
    percentValue: Number.isFinite(percent) ? Math.min(100, Math.max(0, percent)) : 0,
    colorKey: values.colorKey,
    sortOrder: Number.parseInt(values.sortOrder, 10) || 0,
    status: values.status,
    locale: values.locale,
  };
}

type HappyCustomersStatFormProps = {
  mode: 'create' | 'edit';
  statId?: string;
  initialStat?: HappyCustomersStat;
  defaultLocale?: string;
};

export function HappyCustomersStatForm({
  mode,
  statId,
  initialStat,
  defaultLocale = 'fr',
}: HappyCustomersStatFormProps) {
  const { about: getAboutErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.about.happyCustomers.stats.form');
  const tColors = useTranslations('modules.about.happyCustomers.colors');
  const tCommon = useTranslations('modules.common');
  const tLocale = useTranslations('modules.about.locale');
  const tStatus = useTranslations('modules.about.status');
  const router = useRouter();

  const labelId = useId();
  const percentValueId = useId();
  const colorKeyId = useId();
  const sortOrderId = useId();
  const statusId = useId();
  const localeId = useId();

  const [values, setValues] = useState<HappyCustomersStatFormValues>(() =>
    initialStat ? statToFormValues(initialStat) : { ...defaultValues, locale: defaultLocale },
  );
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof HappyCustomersStatFormValues, string>>
  >({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const updateField = useCallback(
    <K extends keyof HappyCustomersStatFormValues>(key: K, value: HappyCustomersStatFormValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    [],
  );

  const validate = (): boolean => {
    const errors: Partial<Record<keyof HappyCustomersStatFormValues, string>> = {};
    if (!values.label.trim()) errors.label = t('validation.labelRequired');
    const percent = Number.parseInt(values.percentValue, 10);
    if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
      errors.percentValue = t('validation.percentInvalid');
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setSubmitError(null);

    const payload = toPayload(values);
    const client = getApiClient();

    try {
      if (mode === 'create') {
        const created = await client.createHappyCustomersStat(payload);
        router.push(`/contenu/clients-satisfaits/${created.id}`);
      } else if (statId) {
        await client.updateHappyCustomersStat(statId, payload);
        router.push('/contenu/clients-satisfaits');
      }
    } catch (error) {
      setSubmitError(getAboutErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
      <div>
        <label htmlFor={labelId} className="mb-1 block text-sm font-medium">
          {t('fields.label')}
        </label>
        <Input
          id={labelId}
          value={values.label}
          onChange={(e) => updateField('label', e.target.value)}
          aria-invalid={Boolean(fieldErrors.label)}
        />
        {fieldErrors.label ? (
          <p className="mt-1 text-sm text-destructive">{fieldErrors.label}</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={percentValueId} className="mb-1 block text-sm font-medium">
            {t('fields.percentValue')}
          </label>
          <Input
            id={percentValueId}
            type="number"
            min={0}
            max={100}
            value={values.percentValue}
            onChange={(e) => updateField('percentValue', e.target.value)}
            aria-invalid={Boolean(fieldErrors.percentValue)}
          />
          {fieldErrors.percentValue ? (
            <p className="mt-1 text-sm text-destructive">{fieldErrors.percentValue}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor={colorKeyId} className="mb-1 block text-sm font-medium">
            {t('fields.colorKey')}
          </label>
          <select
            id={colorKeyId}
            value={values.colorKey}
            onChange={(e) => updateField('colorKey', e.target.value as HappyCustomersColorKey)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {COLOR_KEYS.map((key) => (
              <option key={key} value={key}>
                {tColors(key)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor={sortOrderId} className="mb-1 block text-sm font-medium">
            {t('fields.sortOrder')}
          </label>
          <Input
            id={sortOrderId}
            type="number"
            min={0}
            value={values.sortOrder}
            onChange={(e) => updateField('sortOrder', e.target.value)}
          />
        </div>

        <div>
          <label htmlFor={statusId} className="mb-1 block text-sm font-medium">
            {tCommon('columns.status')}
          </label>
          <select
            id={statusId}
            value={values.status}
            onChange={(e) => updateField('status', e.target.value as HappyCustomersStatus)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="draft">{tStatus('draft')}</option>
            <option value="published">{tStatus('published')}</option>
          </select>
        </div>

        <div>
          <label htmlFor={localeId} className="mb-1 block text-sm font-medium">
            {t('fields.locale')}
          </label>
          <select
            id={localeId}
            value={values.locale}
            onChange={(e) => updateField('locale', e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="fr">{tLocale('fr')}</option>
            <option value="en">{tLocale('en')}</option>
            <option value="es">{tLocale('es')}</option>
          </select>
        </div>
      </div>

      {submitError ? <p className="text-sm text-destructive">{submitError}</p> : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? t('saving') : mode === 'create' ? t('createButton') : t('saveButton')}
        </Button>
        <Button type="button" variant="outline" href="/contenu/clients-satisfaits">
          {t('cancelButton')}
        </Button>
      </div>
    </form>
  );
}

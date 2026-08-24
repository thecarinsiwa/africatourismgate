'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { Button, Card, Input, Select } from '@africatourismgate/ui';
import type {
  CreateHappyCustomersStatRequest,
  HappyCustomersColorKey,
  HappyCustomersStat,
  HappyCustomersStatus,
} from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { useContentLocaleOptions } from '../../lib/content/use-content-locale-options';
import { usePermissions } from '../../lib/auth/use-permissions';

export const HAPPY_CUSTOMERS_STATS_HUB_HREF = '/contenu/site?tab=happy-customers';

const COLOR_KEYS: HappyCustomersColorKey[] = ['primary', 'secondary'];

const COLOR_BAR_CLASS: Record<HappyCustomersColorKey, string> = {
  primary: 'bg-primary',
  secondary: 'bg-secondary',
};

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

function clampPercent(value: string): number {
  const percent = Number.parseInt(value, 10);
  if (!Number.isFinite(percent)) return 0;
  return Math.min(100, Math.max(0, percent));
}

type HappyCustomersStatFormProps = {
  mode: 'create' | 'edit';
  statId?: string;
  initialStat?: HappyCustomersStat;
  defaultLocale?: string;
  cancelHref?: string;
};

export function HappyCustomersStatForm({
  mode,
  statId,
  initialStat,
  defaultLocale = 'fr',
  cancelHref = HAPPY_CUSTOMERS_STATS_HUB_HREF,
}: HappyCustomersStatFormProps) {
  const { about: getAboutErrorMessage } = useAdminErrorMessages();
  const { hasPermission, isSuperAdmin } = usePermissions();
  const canWrite = isSuperAdmin || hasPermission('content.write');
  const t = useTranslations('modules.about.happyCustomers.stats.form');
  const tColors = useTranslations('modules.about.happyCustomers.colors');
  const tCommon = useTranslations('modules.common');
  const tStatus = useTranslations('modules.about.status');
  const localeOptions = useContentLocaleOptions('modules.about.locale');
  const router = useRouter();

  const [values, setValues] = useState<HappyCustomersStatFormValues>(() =>
    initialStat ? statToFormValues(initialStat) : { ...defaultValues, locale: defaultLocale },
  );
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof HappyCustomersStatFormValues, string>>
  >({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const colorOptions = useMemo(
    () => COLOR_KEYS.map((key) => ({ value: key, label: tColors(key) })),
    [tColors],
  );

  const statusOptions = useMemo(
    () =>
      (['draft', 'published'] as const).map((status) => ({
        value: status,
        label: tStatus(status),
      })),
    [tStatus],
  );

  const previewPercent = clampPercent(values.percentValue);

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
    if (!canWrite) return;
    if (!validate()) return;

    setSaving(true);
    setSubmitError(null);

    const payload = toPayload(values);
    const client = getApiClient();

    try {
      if (mode === 'create') {
        const created = await client.createHappyCustomersStat(payload);
        router.push(`/contenu/clients-satisfaits/${created.id}`);
        router.refresh();
      } else if (statId) {
        await client.updateHappyCustomersStat(statId, payload);
        router.push(cancelHref);
        router.refresh();
      }
    } catch (error) {
      setSubmitError(getAboutErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-lg border border-atg-border bg-atg-elevated/50 px-4 py-3 text-sm text-atg-muted">
          <p>{t('info.sectionHint')}</p>
        </div>

        {submitError ? (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400"
          >
            {submitError}
          </p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label={t('fields.locale')}
            value={values.locale}
            options={localeOptions}
            onChange={(e) => updateField('locale', e.target.value)}
            disabled={!canWrite}
          />
          <Select
            label={tCommon('columns.status')}
            value={values.status}
            options={statusOptions}
            onChange={(e) => updateField('status', e.target.value as HappyCustomersStatus)}
            disabled={!canWrite}
          />
        </div>

        <Input
          label={t('fields.label')}
          value={values.label}
          onChange={(e) => updateField('label', e.target.value)}
          error={fieldErrors.label}
          required
          disabled={!canWrite}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={t('fields.percentValue')}
            type="number"
            min={0}
            max={100}
            value={values.percentValue}
            onChange={(e) => updateField('percentValue', e.target.value)}
            error={fieldErrors.percentValue}
            required
            disabled={!canWrite}
          />
          <Select
            label={t('fields.colorKey')}
            value={values.colorKey}
            options={colorOptions}
            onChange={(e) => updateField('colorKey', e.target.value as HappyCustomersColorKey)}
            disabled={!canWrite}
          />
        </div>

        <div className="rounded-lg border border-atg-border bg-atg-surface/50 p-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-atg-muted">
            {t('fields.preview')}
          </p>
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-atg-fg">
              {values.label.trim() || t('fields.previewLabelPlaceholder')}
            </span>
            <span
              className={`text-sm font-bold ${values.colorKey === 'secondary' ? 'text-secondary' : 'text-primary'}`}
            >
              {previewPercent}%
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-atg-muted/20">
            <div
              className={`h-full rounded-full transition-all ${COLOR_BAR_CLASS[values.colorKey]}`}
              style={{ width: `${previewPercent}%` }}
            />
          </div>
        </div>

        <Input
          label={t('fields.sortOrder')}
          type="number"
          min={0}
          value={values.sortOrder}
          onChange={(e) => updateField('sortOrder', e.target.value)}
          disabled={!canWrite}
        />

        <div className="flex flex-wrap gap-3">
          {canWrite ? (
            <Button type="submit" disabled={saving}>
              {saving ? t('saving') : mode === 'create' ? t('createButton') : t('saveButton')}
            </Button>
          ) : null}
          <Button type="button" variant="outline" href={cancelHref}>
            {t('cancelButton')}
          </Button>
        </div>
      </form>
    </Card>
  );
}

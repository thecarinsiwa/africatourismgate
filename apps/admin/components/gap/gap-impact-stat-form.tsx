'use client';

import { Button, Input } from '@africatourismgate/ui';
import type {
  CreateGapImpactStatRequest,
  GapImpactStat,
  GapImpactStatColorKey,
  GapStatus,
} from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useId, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { GAP_COLOR_KEYS } from '../../lib/gap/constants';
import { useGapPermissions } from '../../lib/gap/use-gap-permissions';
import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';
import { isRichTextEmpty } from '../../lib/rich-text';
import { RichTextEditor } from '../rich-text-editor';

export type GapImpactStatFormValues = {
  label: string;
  valueDisplay: string;
  description: string;
  colorKey: GapImpactStatColorKey;
  sortOrder: string;
  status: GapStatus;
  locale: string;
};

const defaultValues: GapImpactStatFormValues = {
  label: '',
  valueDisplay: '',
  description: '',
  colorKey: 'primary',
  sortOrder: '0',
  status: 'draft',
  locale: 'fr',
};

function statToFormValues(stat: GapImpactStat): GapImpactStatFormValues {
  return {
    label: stat.label,
    valueDisplay: stat.valueDisplay,
    description: stat.description ?? '',
    colorKey: stat.colorKey,
    sortOrder: String(stat.sortOrder),
    status: stat.status,
    locale: stat.locale,
  };
}

function toPayload(values: GapImpactStatFormValues): CreateGapImpactStatRequest {
  const description = values.description.trim();
  return {
    label: values.label.trim(),
    valueDisplay: values.valueDisplay.trim(),
    description: description && !isRichTextEmpty(description) ? description : null,
    colorKey: values.colorKey,
    sortOrder: Number.parseInt(values.sortOrder, 10) || 0,
    status: values.status,
    locale: values.locale,
  };
}

type GapImpactStatFormProps = {
  mode: 'create' | 'edit';
  statId?: string;
  initialStat?: GapImpactStat;
  defaultLocale?: string;
};

export function GapImpactStatForm({
  mode,
  statId,
  initialStat,
  defaultLocale = 'fr',
}: GapImpactStatFormProps) {
  const { gap: getGapErrorMessage } = useAdminErrorMessages();
  const { canWrite } = useGapPermissions();
  const t = useTranslations('modules.gap.impact.form');
  const tColors = useTranslations('modules.gap.colors');
  const tCommon = useTranslations('modules.common');
  const tLocale = useTranslations('modules.about.locale');
  const tStatus = useTranslations('modules.about.status');
  const router = useRouter();

  const labelId = useId();
  const valueDisplayId = useId();
  const colorKeyId = useId();
  const sortOrderId = useId();
  const statusId = useId();
  const localeId = useId();

  const [values, setValues] = useState<GapImpactStatFormValues>(() =>
    initialStat ? statToFormValues(initialStat) : { ...defaultValues, locale: defaultLocale },
  );
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof GapImpactStatFormValues, string>>
  >({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const updateField = useCallback(
    <K extends keyof GapImpactStatFormValues>(key: K, value: GapImpactStatFormValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    [],
  );

  const validate = (): boolean => {
    const errors: Partial<Record<keyof GapImpactStatFormValues, string>> = {};
    if (!values.label.trim()) errors.label = t('validation.labelRequired');
    if (!values.valueDisplay.trim()) errors.valueDisplay = t('validation.valueRequired');
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canWrite || !validate()) return;

    setSaving(true);
    setSubmitError(null);

    const payload = toPayload(values);
    const client = getApiClient();

    try {
      if (mode === 'create') {
        const created = await client.createGapImpactStat(payload);
        router.push(`/gap/impact/${created.id}`);
      } else if (statId) {
        await client.updateGapImpactStat(statId, payload);
        router.push('/gap/impact');
      }
    } catch (error) {
      setSubmitError(getGapErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
      {submitError ? <p className="text-sm text-destructive">{submitError}</p> : null}

      <div>
        <label htmlFor={labelId} className="mb-1 block text-sm font-medium">
          {t('fields.label')}
        </label>
        <Input
          id={labelId}
          value={values.label}
          onChange={(e) => updateField('label', e.target.value)}
          disabled={!canWrite}
          aria-invalid={Boolean(fieldErrors.label)}
        />
        {fieldErrors.label ? (
          <p className="mt-1 text-sm text-destructive">{fieldErrors.label}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor={valueDisplayId} className="mb-1 block text-sm font-medium">
          {t('fields.valueDisplay')}
        </label>
        <Input
          id={valueDisplayId}
          value={values.valueDisplay}
          onChange={(e) => updateField('valueDisplay', e.target.value)}
          disabled={!canWrite}
          placeholder={t('fields.valueDisplayPlaceholder')}
          aria-invalid={Boolean(fieldErrors.valueDisplay)}
        />
        {fieldErrors.valueDisplay ? (
          <p className="mt-1 text-sm text-destructive">{fieldErrors.valueDisplay}</p>
        ) : null}
      </div>

      {canWrite ? (
        <RichTextEditor
          label={t('fields.description')}
          value={values.description}
          onChange={(html) => updateField('description', html)}
          placeholder={t('fields.descriptionPlaceholder')}
          contentClassName="min-h-[160px]"
        />
      ) : values.description.trim() && !isRichTextEmpty(values.description) ? (
        <div>
          <p className="mb-1 text-sm font-medium">{t('fields.description')}</p>
          <div
            className="rounded-md border border-atg-border bg-atg-surface px-3 py-2 text-sm text-atg-muted"
            dangerouslySetInnerHTML={{ __html: values.description }}
          />
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={colorKeyId} className="mb-1 block text-sm font-medium">
            {t('fields.colorKey')}
          </label>
          <select
            id={colorKeyId}
            value={values.colorKey}
            onChange={(e) => updateField('colorKey', e.target.value as GapImpactStatColorKey)}
            disabled={!canWrite}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {GAP_COLOR_KEYS.map((key) => (
              <option key={key} value={key}>
                {tColors(key)}
              </option>
            ))}
          </select>
        </div>
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
            disabled={!canWrite}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={statusId} className="mb-1 block text-sm font-medium">
            {tCommon('columns.status')}
          </label>
          <select
            id={statusId}
            value={values.status}
            onChange={(e) => updateField('status', e.target.value as GapStatus)}
            disabled={!canWrite}
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
            disabled={!canWrite}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="fr">{tLocale('fr')}</option>
            <option value="en">{tLocale('en')}</option>
            <option value="es">{tLocale('es')}</option>
          </select>
        </div>
      </div>

      {canWrite ? (
        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? t('saving') : mode === 'create' ? t('createButton') : t('saveButton')}
          </Button>
          <Button type="button" variant="outline" href="/gap/impact">
            {t('cancelButton')}
          </Button>
        </div>
      ) : null}
    </form>
  );
}

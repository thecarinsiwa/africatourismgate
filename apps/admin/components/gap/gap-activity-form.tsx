'use client';

import { Button, Input, Textarea } from '@africatourismgate/ui';
import type {
  CreateGapActivityRequest,
  GapActivity,
  GapActivityIconKey,
  GapStatus,
} from '@africatourismgate/types';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useId, useState } from 'react';
import { isValidMediaUrl } from '../../lib/about/form-utils';
import { getApiClient } from '../../lib/auth/api';
import { GAP_ACTIVITY_ICON_KEYS } from '../../lib/gap/constants';
import { useGapPermissions } from '../../lib/gap/use-gap-permissions';
import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';
import { resolveMediaUrl } from '../../lib/resolve-media-url';

export type GapActivityFormValues = {
  title: string;
  description: string;
  iconKey: GapActivityIconKey;
  imageUrl: string;
  sortOrder: string;
  status: GapStatus;
  locale: string;
};

const defaultValues: GapActivityFormValues = {
  title: '',
  description: '',
  iconKey: 'school',
  imageUrl: '',
  sortOrder: '0',
  status: 'draft',
  locale: 'fr',
};

function activityToFormValues(activity: GapActivity): GapActivityFormValues {
  return {
    title: activity.title,
    description: activity.description,
    iconKey: activity.iconKey,
    imageUrl: activity.imageUrl ?? '',
    sortOrder: String(activity.sortOrder),
    status: activity.status,
    locale: activity.locale,
  };
}

function toPayload(values: GapActivityFormValues): CreateGapActivityRequest {
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    iconKey: values.iconKey,
    imageUrl: values.imageUrl.trim() || null,
    sortOrder: Number.parseInt(values.sortOrder, 10) || 0,
    status: values.status,
    locale: values.locale,
  };
}

type GapActivityFormProps = {
  mode: 'create' | 'edit';
  activityId?: string;
  initialActivity?: GapActivity;
  defaultLocale?: string;
};

export function GapActivityForm({
  mode,
  activityId,
  initialActivity,
  defaultLocale = 'fr',
}: GapActivityFormProps) {
  const { gap: getGapErrorMessage } = useAdminErrorMessages();
  const { canWrite } = useGapPermissions();
  const t = useTranslations('modules.gap.activities.form');
  const tIcons = useTranslations('modules.gap.activityIcons');
  const tCommon = useTranslations('modules.common');
  const tCommonForm = useTranslations('modules.common.form');
  const tLocale = useTranslations('modules.about.locale');
  const tStatus = useTranslations('modules.about.status');
  const router = useRouter();

  const titleId = useId();
  const descriptionId = useId();
  const iconKeyId = useId();
  const sortOrderId = useId();
  const statusId = useId();
  const localeId = useId();

  const [values, setValues] = useState<GapActivityFormValues>(() =>
    initialActivity ? activityToFormValues(initialActivity) : { ...defaultValues, locale: defaultLocale },
  );
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof GapActivityFormValues, string>>
  >({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const updateField = useCallback(
    <K extends keyof GapActivityFormValues>(key: K, value: GapActivityFormValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    [],
  );

  const validate = (): boolean => {
    const errors: Partial<Record<keyof GapActivityFormValues, string>> = {};
    if (!values.title.trim()) errors.title = t('validation.titleRequired');
    if (!values.description.trim()) errors.description = t('validation.descriptionRequired');
    const imageUrl = values.imageUrl.trim();
    if (imageUrl && !isValidMediaUrl(imageUrl)) {
      errors.imageUrl = t('validation.imageUrlInvalid');
    }
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
        const created = await client.createGapActivity(payload);
        router.push(`/gap/activites/${created.id}`);
      } else if (activityId) {
        await client.updateGapActivity(activityId, payload);
        router.push('/gap/activites');
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
        <label htmlFor={titleId} className="mb-1 block text-sm font-medium">
          {t('fields.title')}
        </label>
        <Input
          id={titleId}
          value={values.title}
          onChange={(e) => updateField('title', e.target.value)}
          disabled={!canWrite}
          aria-invalid={Boolean(fieldErrors.title)}
        />
        {fieldErrors.title ? (
          <p className="mt-1 text-sm text-destructive">{fieldErrors.title}</p>
        ) : null}
      </div>

      <Textarea
        id={descriptionId}
        label={t('fields.description')}
        rows={4}
        value={values.description}
        onChange={(e) => updateField('description', e.target.value)}
        disabled={!canWrite}
        error={fieldErrors.description}
      />

      <div>
        <label htmlFor={iconKeyId} className="mb-1 block text-sm font-medium">
          {t('fields.iconKey')}
        </label>
        <select
          id={iconKeyId}
          value={values.iconKey}
          onChange={(e) => updateField('iconKey', e.target.value as GapActivityIconKey)}
          disabled={!canWrite}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          {GAP_ACTIVITY_ICON_KEYS.map((key) => (
            <option key={key} value={key}>
              {tIcons(key)}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium">{t('fields.imageUrl')}</p>
        {values.imageUrl.trim() ? (
          <Image
            src={resolveMediaUrl(values.imageUrl.trim())}
            alt={t('fields.imagePreviewAlt')}
            width={320}
            height={180}
            unoptimized
            className="h-32 w-full max-w-sm rounded-lg border border-atg-border object-cover"
          />
        ) : null}
        <Input
          label={tCommonForm('externalUrlOptional')}
          type="url"
          value={values.imageUrl}
          onChange={(e) => updateField('imageUrl', e.target.value)}
          placeholder={tCommonForm('urlPlaceholder')}
          disabled={!canWrite}
          error={fieldErrors.imageUrl}
        />
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
            disabled={!canWrite}
          />
        </div>
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
          <Button type="button" variant="outline" href="/gap/activites">
            {t('cancelButton')}
          </Button>
        </div>
      ) : null}
    </form>
  );
}

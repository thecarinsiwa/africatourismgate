'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { Button, Input } from '@africatourismgate/ui';
import type {
  Activity,
  ActivityDifficultyLevel,
  ActivityProvider,
  CreateActivityRequest,
} from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useId, useState } from 'react';
import { RichTextEditor, type RichTextUploadedAsset } from '../rich-text-editor';
import { getApiClient, resolveApiBaseUrl } from '../../lib/auth/api';
import { isRichTextEmpty } from '../../lib/rich-text';
import { getSession } from '../../lib/auth/session';
import { useActivityDifficultyOptions } from '../../lib/i18n/use-module-labels';

export type ActivityFormValues = {
  providerId: string;
  title: string;
  description: string;
  durationMinutes: string;
  difficultyLevel: string;
  priceCents: string;
  currency: string;
};

const DESCRIPTION_MAX_LENGTH = 5000;

const defaultValues: ActivityFormValues = {
  providerId: '',
  title: '',
  description: '',
  durationMinutes: '',
  difficultyLevel: '',
  priceCents: '',
  currency: 'USD',
};

function activityToFormValues(activity: Activity): ActivityFormValues {
  return {
    providerId: activity.providerId,
    title: activity.title,
    description: activity.description ?? '',
    durationMinutes:
      activity.durationMinutes != null ? String(activity.durationMinutes) : '',
    difficultyLevel: activity.difficultyLevel ?? '',
    priceCents: String(activity.priceCents),
    currency: activity.currency,
  };
}

function toPayload(values: ActivityFormValues): CreateActivityRequest {
  const duration =
    values.durationMinutes.trim() !== ''
      ? Number(values.durationMinutes)
      : undefined;
  const difficultyLevel: ActivityDifficultyLevel | null | undefined =
    values.difficultyLevel === ''
      ? null
      : (values.difficultyLevel as ActivityDifficultyLevel);
  return {
    providerId: values.providerId,
    title: values.title.trim(),
    priceCents: Number(values.priceCents),
    currency: values.currency.trim().toUpperCase(),
    ...(values.description.trim() && !isRichTextEmpty(values.description)
      ? { description: values.description.trim() }
      : {}),
    ...(duration !== undefined && Number.isFinite(duration) ? { durationMinutes: duration } : {}),
    difficultyLevel,
  };
}

type ActivityFormProps = {
  mode: 'create' | 'edit';
  activityId?: string;
  initialActivity?: Activity;
  onUpdated?: (activity: Activity) => void;
};

export function ActivityForm({ mode, activityId, initialActivity, onUpdated }: ActivityFormProps) {
  const { activities: getActivitiesErrorMessage } = useAdminErrorMessages();
  const tForm = useTranslations('modules.activities.form');
  const tValidation = useTranslations('modules.activities.form.validation');
  const tCommonForm = useTranslations('modules.common.form');
  const tActions = useTranslations('common.actions');
  const tLoading = useTranslations('common.loading');
  const tSelect = useTranslations('modules.common.select');
  const difficultyOptions = useActivityDifficultyOptions();
  const router = useRouter();
  const providerId = useId();
  const difficultyId = useId();
  const [providers, setProviders] = useState<ActivityProvider[]>([]);
  const [values, setValues] = useState<ActivityFormValues>(() =>
    initialActivity ? activityToFormValues(initialActivity) : defaultValues,
  );
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof ActivityFormValues, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void getApiClient()
      .listActivityProviders({ page: 1, limit: 100 })
      .then((r) => setProviders(r.data))
      .catch(() => setProviders([]));
  }, []);

  const handleUploadDescriptionAsset = useCallback(
    async (file: File): Promise<RichTextUploadedAsset> => {
      const session = getSession();
      if (!session?.accessToken) {
        throw new Error('Session expirée');
      }
      const body = new FormData();
      body.append('file', file);
      const uploadPath = activityId
        ? `/activities/${activityId}/upload-description-asset`
        : '/activities/upload-description-asset';
      const response = await fetch(`${resolveApiBaseUrl()}${uploadPath}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.accessToken}` },
        body,
      });
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      const payload = (await response.json()) as {
        url?: string;
        assetType?: 'image' | 'pdf' | 'word';
      };
      if (!payload.url || !payload.assetType) {
        throw new Error('Invalid upload response');
      }
      return {
        url: payload.url,
        assetType: payload.assetType,
        name: file.name,
      };
    },
    [activityId],
  );

  const updateField = useCallback(
    <K extends keyof ActivityFormValues>(key: K, value: ActivityFormValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    [],
  );

  function validate(): boolean {
    const errors: Partial<Record<keyof ActivityFormValues, string>> = {};
    if (!values.providerId) errors.providerId = tValidation('providerRequired');
    if (!values.title.trim()) errors.title = tValidation('titleRequired');
    const cents = Number(values.priceCents);
    if (!Number.isFinite(cents) || cents < 0) errors.priceCents = tValidation('invalidPrice');
    if (values.currency.trim().length !== 3) errors.currency = tValidation('currencyThreeLetters');
    if (values.durationMinutes.trim()) {
      const d = Number(values.durationMinutes);
      if (!Number.isFinite(d) || d < 1) errors.durationMinutes = tValidation('invalidDuration');
    }
    if (values.description.length > DESCRIPTION_MAX_LENGTH) {
      errors.description = tValidation('descriptionTooLong', { max: DESCRIPTION_MAX_LENGTH });
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
      const body = toPayload(values);
      if (mode === 'create') {
        const created = await getApiClient().createActivity(body);
        router.push(`/produits/activites/${created.id}`);
      } else if (activityId) {
        const updated = await getApiClient().updateActivity(activityId, body);
        onUpdated?.(updated);
        router.refresh();
      }
    } catch (error) {
      setFormError(getActivitiesErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  const selectClass =
    'w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg outline-none focus:border-primary focus:ring-1 focus:ring-primary';

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
      {formError ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {formError}
        </p>
      ) : null}
      <div>
        <label htmlFor={providerId} className="mb-2 block text-sm font-medium text-atg-fg">
          {tForm('provider')}
        </label>
        <select
          id={providerId}
          className={selectClass}
          value={values.providerId}
          onChange={(e) => updateField('providerId', e.target.value)}
        >
          <option value="">{tSelect('chooseDash')}</option>
          {providers.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        {fieldErrors.providerId ? (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.providerId}</p>
        ) : null}
      </div>
      <Input
        label={tForm('title')}
        value={values.title}
        onChange={(e) => updateField('title', e.target.value)}
        error={fieldErrors.title}
      />
      <RichTextEditor
        label={tCommonForm('description')}
        value={values.description}
        onChange={(html) => updateField('description', html)}
        placeholder={tForm('descriptionPlaceholder')}
        onUploadAsset={handleUploadDescriptionAsset}
      />
      {fieldErrors.description ? (
        <p className="mt-1 text-sm text-red-600">{fieldErrors.description}</p>
      ) : null}
      <Input
        label={tCommonForm('durationMinutesOptional')}
        type="number"
        min={1}
        value={values.durationMinutes}
        onChange={(e) => updateField('durationMinutes', e.target.value)}
        error={fieldErrors.durationMinutes}
      />
      <div>
        <label htmlFor={difficultyId} className="mb-2 block text-sm font-medium text-atg-fg">
          {tForm('difficulty')}
        </label>
        <select
          id={difficultyId}
          className={selectClass}
          value={values.difficultyLevel}
          onChange={(e) => updateField('difficultyLevel', e.target.value)}
        >
          {difficultyOptions.map((option) => (
            <option key={option.value || 'unspecified'} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label={tForm('priceCents')}
          type="number"
          min={0}
          value={values.priceCents}
          onChange={(e) => updateField('priceCents', e.target.value)}
          error={fieldErrors.priceCents}
        />
        <Input
          label={tCommonForm('currency')}
          value={values.currency}
          onChange={(e) => updateField('currency', e.target.value)}
          error={fieldErrors.currency}
          maxLength={3}
        />
      </div>
      <div className="flex flex-wrap gap-3 pt-2">
        <Button type="submit" loading={submitting} loadingText={tLoading('submit')}>
          {mode === 'create' ? tForm('submitCreate') : tActions('save')}
        </Button>
        <Button type="button" variant="outline" href="/produits/activites" disabled={submitting}>
          {tActions('cancel')}
        </Button>
      </div>
    </form>
  );
}

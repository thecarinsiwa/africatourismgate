'use client';

import { Button, Input } from '@africatourismgate/ui';
import type {
  Activity,
  ActivityDifficultyLevel,
  ActivityProvider,
  CreateActivityRequest,
} from '@africatourismgate/types';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useId, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { getActivitiesErrorMessage } from '../../lib/activities-errors';
import {
  ACTIVITY_DIFFICULTY_LABELS,
  ACTIVITY_DIFFICULTY_LEVELS,
} from '../../lib/activity-difficulty';

export type ActivityFormValues = {
  providerId: string;
  title: string;
  description: string;
  durationMinutes: string;
  difficultyLevel: string;
  priceCents: string;
  currency: string;
};

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
    ...(values.description.trim() ? { description: values.description.trim() } : {}),
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

  const updateField = useCallback(
    <K extends keyof ActivityFormValues>(key: K, value: ActivityFormValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    [],
  );

  function validate(): boolean {
    const errors: Partial<Record<keyof ActivityFormValues, string>> = {};
    if (!values.providerId) errors.providerId = 'Le fournisseur est obligatoire.';
    if (!values.title.trim()) errors.title = 'Le titre est obligatoire.';
    const cents = Number(values.priceCents);
    if (!Number.isFinite(cents) || cents < 0) errors.priceCents = 'Prix invalide.';
    if (values.currency.trim().length !== 3) errors.currency = 'Devise à 3 lettres.';
    if (values.durationMinutes.trim()) {
      const d = Number(values.durationMinutes);
      if (!Number.isFinite(d) || d < 1) errors.durationMinutes = 'Durée invalide.';
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
    'w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg';

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
      {formError ? (
        <p role="alert" className="text-sm text-red-600">
          {formError}
        </p>
      ) : null}
      <div>
        <label htmlFor={providerId} className="mb-2 block text-sm font-medium text-atg-fg">
          Fournisseur
        </label>
        <select
          id={providerId}
          className={selectClass}
          value={values.providerId}
          onChange={(e) => updateField('providerId', e.target.value)}
        >
          <option value="">— Choisir —</option>
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
        label="Titre"
        value={values.title}
        onChange={(e) => updateField('title', e.target.value)}
        error={fieldErrors.title}
      />
      <div>
        <label className="mb-2 block text-sm font-medium text-atg-fg">Description</label>
        <textarea
          value={values.description}
          onChange={(e) => updateField('description', e.target.value)}
          rows={4}
          className={selectClass}
        />
      </div>
      <Input
        label="Durée (minutes, optionnel)"
        type="number"
        min={1}
        value={values.durationMinutes}
        onChange={(e) => updateField('durationMinutes', e.target.value)}
        error={fieldErrors.durationMinutes}
      />
      <div>
        <label htmlFor={difficultyId} className="mb-2 block text-sm font-medium text-atg-fg">
          Difficulté
        </label>
        <select
          id={difficultyId}
          className={selectClass}
          value={values.difficultyLevel}
          onChange={(e) => updateField('difficultyLevel', e.target.value)}
        >
          <option value="">— Non renseignée —</option>
          {ACTIVITY_DIFFICULTY_LEVELS.map((level) => (
            <option key={level} value={level}>
              {ACTIVITY_DIFFICULTY_LABELS[level]}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Prix (centimes)"
          type="number"
          min={0}
          value={values.priceCents}
          onChange={(e) => updateField('priceCents', e.target.value)}
          error={fieldErrors.priceCents}
        />
        <Input
          label="Devise"
          value={values.currency}
          onChange={(e) => updateField('currency', e.target.value)}
          error={fieldErrors.currency}
          maxLength={3}
        />
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={submitting}>
          {mode === 'create' ? 'Créer' : 'Enregistrer'}
        </Button>
        <Button type="button" variant="outline" href="/produits/activites">
          Annuler
        </Button>
      </div>
    </form>
  );
}

'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { Button, Input, SearchableSelect } from '@africatourismgate/ui';
import type {
  Activity,
  ActivityDifficultyLevel,
  ActivityProvider,
  CreateActivityRequest,
  Destination,
} from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { RichTextEditor, type RichTextUploadedAsset } from '../rich-text-editor';
import { getApiClient, resolveApiBaseUrl } from '../../lib/auth/api';
import {
  hasValidDestinationCoords,
  parseDestinationCoord,
} from '../../lib/destination-coords';
import { isRichTextEmpty } from '../../lib/rich-text';
import { getSession } from '../../lib/auth/session';
import { useActivityDifficultyOptions } from '../../lib/i18n/use-module-labels';
import { CoordinatePickerMap } from '../maps/coordinate-picker-map';

export type ActivityFormValues = {
  providerId: string;
  title: string;
  description: string;
  durationMinutes: string;
  difficultyLevel: string;
  priceCents: string;
  currency: string;
  latitude: string;
  longitude: string;
};

const defaultValues: ActivityFormValues = {
  providerId: '',
  title: '',
  description: '',
  durationMinutes: '',
  difficultyLevel: '',
  priceCents: '',
  currency: 'USD',
  latitude: '',
  longitude: '',
};

function formatCoordInput(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') {
    return '';
  }
  const num = Number(value);
  return Number.isFinite(num) ? String(num) : '';
}

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
    latitude: formatCoordInput(activity.latitude),
    longitude: formatCoordInput(activity.longitude),
  };
}

function toPayload(
  values: ActivityFormValues,
  mode: 'create' | 'edit',
): CreateActivityRequest {
  const duration =
    values.durationMinutes.trim() !== ''
      ? Number(values.durationMinutes)
      : undefined;
  const difficultyLevel: ActivityDifficultyLevel | null | undefined =
    values.difficultyLevel === ''
      ? null
      : (values.difficultyLevel as ActivityDifficultyLevel);
  const payload: CreateActivityRequest = {
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

  const latTrimmed = values.latitude.trim();
  const lngTrimmed = values.longitude.trim();
  if (latTrimmed && lngTrimmed) {
    payload.latitude = Number(latTrimmed);
    payload.longitude = Number(lngTrimmed);
  } else if (mode === 'edit') {
    payload.latitude = null;
    payload.longitude = null;
  }

  return payload;
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
  const tCommonValidation = useTranslations('modules.common.validation');
  const tCommonForm = useTranslations('modules.common.form');
  const tActions = useTranslations('common.actions');
  const tLoading = useTranslations('common.loading');
  const tSelect = useTranslations('modules.common.select');
  const difficultyOptions = useActivityDifficultyOptions();
  const router = useRouter();
  const [providers, setProviders] = useState<ActivityProvider[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
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
    void getApiClient()
      .listDestinations({ page: 1, limit: 100 })
      .then((r) => setDestinations(r.data))
      .catch(() => setDestinations([]));
  }, []);

  const selectedProvider = useMemo(
    () => providers.find((p) => p.id === values.providerId) ?? null,
    [providers, values.providerId],
  );

  const selectedDestination = useMemo(() => {
    if (!selectedProvider) return null;
    return destinations.find((d) => d.id === selectedProvider.destinationId) ?? null;
  }, [destinations, selectedProvider]);

  const mapDefaults = useMemo(() => {
    if (
      selectedDestination &&
      hasValidDestinationCoords(selectedDestination.latitude, selectedDestination.longitude)
    ) {
      return {
        latitude: parseDestinationCoord(selectedDestination.latitude)!,
        longitude: parseDestinationCoord(selectedDestination.longitude)!,
      };
    }
    return { latitude: 0, longitude: 20 };
  }, [selectedDestination]);

  const providerOptions = useMemo(
    () => [
      { value: '', label: tSelect('chooseDash') },
      ...providers.map((provider) => ({ value: provider.id, label: provider.name })),
    ],
    [providers, tSelect],
  );

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
    if (!Number.isFinite(Number(values.priceCents)) || Number(values.priceCents) < 0) {
      errors.priceCents = tValidation('invalidPrice');
    }
    if (values.currency.trim().length !== 3) {
      errors.currency = tValidation('currencyThreeLetters');
    }
    if (values.durationMinutes.trim()) {
      const n = Number(values.durationMinutes);
      if (!Number.isFinite(n) || n < 1) {
        errors.durationMinutes = tValidation('invalidDuration');
      }
    }
    const hasLat = values.latitude.trim().length > 0;
    const hasLng = values.longitude.trim().length > 0;
    if (hasLat !== hasLng) {
      errors.latitude = tCommonValidation('coordsBothRequired');
      errors.longitude = tCommonValidation('coordsBothRequired');
    } else if (hasLat && hasLng) {
      const lat = parseDestinationCoord(values.latitude);
      const lng = parseDestinationCoord(values.longitude);
      if (lat === null) errors.latitude = tCommonValidation('latitudeInvalid');
      if (lng === null) errors.longitude = tCommonValidation('longitudeInvalid');
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
      const body = toPayload(values, mode);
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

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
      {formError ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {formError}
        </p>
      ) : null}
      <SearchableSelect
        label={tForm('provider')}
        name="providerId"
        value={values.providerId}
        options={providerOptions}
        onChange={(next) => updateField('providerId', next)}
        searchPlaceholder={tSelect('searchPlaceholder')}
        emptyMessage={tSelect('empty')}
        placeholder={tSelect('chooseDash')}
        error={fieldErrors.providerId}
        required
      />
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
      <SearchableSelect
        label={tForm('difficulty')}
        name="difficultyLevel"
        value={values.difficultyLevel}
        options={difficultyOptions}
        onChange={(next) => updateField('difficultyLevel', next)}
        searchPlaceholder={tSelect('searchPlaceholder')}
        emptyMessage={tSelect('empty')}
        placeholder={tSelect('chooseDash')}
      />
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

      <div className="space-y-3 rounded-xl border border-atg-border p-4">
        <h3 className="text-sm font-semibold text-atg-fg">{tForm('geographyTitle')}</h3>
        <p className="text-xs text-atg-muted">{tForm('geographyIntro')}</p>
        <CoordinatePickerMap
          latitude={values.latitude}
          longitude={values.longitude}
          onCoordinateChange={(lat, lng) => {
            updateField('latitude', lat);
            updateField('longitude', lng);
          }}
          defaultLatitude={mapDefaults.latitude}
          defaultLongitude={mapDefaults.longitude}
          countryCode={selectedDestination?.countryCode}
          title={tForm('mapPicker')}
          hint={tForm('mapPickerHint')}
          ariaLabel={tForm('mapPickerAria')}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={tCommonForm('latitude')}
            value={values.latitude}
            onChange={(e) => updateField('latitude', e.target.value)}
            hint={tForm('latitudeHint')}
            error={fieldErrors.latitude}
          />
          <Input
            label={tCommonForm('longitude')}
            value={values.longitude}
            onChange={(e) => updateField('longitude', e.target.value)}
            hint={tForm('longitudeHint')}
            error={fieldErrors.longitude}
          />
        </div>
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

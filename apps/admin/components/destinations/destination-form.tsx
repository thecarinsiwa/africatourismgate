'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { Button, Checkbox, Input, Modal, useToast } from '@africatourismgate/ui';
import type { CreateDestinationRequest, Destination } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useId, useState } from 'react';
import { parseDestinationCoord } from '../../lib/destination-coords';
import {
  getSoftDeletedDestinationFromError,
  type SoftDeletedDestinationInfo,
} from '../../lib/destinations-errors';
import { getApiClient } from '../../lib/auth/api';
import { isRichTextEmpty } from '../../lib/rich-text';
import { isValidSlug, slugifyName } from '../../lib/slug';
import { RichTextEditor } from '../rich-text-editor';
import { CountryCodeCombobox } from './country-code-combobox';
import { DestinationGeographyMap } from './destination-geography-map';

export type DestinationFormValues = {
  name: string;
  slug: string;
  countryCode: string;
  description: string;
  imageUrl: string;
  latitude: string;
  longitude: string;
  isFeatured: boolean;
};

const defaultValues: DestinationFormValues = {
  name: '',
  slug: '',
  countryCode: 'CD',
  description: '',
  imageUrl: '',
  latitude: '',
  longitude: '',
  isFeatured: false,
};

function formatCoordInput(value: string | null | undefined): string {
  if (value === null || value === undefined || value === '') {
    return '';
  }
  const num = Number(value);
  return Number.isFinite(num) ? String(num) : '';
}

function destinationToFormValues(destination: Destination): DestinationFormValues {
  return {
    name: destination.name,
    slug: destination.slug,
    countryCode: destination.countryCode,
    description: destination.description ?? '',
    imageUrl: destination.imageUrl ?? '',
    latitude: formatCoordInput(destination.latitude),
    longitude: formatCoordInput(destination.longitude),
    isFeatured: destination.isFeatured ?? false,
  };
}

function toPayload(
  values: DestinationFormValues,
  mode: 'create' | 'edit',
  options?: { omitImageUrl?: boolean },
): CreateDestinationRequest {
  const payload: CreateDestinationRequest = {
    name: values.name.trim(),
    slug: values.slug.trim().toLowerCase(),
    countryCode: values.countryCode.trim().toUpperCase(),
    isFeatured: values.isFeatured,
  };

  if (values.description.trim() && !isRichTextEmpty(values.description)) {
    payload.description = values.description.trim();
  } else if (mode === 'edit') {
    payload.description = undefined;
  }

  if (!options?.omitImageUrl) {
    const imageUrl = values.imageUrl.trim();
    if (imageUrl) {
      payload.imageUrl = imageUrl;
    } else if (mode === 'edit') {
      payload.imageUrl = null;
    }
  }

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

type DestinationFormProps = {
  mode: 'create' | 'edit';
  destinationId?: string;
  initialDestination?: Destination;
  onUpdated?: (destination: Destination) => void;
  /** Hide hero URL field when a dedicated upload section handles it (edit page). */
  hideHeroUrlField?: boolean;
};

export function DestinationForm({
  mode,
  destinationId,
  initialDestination,
  onUpdated,
  hideHeroUrlField = false,
}: DestinationFormProps) {
  const { destinations: getDestinationsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.destinations.form');
  const tCommonForm = useTranslations('modules.common.form');
  const tCommonColumns = useTranslations('modules.common.columns');
  const tValidation = useTranslations('modules.common.validation');
  const tActions = useTranslations('common.actions');
  const tLoading = useTranslations('common.loading');
  const tToast = useTranslations('modules.common.toast');
  const { toast } = useToast();
  const router = useRouter();
  const countryId = useId();
  const [values, setValues] = useState<DestinationFormValues>(() =>
    initialDestination ? destinationToFormValues(initialDestination) : defaultValues,
  );
  const [slugTouched, setSlugTouched] = useState(Boolean(initialDestination));
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof DestinationFormValues, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [deletedDestination, setDeletedDestination] =
    useState<SoftDeletedDestinationInfo | null>(null);
  const [restoring, setRestoring] = useState(false);

  const updateField = useCallback(
    <K extends keyof DestinationFormValues>(key: K, value: DestinationFormValues[K]) => {
      setValues((prev) => {
        const next = { ...prev, [key]: value };
        if (key === 'name' && !slugTouched) {
          next.slug = slugifyName(String(value));
        }
        return next;
      });
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    [slugTouched],
  );

  function validate(): boolean {
    const errors: Partial<Record<keyof DestinationFormValues, string>> = {};
    if (!values.name.trim()) {
      errors.name = tValidation('nameRequired');
    }
    if (!values.slug.trim()) {
      errors.slug = tValidation('slugRequired');
    } else if (!isValidSlug(values.slug.trim().toLowerCase())) {
      errors.slug = tValidation('slugInvalidLong');
    }
    if (values.countryCode.trim().length !== 2) {
      errors.countryCode = tValidation('countryCodeTwoLetters');
    }

    const hasLat = values.latitude.trim().length > 0;
    const hasLng = values.longitude.trim().length > 0;
    if (hasLat !== hasLng) {
      errors.latitude = tValidation('coordsBothRequired');
      errors.longitude = tValidation('coordsBothRequired');
    } else if (hasLat && hasLng) {
      const lat = parseDestinationCoord(values.latitude);
      const lng = parseDestinationCoord(values.longitude);
      if (lat === null || lat < -90 || lat > 90) {
        errors.latitude = tValidation('latitudeInvalid');
      }
      if (lng === null || lng < -180 || lng > 180) {
        errors.longitude = tValidation('longitudeInvalid');
      }
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
      const payload = toPayload(values, mode, { omitImageUrl: hideHeroUrlField });
      if (mode === 'create') {
        const created = await client.createDestination(payload);
        router.push(`/produits/destinations/${created.id}?tab=pois`);
        router.refresh();
      } else if (destinationId) {
        const updated = await client.updateDestination(destinationId, payload);
        onUpdated?.(updated);
        toast({
          title: tToast('destinationSavedTitle'),
          message: values.name.trim(),
          variant: 'success',
        });
        router.push('/produits/destinations');
        router.refresh();
      }
    } catch (error) {
      const softDeleted = getSoftDeletedDestinationFromError(error);
      if (softDeleted) {
        setDeletedDestination(softDeleted);
        setRestoreModalOpen(true);
        return;
      }
      const message = getDestinationsErrorMessage(error);
      setFormError(message);
      if (mode === 'edit') {
        toast({
          title: tToast('saveError'),
          message,
          variant: 'error',
        });
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRestore() {
    if (!deletedDestination) return;
    setRestoring(true);
    setFormError(null);
    try {
      const restored = await getApiClient().restoreDestination(deletedDestination.id);
      setRestoreModalOpen(false);
      setDeletedDestination(null);
      toast({
        title: t('restoreModal.successTitle'),
        message: t('restoreModal.successMessage', { name: restored.name }),
        variant: 'success',
      });
      router.push(`/produits/destinations/${restored.id}`);
      router.refresh();
    } catch (error) {
      const message = getDestinationsErrorMessage(error);
      setFormError(message);
      setRestoreModalOpen(false);
      toast({
        title: tToast('saveError'),
        message,
        variant: 'error',
      });
    } finally {
      setRestoring(false);
    }
  }

  return (
    <>
      <Modal
        open={restoreModalOpen}
        onOpenChange={(open) => {
          setRestoreModalOpen(open);
          if (!open) {
            setDeletedDestination(null);
          }
        }}
        title={t('restoreModal.title')}
        description={t('restoreModal.description', {
          name: deletedDestination?.name ?? '—',
          slug: deletedDestination?.slug ?? '—',
        })}
        showClose
        closeAriaLabel={t('restoreModal.close')}
      >
        <div className="flex flex-wrap justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            disabled={restoring}
            onClick={() => {
              setRestoreModalOpen(false);
              setDeletedDestination(null);
            }}
          >
            {t('restoreModal.cancel')}
          </Button>
          <Button
            type="button"
            loading={restoring}
            loadingText={t('restoreModal.restoring')}
            onClick={() => void handleRestore()}
          >
            {t('restoreModal.confirm')}
          </Button>
        </div>
      </Modal>

    <form
      onSubmit={(e) => void handleSubmit(e)}
      className={mode === 'create' ? 'mx-auto w-full max-w-5xl space-y-6' : 'w-full space-y-6'}
    >
      {formError ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {formError}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:items-start xl:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <div className="min-w-0 space-y-8">
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-atg-fg">{t('sections.identity')}</h3>
            <Input
              label={tCommonColumns('name')}
              name="name"
              value={values.name}
              onChange={(e) => updateField('name', e.target.value)}
              error={fieldErrors.name}
              required
            />
            <Input
              label={tCommonColumns('slug')}
              name="slug"
              value={values.slug}
              onChange={(e) => {
                setSlugTouched(true);
                updateField('slug', e.target.value.toLowerCase());
              }}
              hint={t('slugHint')}
              error={fieldErrors.slug}
              required
            />
            <CountryCodeCombobox
              id={countryId}
              name="countryCode"
              label={t('countryCode')}
              value={values.countryCode}
              onChange={(code) => updateField('countryCode', code)}
              hint={t('countryCodeHint')}
              error={fieldErrors.countryCode}
              required
            />
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-atg-fg">{t('sections.presentation')}</h3>
            {hideHeroUrlField ? null : (
              <Input
                label={t('heroImageUrl')}
                type="url"
                value={values.imageUrl}
                onChange={(e) => updateField('imageUrl', e.target.value)}
                placeholder={tCommonForm('urlPlaceholder')}
                hint={t('heroImageHint')}
              />
            )}
            <div>
              <RichTextEditor
                label={tCommonForm('description')}
                value={values.description}
                onChange={(html) => updateField('description', html)}
                contentClassName="min-h-[140px]"
              />
            </div>
          </section>
        </div>

        <aside className="min-w-0 space-y-6 lg:sticky lg:top-6">
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-atg-fg">{t('sections.publication')}</h3>
            <Checkbox
              id="isFeatured"
              name="isFeatured"
              checked={values.isFeatured}
              onChange={(e) => updateField('isFeatured', e.target.checked)}
              label={t('isFeatured')}
            />
            <p className="text-xs text-atg-muted">{t('isFeaturedHint')}</p>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-atg-fg">{t('sections.geography')}</h3>
            <p className="text-xs text-atg-muted">{t('geographyIntro')}</p>
            <DestinationGeographyMap
              countryCode={values.countryCode}
              latitude={values.latitude}
              longitude={values.longitude}
              onCoordinateChange={(lat, lng) => {
                updateField('latitude', lat);
                updateField('longitude', lng);
              }}
            />
            <Input
              label={tCommonForm('latitude')}
              type="text"
              inputMode="decimal"
              value={values.latitude}
              onChange={(e) => updateField('latitude', e.target.value)}
              placeholder="-4.3058"
              hint={t('latitudeHint')}
              error={fieldErrors.latitude}
            />
            <Input
              label={tCommonForm('longitude')}
              type="text"
              inputMode="decimal"
              value={values.longitude}
              onChange={(e) => updateField('longitude', e.target.value)}
              placeholder="15.3000"
              hint={t('longitudeHint')}
              error={fieldErrors.longitude}
            />
          </section>
        </aside>
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <Button type="submit" loading={submitting} loadingText={tLoading('submit')}>
          {mode === 'create' ? t('submitCreate') : tActions('save')}
        </Button>
        <Button type="button" variant="outline" href="/produits/destinations">
          {tActions('cancel')}
        </Button>
      </div>
    </form>
    </>
  );
}

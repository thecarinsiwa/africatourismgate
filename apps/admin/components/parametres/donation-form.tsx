'use client';

import { Button, Card, Input } from '@africatourismgate/ui';
import type { CreateDonationRequest, Donation, DonationStatus } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useId, useState } from 'react';
import { isValidMediaUrl } from '../../lib/about/form-utils';
import { isRichTextEmpty } from '../../lib/rich-text';
import { getApiClient } from '../../lib/auth/api';
import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';
import { RichTextContent } from '../rich-text-content';
import { RichTextEditor, type RichTextUploadedAsset } from '../rich-text-editor';

export type DonationFormValues = {
  title: string;
  description: string;
  contextNote: string;
  buttonLabel: string;
  url: string;
  locale: string;
  showOnWeb: boolean;
  showOnGap: boolean;
  isNavbarFeatured: boolean;
  status: DonationStatus;
  sortOrder: string;
};

const defaultValues: DonationFormValues = {
  title: '',
  description: '',
  contextNote: '',
  buttonLabel: '',
  url: '',
  locale: 'fr',
  showOnWeb: true,
  showOnGap: true,
  isNavbarFeatured: false,
  status: 'draft',
  sortOrder: '0',
};

function donationToFormValues(donation: Donation): DonationFormValues {
  return {
    title: donation.title,
    description: donation.description ?? '',
    contextNote: donation.contextNote ?? '',
    buttonLabel: donation.buttonLabel,
    url: donation.url,
    locale: donation.locale,
    showOnWeb: donation.showOnWeb,
    showOnGap: donation.showOnGap,
    isNavbarFeatured: donation.isNavbarFeatured,
    status: donation.status,
    sortOrder: String(donation.sortOrder),
  };
}

function toPayload(values: DonationFormValues): CreateDonationRequest {
  return {
    title: values.title.trim(),
    description: !isRichTextEmpty(values.description) ? values.description : null,
    contextNote: values.contextNote.trim() || null,
    buttonLabel: values.buttonLabel.trim(),
    url: values.url.trim(),
    locale: values.locale,
    showOnWeb: values.showOnWeb,
    showOnGap: values.showOnGap,
    isNavbarFeatured: values.isNavbarFeatured,
    status: values.status,
    sortOrder: Number.parseInt(values.sortOrder, 10) || 0,
  };
}

type DonationFormProps = {
  mode: 'create' | 'edit';
  donationId?: string;
  initialDonation?: Donation;
  canWrite: boolean;
};

export function DonationForm({
  mode,
  donationId,
  initialDonation,
  canWrite,
}: DonationFormProps) {
  const { organizationSettings: getErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.settings.donations.form');
  const tStatus = useTranslations('modules.about.status');
  const tLocale = useTranslations('modules.about.locale');
  const tCommon = useTranslations('modules.common');
  const router = useRouter();

  const [values, setValues] = useState<DonationFormValues>(() =>
    initialDonation ? donationToFormValues(initialDonation) : defaultValues,
  );
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof DonationFormValues, string>>
  >({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const titleId = useId();
  const contextNoteId = useId();
  const buttonLabelId = useId();
  const urlId = useId();
  const localeId = useId();
  const statusId = useId();
  const sortOrderId = useId();

  const updateField = useCallback(
    <K extends keyof DonationFormValues>(key: K, value: DonationFormValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    [],
  );

  const handleUploadDescriptionAsset = useCallback(
    async (file: File): Promise<RichTextUploadedAsset> => {
      const body = new FormData();
      body.append('file', file);
      const payload = await getApiClient().uploadDonationDescriptionAsset(
        body,
        mode === 'edit' ? donationId : undefined,
      );
      return {
        url: payload.url,
        assetType: payload.assetType,
        name: file.name,
      };
    },
    [donationId, mode],
  );

  const validate = (): boolean => {
    const errors: Partial<Record<keyof DonationFormValues, string>> = {};
    if (!values.title.trim()) errors.title = t('validation.titleRequired');
    if (!values.buttonLabel.trim()) errors.buttonLabel = t('validation.buttonLabelRequired');
    const url = values.url.trim();
    if (!url) {
      errors.url = t('validation.urlRequired');
    } else if (!isValidMediaUrl(url)) {
      errors.url = t('validation.urlInvalid');
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

    try {
      const client = getApiClient();
      if (mode === 'edit' && donationId) {
        await client.updateDonation(donationId, payload);
      } else {
        await client.createDonation(payload);
      }
      router.push('/parametres/dons');
      router.refresh();
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={titleId} className="mb-1 block text-sm font-medium">
              {t('fields.title')}
            </label>
            <Input
              id={titleId}
              value={values.title}
              onChange={(e) => updateField('title', e.target.value)}
              disabled={!canWrite}
              required
              aria-invalid={Boolean(fieldErrors.title)}
            />
            {fieldErrors.title ? (
              <p className="mt-1 text-sm text-destructive">{fieldErrors.title}</p>
            ) : null}
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

        <div>
          <label htmlFor={contextNoteId} className="mb-1 block text-sm font-medium">
            {t('fields.contextNote')}
          </label>
          <Input
            id={contextNoteId}
            value={values.contextNote}
            onChange={(e) => updateField('contextNote', e.target.value)}
            disabled={!canWrite}
            placeholder={t('fields.contextNotePlaceholder')}
          />
        </div>

        {canWrite ? (
          <RichTextEditor
            label={t('fields.description')}
            value={values.description}
            onChange={(html) => updateField('description', html)}
            placeholder={t('fields.descriptionPlaceholder')}
            contentClassName="min-h-[160px]"
            onUploadAsset={handleUploadDescriptionAsset}
          />
        ) : values.description.trim() && !isRichTextEmpty(values.description) ? (
          <div>
            <p className="mb-1 text-sm font-medium">{t('fields.description')}</p>
            <RichTextContent html={values.description} />
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={buttonLabelId} className="mb-1 block text-sm font-medium">
              {t('fields.buttonLabel')}
            </label>
            <Input
              id={buttonLabelId}
              value={values.buttonLabel}
              onChange={(e) => updateField('buttonLabel', e.target.value)}
              disabled={!canWrite}
              required
              aria-invalid={Boolean(fieldErrors.buttonLabel)}
            />
            {fieldErrors.buttonLabel ? (
              <p className="mt-1 text-sm text-destructive">{fieldErrors.buttonLabel}</p>
            ) : null}
          </div>
          <div>
            <label htmlFor={urlId} className="mb-1 block text-sm font-medium">
              {t('fields.url')}
            </label>
            <Input
              id={urlId}
              type="url"
              value={values.url}
              onChange={(e) => updateField('url', e.target.value)}
              disabled={!canWrite}
              required
              aria-invalid={Boolean(fieldErrors.url)}
            />
            {fieldErrors.url ? (
              <p className="mt-1 text-sm text-destructive">{fieldErrors.url}</p>
            ) : null}
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
              onChange={(e) => updateField('status', e.target.value as DonationStatus)}
              disabled={!canWrite}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="draft">{tStatus('draft')}</option>
              <option value="published">{tStatus('published')}</option>
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

        <fieldset className="space-y-2 rounded-lg border border-input p-4">
          <legend className="px-1 text-sm font-medium">{t('fields.visibility')}</legend>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={values.showOnWeb}
              onChange={(e) => updateField('showOnWeb', e.target.checked)}
              disabled={!canWrite}
            />
            {t('surfaces.web')}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={values.showOnGap}
              onChange={(e) => updateField('showOnGap', e.target.checked)}
              disabled={!canWrite}
            />
            {t('surfaces.gap')}
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-primary">
            <input
              type="checkbox"
              checked={values.isNavbarFeatured}
              onChange={(e) => updateField('isNavbarFeatured', e.target.checked)}
              disabled={!canWrite}
            />
            {t('fields.navbarFeatured')}
          </label>
          <p className="text-xs text-muted-foreground">{t('fields.navbarFeaturedHint')}</p>
        </fieldset>

        {submitError ? <p className="text-sm text-destructive">{submitError}</p> : null}

        <div className="flex flex-wrap gap-2">
          {canWrite ? (
            <Button type="submit" disabled={saving}>
              {saving ? t('saving') : t('saveButton')}
            </Button>
          ) : null}
          <Button type="button" variant="outline" onClick={() => router.push('/parametres/dons')}>
            {t('cancelButton')}
          </Button>
        </div>
      </form>
    </Card>
  );
}

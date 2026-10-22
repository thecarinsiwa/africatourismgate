'use client';

import { Button, Card, DataTableBadge, Input, useToast } from '@africatourismgate/ui';
import type {
  CreateHappyCustomersSectionRequest,
  HappyCustomersSection,
  HappyCustomersStatus,
} from '@africatourismgate/types';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useId, useState } from 'react';
import { isValidMediaUrl } from '../../lib/about/form-utils';
import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';
import { getApiClient, resolveApiBaseUrl } from '../../lib/auth/api';
import { getSession } from '../../lib/auth/session';
import { resolveMediaUrl } from '../../lib/resolve-media-url';

const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

type SectionFormValues = {
  title: string;
  subtitle: string;
  paragraph1: string;
  paragraph2: string;
  imageUrl: string;
  imageAlt: string;
  badgeValue: string;
  badgeLabel: string;
  status: HappyCustomersStatus;
};

const emptyValues: SectionFormValues = {
  title: '',
  subtitle: '',
  paragraph1: '',
  paragraph2: '',
  imageUrl: '',
  imageAlt: '',
  badgeValue: '10K+',
  badgeLabel: 'Clients',
  status: 'draft',
};

type HappyCustomersSectionFormProps = {
  locale: string;
  onSaved?: () => void;
};

export function HappyCustomersSectionForm({ locale, onSaved }: HappyCustomersSectionFormProps) {
  const { about: getAboutErrorMessage } = useAdminErrorMessages();
  const { toast } = useToast();
  const t = useTranslations('modules.about.happyCustomers.section');
  const tStatus = useTranslations('modules.about.status');
  const tCommon = useTranslations('modules.common');
  const tCommonForm = useTranslations('modules.common.form');
  const tToast = useTranslations('modules.common.toast');
  const tValidation = useTranslations('modules.common.validation');

  const [sectionId, setSectionId] = useState<string | null>(null);
  const [values, setValues] = useState<SectionFormValues>(emptyValues);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrlError, setImageUrlError] = useState<string | null>(null);
  const [canWrite, setCanWrite] = useState(false);
  /** Collapsed by default so the stats list stays above the fold. */
  const [expanded, setExpanded] = useState(false);

  const titleId = useId();
  const subtitleId = useId();
  const paragraph1Id = useId();
  const paragraph2Id = useId();
  const imageInputId = useId();
  const imageUrlId = useId();
  const imageAltId = useId();
  const badgeValueId = useId();
  const badgeLabelId = useId();
  const statusId = useId();

  useEffect(() => {
    let cancelled = false;
    void getApiClient()
      .getAuthMe()
      .then((me) => {
        if (!cancelled) {
          setCanWrite(me.isSuperAdmin || me.permissions.includes('content.write'));
        }
      })
      .catch(() => {
        if (!cancelled) setCanWrite(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const loadSection = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getApiClient().listHappyCustomersSections({ locale, limit: 1 });
      const section = result.data[0] as HappyCustomersSection | undefined;
      if (section) {
        setSectionId(section.id);
        setValues({
          title: section.title,
          subtitle: section.subtitle,
          paragraph1: section.paragraph1,
          paragraph2: section.paragraph2,
          imageUrl: section.imageUrl,
          imageAlt: section.imageAlt,
          badgeValue: section.badgeValue,
          badgeLabel: section.badgeLabel,
          status: section.status,
        });
      } else {
        setSectionId(null);
        setValues(emptyValues);
        setExpanded(true);
      }
    } catch (err) {
      setError(getAboutErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [getAboutErrorMessage, locale]);

  useEffect(() => {
    void loadSection();
  }, [loadSection]);

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
        setImageUrlError(tValidation('imageFormat'));
        return;
      }
      if (file.size > IMAGE_MAX_BYTES) {
        setImageUrlError(tValidation('imageTooLarge'));
        return;
      }
      const session = getSession();
      if (!session?.accessToken) {
        setImageUrlError(tValidation('sessionExpiredRetry'));
        return;
      }

      setUploadingImage(true);
      setImageUrlError(null);
      const body = new FormData();
      body.append('file', file);
      const response = await fetch(`${resolveApiBaseUrl()}/happy-customers-sections/upload-image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.accessToken}` },
        body,
      });
      if (!response.ok) throw new Error('Upload failed');
      const payload = (await response.json()) as { url?: string };
      if (!payload.url) throw new Error('Invalid upload response');
      setValues((prev) => ({ ...prev, imageUrl: payload.url! }));
    } catch {
      setImageUrlError(tValidation('uploadFailed'));
    } finally {
      setUploadingImage(false);
      event.target.value = '';
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canWrite) return;

    const imageUrl = values.imageUrl.trim();
    if (!imageUrl) {
      setImageUrlError(t('validation.imageUrlRequired'));
      return;
    }
    if (!isValidMediaUrl(imageUrl)) {
      setImageUrlError(t('validation.imageUrlInvalid'));
      return;
    }
    setImageUrlError(null);

    setSaving(true);
    setError(null);

    const payload: CreateHappyCustomersSectionRequest = {
      title: values.title.trim(),
      subtitle: values.subtitle.trim(),
      paragraph1: values.paragraph1.trim(),
      paragraph2: values.paragraph2.trim(),
      imageUrl: values.imageUrl.trim(),
      imageAlt: values.imageAlt.trim(),
      badgeValue: values.badgeValue.trim(),
      badgeLabel: values.badgeLabel.trim(),
      status: values.status,
      locale,
    };

    try {
      const client = getApiClient();
      if (sectionId) {
        await client.updateHappyCustomersSection(sectionId, payload);
      } else {
        const created = await client.createHappyCustomersSection(payload);
        setSectionId(created.id);
      }
      toast({ variant: 'success', message: tToast('saved') });
      setExpanded(false);
      onSaved?.();
    } catch (err) {
      const message = getAboutErrorMessage(err);
      setError(message);
      toast({ variant: 'error', message });
    } finally {
      setSaving(false);
    }
  };

  const busy = saving || uploadingImage;

  if (loading) {
    return <p className="text-sm text-muted-foreground">{tCommonForm('loading')}</p>;
  }

  const summaryTitle = values.title.trim() || t('emptyTitle');
  const summarySubtitle = values.subtitle.trim();
  const summaryBadge =
    values.badgeValue.trim() && values.badgeLabel.trim()
      ? `${values.badgeValue.trim()} ${values.badgeLabel.trim()}`
      : null;

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-atg-border px-4 py-3 sm:px-6">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-semibold text-atg-fg">{t('heading')}</h2>
            <DataTableBadge variant={values.status === 'published' ? 'success' : 'muted'}>
              {values.status === 'published' ? tStatus('published') : tStatus('draft')}
            </DataTableBadge>
            {summaryBadge ? (
              <span className="rounded-md bg-atg-muted/15 px-2 py-0.5 text-xs font-medium text-atg-fg">
                {summaryBadge}
              </span>
            ) : null}
          </div>
          {!expanded ? (
            <p className="mt-1 truncate text-sm text-atg-muted" title={summarySubtitle || undefined}>
              <span className="font-medium text-atg-fg">{summaryTitle}</span>
              {summarySubtitle ? ` — ${summarySubtitle}` : null}
            </p>
          ) : (
            <p className="mt-1 text-xs text-atg-muted">{t('hint')}</p>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
        >
          {expanded ? t('collapse') : t('expand')}
        </Button>
      </div>

      {expanded ? (
        <form onSubmit={handleSubmit} className="space-y-6 p-4 sm:p-6">
          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold text-atg-fg">{t('groups.content')}</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor={titleId} className="mb-1 block text-sm font-medium">
                  {t('fields.title')}
                </label>
                <Input
                  id={titleId}
                  value={values.title}
                  onChange={(e) => setValues((prev) => ({ ...prev, title: e.target.value }))}
                  disabled={!canWrite}
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor={subtitleId} className="mb-1 block text-sm font-medium">
                  {t('fields.subtitle')}
                </label>
                <textarea
                  id={subtitleId}
                  value={values.subtitle}
                  onChange={(e) => setValues((prev) => ({ ...prev, subtitle: e.target.value }))}
                  disabled={!canWrite}
                  required
                  rows={2}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor={paragraph1Id} className="mb-1 block text-sm font-medium">
                  {t('fields.paragraph1')}
                </label>
                <textarea
                  id={paragraph1Id}
                  value={values.paragraph1}
                  onChange={(e) => setValues((prev) => ({ ...prev, paragraph1: e.target.value }))}
                  disabled={!canWrite}
                  required
                  rows={3}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor={paragraph2Id} className="mb-1 block text-sm font-medium">
                  {t('fields.paragraph2')}
                </label>
                <textarea
                  id={paragraph2Id}
                  value={values.paragraph2}
                  onChange={(e) => setValues((prev) => ({ ...prev, paragraph2: e.target.value }))}
                  disabled={!canWrite}
                  required
                  rows={3}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label htmlFor={statusId} className="mb-1 block text-sm font-medium">
                  {tCommon('columns.status')}
                </label>
                <select
                  id={statusId}
                  value={values.status}
                  onChange={(e) =>
                    setValues((prev) => ({
                      ...prev,
                      status: e.target.value as HappyCustomersStatus,
                    }))
                  }
                  disabled={!canWrite}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="draft">{tStatus('draft')}</option>
                  <option value="published">{tStatus('published')}</option>
                </select>
                <p className="mt-1 text-xs text-atg-muted">{t('statusHint')}</p>
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-4 border-t border-atg-border pt-6">
            <legend className="text-sm font-semibold text-atg-fg">{t('groups.media')}</legend>
            <div className="space-y-3">
              {values.imageUrl.trim() ? (
                <div className="space-y-2">
                  <Image
                    src={resolveMediaUrl(values.imageUrl.trim())}
                    alt={values.imageAlt.trim() || t('fields.imagePreviewAlt')}
                    width={960}
                    height={540}
                    unoptimized
                    className="aspect-[4/3] h-auto w-full max-w-xl rounded-lg border border-atg-border object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  {canWrite ? (
                    <button
                      type="button"
                      onClick={() => {
                        setValues((prev) => ({ ...prev, imageUrl: '' }));
                        setImageUrlError(null);
                      }}
                      className="text-xs font-medium text-red-600 hover:underline dark:text-red-400"
                    >
                      {t('fields.removeImage')}
                    </button>
                  ) : null}
                </div>
              ) : null}
              {canWrite ? (
                <div className="flex flex-wrap items-center gap-3">
                  <label
                    htmlFor={imageInputId}
                    className="inline-flex cursor-pointer items-center rounded-md border border-atg-border px-3 py-2 text-xs font-medium text-atg-fg hover:bg-atg-muted/10"
                  >
                    {uploadingImage ? tCommonForm('uploading') : tCommonForm('chooseFile')}
                    <input
                      id={imageInputId}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="sr-only"
                      disabled={busy}
                      onChange={handleImageUpload}
                    />
                  </label>
                  <span className="text-xs text-atg-muted">{t('fields.imageUploadHint')}</span>
                </div>
              ) : null}
              <Input
                id={imageUrlId}
                label={t('fields.imageUrl')}
                type="url"
                value={values.imageUrl}
                onChange={(e) => {
                  setValues((prev) => ({ ...prev, imageUrl: e.target.value }));
                  setImageUrlError(null);
                }}
                placeholder={tCommonForm('urlPlaceholder')}
                error={imageUrlError ?? undefined}
                disabled={!canWrite}
                required
              />
              <div>
                <label htmlFor={imageAltId} className="mb-1 block text-sm font-medium">
                  {t('fields.imageAlt')}
                </label>
                <Input
                  id={imageAltId}
                  value={values.imageAlt}
                  onChange={(e) => setValues((prev) => ({ ...prev, imageAlt: e.target.value }))}
                  disabled={!canWrite}
                  required
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-4 border-t border-atg-border pt-6">
            <legend className="text-sm font-semibold text-atg-fg">{t('groups.badge')}</legend>
            <p className="text-xs text-atg-muted">{t('badgeHint')}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor={badgeValueId} className="mb-1 block text-sm font-medium">
                  {t('fields.badgeValue')}
                </label>
                <Input
                  id={badgeValueId}
                  value={values.badgeValue}
                  onChange={(e) => setValues((prev) => ({ ...prev, badgeValue: e.target.value }))}
                  disabled={!canWrite}
                  required
                />
              </div>
              <div>
                <label htmlFor={badgeLabelId} className="mb-1 block text-sm font-medium">
                  {t('fields.badgeLabel')}
                </label>
                <Input
                  id={badgeLabelId}
                  value={values.badgeLabel}
                  onChange={(e) => setValues((prev) => ({ ...prev, badgeLabel: e.target.value }))}
                  disabled={!canWrite}
                  required
                />
              </div>
            </div>
          </fieldset>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          {canWrite ? (
            <Button type="submit" loading={saving} loadingText={t('saving')} disabled={busy}>
              {t('saveButton')}
            </Button>
          ) : null}
        </form>
      ) : null}
    </Card>
  );
}

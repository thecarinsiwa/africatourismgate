'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { Button, Input } from '@africatourismgate/ui';
import type { Promotion } from '@africatourismgate/types';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useId, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { resolveMediaUrl } from '../../lib/resolve-media-url';

const COVER_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_COVER_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

type PromotionCoverImageSectionProps = {
  promotionId: string;
  coverImageUrl: string | null;
  onSaved: (promotion: Promotion) => void;
};

export function PromotionCoverImageSection({
  promotionId,
  coverImageUrl,
  onSaved,
}: PromotionCoverImageSectionProps) {
  const { promotions: getPromotionsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.promotions.coverImage');
  const tCommonForm = useTranslations('modules.common.form');
  const tCommon = useTranslations('modules.common');
  const fileInputId = useId();
  const [urlInput, setUrlInput] = useState(coverImageUrl ?? '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setUrlInput(coverImageUrl ?? '');
  }, [coverImageUrl]);

  const saveCover = useCallback(
    async (nextUrl: string | null) => {
      setSaving(true);
      setError(null);
      try {
        const updated = await getApiClient().updatePromotion(promotionId, {
          coverImageUrl: nextUrl,
        });
        setUrlInput(nextUrl ?? '');
        onSaved(updated);
      } catch (err) {
        setError(getPromotionsErrorMessage(err));
      } finally {
        setSaving(false);
      }
    },
    [getPromotionsErrorMessage, onSaved, promotionId],
  );

  async function handleCoverImagePick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      if (!ALLOWED_COVER_IMAGE_TYPES.has(file.type)) {
        setError(tCommon('validation.imageFormat'));
        return;
      }
      if (file.size > COVER_IMAGE_MAX_BYTES) {
        setError(tCommon('validation.imageTooLarge'));
        return;
      }
      setUploading(true);
      setError(null);
      const body = new FormData();
      body.append('file', file);
      const { url } = await getApiClient().uploadPromotionImage(promotionId, body);
      await saveCover(url);
    } catch {
      setError(tCommon('validation.uploadFailed'));
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  }

  async function handleUrlSave(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = urlInput.trim();
    await saveCover(trimmed || null);
  }

  const previewUrl = (coverImageUrl ?? '').trim();

  return (
    <section className="space-y-4 rounded-xl border border-atg-border bg-atg-elevated p-4 sm:p-5">
      <div>
        <h3 className="text-sm font-semibold text-atg-fg">{t('title')}</h3>
        <p className="mt-1 text-sm text-atg-muted">{t('hint')}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-start">
        {previewUrl ? (
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-atg-border">
            <Image
              src={resolveMediaUrl(previewUrl)}
              alt={t('previewAlt')}
              fill
              unoptimized
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 22rem"
            />
          </div>
        ) : (
          <div className="flex aspect-[16/9] w-full items-center justify-center rounded-lg border border-dashed border-atg-border bg-atg-muted/5 px-4 text-center text-sm text-atg-muted">
            {t('empty')}
          </div>
        )}

        <div className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <label
              htmlFor={fileInputId}
              className="inline-flex cursor-pointer items-center rounded-md border border-atg-border px-3 py-2 text-xs font-medium text-atg-fg hover:bg-atg-muted/10"
            >
              {uploading || saving ? tCommonForm('uploading') : t('upload')}
              <input
                id={fileInputId}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => void handleCoverImagePick(e)}
                disabled={uploading || saving}
              />
            </label>
            {previewUrl ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={saving || uploading}
                onClick={() => void saveCover(null)}
              >
                {t('remove')}
              </Button>
            ) : null}
            <span className="text-xs text-atg-muted">{tCommonForm('imageFormatHint')}</span>
          </div>

          <form
            onSubmit={(e) => void handleUrlSave(e)}
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
          >
            <div className="flex-1">
              <Input
                label={tCommonForm('externalUrlOptional')}
                name="coverImageUrl"
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder={tCommonForm('urlPlaceholder')}
              />
            </div>
            <Button
              type="submit"
              variant="outline"
              loading={saving}
              loadingText={t('saving')}
              disabled={uploading}
            >
              {t('saveUrl')}
            </Button>
          </form>
        </div>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}
    </section>
  );
}

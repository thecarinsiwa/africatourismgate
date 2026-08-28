'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { Button, Input } from '@africatourismgate/ui';
import type { Package, PackageImage } from '@africatourismgate/types';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useId, useState } from 'react';
import { getApiClient, resolveApiBaseUrl } from '../../lib/auth/api';
import { getSession } from '../../lib/auth/session';
import { resolveMediaUrl } from '../../lib/resolve-media-url';

const COVER_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_COVER_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

type PackageCoverImageSectionProps = {
  packageId: string;
  coverImageUrl: string | null;
  onSaved: (pkg: Package) => void;
  refreshKey?: number;
};

export function PackageCoverImageSection({
  packageId,
  coverImageUrl,
  onSaved,
  refreshKey = 0,
}: PackageCoverImageSectionProps) {
  const { packages: getPackagesErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.packages.coverImage');
  const tCommonForm = useTranslations('modules.common.form');
  const tCommon = useTranslations('modules.common');
  const coverFileInputId = useId();
  const [urlInput, setUrlInput] = useState(coverImageUrl ?? '');
  const [galleryImages, setGalleryImages] = useState<PackageImage[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setUrlInput(coverImageUrl ?? '');
  }, [coverImageUrl]);

  const loadGallery = useCallback(async () => {
    setGalleryLoading(true);
    try {
      const result = await getApiClient().listPackageImages({
        packageId,
        page: 1,
        limit: 100,
      });
      setGalleryImages(result.data);
    } catch {
      setGalleryImages([]);
    } finally {
      setGalleryLoading(false);
    }
  }, [packageId]);

  useEffect(() => {
    void loadGallery();
  }, [loadGallery, refreshKey]);

  const saveCover = useCallback(
    async (nextUrl: string | null) => {
      setSaving(true);
      setError(null);
      try {
        const updated = await getApiClient().updatePackage(packageId, {
          coverImageUrl: nextUrl,
        });
        setUrlInput(nextUrl ?? '');
        onSaved(updated);
      } catch (err) {
        setError(getPackagesErrorMessage(err));
      } finally {
        setSaving(false);
      }
    },
    [getPackagesErrorMessage, onSaved, packageId],
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
      const session = getSession();
      if (!session?.accessToken) {
        setError(tCommon('validation.sessionExpiredRetry'));
        return;
      }
      setUploading(true);
      setError(null);
      const body = new FormData();
      body.append('file', file);
      const response = await fetch(`${resolveApiBaseUrl()}/packages/${packageId}/upload-image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.accessToken}` },
        body,
      });
      if (!response.ok) {
        throw new Error('Upload cover image failed');
      }
      const payload = (await response.json()) as { url?: string };
      if (!payload.url) {
        throw new Error('Invalid upload response');
      }
      await saveCover(payload.url);
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
    <section className="space-y-4">
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
              htmlFor={coverFileInputId}
              className="inline-flex cursor-pointer items-center rounded-md border border-atg-border px-3 py-2 text-xs font-medium text-atg-fg hover:bg-atg-muted/10"
            >
              {uploading || saving ? tCommonForm('uploading') : t('upload')}
              <input
                id={coverFileInputId}
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

          {galleryImages.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-atg-fg">{t('pickFromGallery')}</p>
              <div className="flex flex-wrap gap-2">
                {galleryImages.map((image) => {
                  const isActive = previewUrl === image.url.trim();
                  return (
                    <button
                      key={image.id}
                      type="button"
                      disabled={saving || uploading || isActive}
                      onClick={() => void saveCover(image.url)}
                      className="relative h-16 w-24 overflow-hidden rounded-md border border-atg-border transition hover:ring-2 hover:ring-primary disabled:opacity-60"
                      title={image.caption ?? undefined}
                    >
                      <Image
                        src={resolveMediaUrl(image.url)}
                        alt={image.caption ?? t('galleryThumbAlt')}
                        fill
                        unoptimized
                        className="object-cover"
                        sizes="96px"
                      />
                      {isActive ? (
                        <span className="absolute inset-0 flex items-center justify-center bg-primary/30 text-[10px] font-semibold text-white">
                          {t('current')}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : galleryLoading ? (
            <p className="text-sm text-atg-muted">{tCommon('loading')}</p>
          ) : (
            <p className="text-sm text-atg-muted">{t('noGalleryImages')}</p>
          )}
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

'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { Button, Card, Input } from '@africatourismgate/ui';
import type { CreatePackageRequest, Package } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { RichTextEditor, type RichTextUploadedAsset } from '../rich-text-editor';
import { getApiClient, resolveApiBaseUrl } from '../../lib/auth/api';
import { isRichTextEmpty } from '../../lib/rich-text';
import { getSession } from '../../lib/auth/session';
import { PackageDescriptionAssetsSection } from './package-description-assets-section';

export type PackageFormValues = {
  name: string;
  description: string;
  discountPercent: string;
  durationDays: string;
  active: boolean;
  isFeatured: boolean;
};

const defaultValues: PackageFormValues = {
  name: '',
  description: '',
  discountPercent: '0',
  durationDays: '3',
  active: true,
  isFeatured: false,
};

function packageToFormValues(pkg: Package): PackageFormValues {
  return {
    name: pkg.name,
    description: pkg.description ?? '',
    discountPercent: String(pkg.discountPercent),
    durationDays: String(pkg.durationDays ?? 3),
    active: pkg.active === 1,
    isFeatured: pkg.isFeatured === 1,
  };
}

function toPayload(values: PackageFormValues): CreatePackageRequest {
  return {
    name: values.name.trim(),
    discountPercent: Number(values.discountPercent),
    durationDays: Number(values.durationDays),
    active: values.active,
    isFeatured: values.isFeatured,
    ...(values.description.trim() && !isRichTextEmpty(values.description)
      ? { description: values.description.trim() }
      : {}),
  };
}

type PackageFormProps = {
  mode: 'create' | 'edit';
  packageId?: string;
  initialPackage?: Package;
};

export function PackageForm({ mode, packageId, initialPackage }: PackageFormProps) {
  const { packages: getPackagesErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.packages.form');
  const tCommon = useTranslations('modules.common');
  const tActions = useTranslations('common.actions');
  const router = useRouter();
  const [values, setValues] = useState<PackageFormValues>(() =>
    initialPackage ? packageToFormValues(initialPackage) : defaultValues,
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleUploadDescriptionAsset = useCallback(
    async (file: File): Promise<RichTextUploadedAsset> => {
      const session = getSession();
      if (!session?.accessToken) {
        throw new Error('Session expirée');
      }
      const body = new FormData();
      body.append('file', file);
      const uploadPath = packageId
        ? `/packages/${packageId}/upload-description-asset`
        : '/packages/upload-description-asset';
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
    [packageId],
  );

  const updateField = useCallback(
    <K extends keyof PackageFormValues>(key: K, value: PackageFormValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  function validate(): boolean {
    if (!values.name.trim()) {
      setFormError(tCommon('validation.nameRequired'));
      return false;
    }
    const discount = Number(values.discountPercent);
    if (!Number.isFinite(discount) || discount < 0 || discount > 100) {
      setFormError(tCommon('validation.discountRange'));
      return false;
    }
    const durationDays = Number(values.durationDays);
    if (!Number.isFinite(durationDays) || durationDays < 1 || durationDays > 365) {
      setFormError(tCommon('validation.durationDaysRange'));
      return false;
    }
    return true;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      const body = toPayload(values);
      if (mode === 'create') {
        const created = await getApiClient().createPackage(body);
        router.push(`/produits/forfaits/${created.id}`);
      } else if (packageId) {
        await getApiClient().updatePackage(packageId, body);
        router.refresh();
      }
    } catch (error) {
      setFormError(getPackagesErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {formError ? (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400"
        >
          {formError}
        </p>
      ) : null}

      <Card variant="dashboard" className="space-y-4">
        <h3 className="text-sm font-semibold text-atg-fg">{t('sections.identity')}</h3>
        <Input
          label={t('packageName')}
          value={values.name}
          onChange={(e) => updateField('name', e.target.value)}
          required
        />
        <RichTextEditor
          label={tCommon('form.description')}
          value={values.description}
          onChange={(html) => updateField('description', html)}
          placeholder={t('descriptionPlaceholder')}
          onUploadAsset={handleUploadDescriptionAsset}
        />
      </Card>

      <PackageDescriptionAssetsSection packageId={packageId} />

      <Card variant="dashboard" className="space-y-4">
        <h3 className="text-sm font-semibold text-atg-fg">{t('sections.pricing')}</h3>
        <Input
          label={t('discountPercent')}
          type="number"
          min={0}
          max={100}
          step={0.01}
          value={values.discountPercent}
          onChange={(e) => updateField('discountPercent', e.target.value)}
        />
        <Input
          label={t('durationDays')}
          type="number"
          min={1}
          max={365}
          value={values.durationDays}
          onChange={(e) => updateField('durationDays', e.target.value)}
        />
      </Card>

      <Card variant="dashboard" className="space-y-4">
        <h3 className="text-sm font-semibold text-atg-fg">{t('sections.publication')}</h3>
        <label className="flex items-center gap-2 text-sm text-atg-fg">
          <input
            type="checkbox"
            checked={values.active}
            onChange={(e) => updateField('active', e.target.checked)}
            className="rounded border-atg-border"
          />
          {t('activeLabel')}
        </label>
        <label className="flex items-center gap-2 text-sm text-atg-fg">
          <input
            type="checkbox"
            checked={values.isFeatured}
            onChange={(e) => updateField('isFeatured', e.target.checked)}
            className="rounded border-atg-border"
          />
          {t('featuredLabel')}
        </label>
        <p className="text-xs text-atg-muted">{t('featuredHint')}</p>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" loading={submitting}>
          {mode === 'create' ? t('submitCreate') : tActions('save')}
        </Button>
        <Button type="button" variant="outline" href="/produits/forfaits">
          {tActions('cancel')}
        </Button>
      </div>
    </form>
  );
}

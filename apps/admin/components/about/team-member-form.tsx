'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { Button, Card, Input, Select, Textarea } from '@africatourismgate/ui';
import type {
  CreateTeamMemberRequest,
  TeamMember,
  TeamMemberStatus,
} from '@africatourismgate/types';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useId, useMemo, useState } from 'react';
import { isValidMediaUrl } from '../../lib/about/form-utils';
import { getApiClient, resolveApiBaseUrl } from '../../lib/auth/api';
import { getSession } from '../../lib/auth/session';
import { usePermissions } from '../../lib/auth/use-permissions';
import { useContentLocaleOptions } from '../../lib/content/use-content-locale-options';
import { resolveMediaUrl } from '../../lib/resolve-media-url';

export const ABOUT_TEAM_HUB_HREF = '/contenu/site?tab=about-team';

const PHOTO_MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export type TeamMemberFormValues = {
  name: string;
  role: string;
  bio: string;
  photoUrl: string;
  sortOrder: string;
  status: TeamMemberStatus;
  locale: string;
};

const defaultValues: TeamMemberFormValues = {
  name: '',
  role: '',
  bio: '',
  photoUrl: '',
  sortOrder: '0',
  status: 'draft',
  locale: 'fr',
};

function teamMemberToFormValues(member: TeamMember): TeamMemberFormValues {
  return {
    name: member.name,
    role: member.role,
    bio: member.bio ?? '',
    photoUrl: member.photoUrl ?? '',
    sortOrder: String(member.sortOrder),
    status: member.status,
    locale: member.locale,
  };
}

function toPayload(values: TeamMemberFormValues): CreateTeamMemberRequest {
  return {
    name: values.name.trim(),
    role: values.role.trim(),
    bio: values.bio.trim() || null,
    photoUrl: values.photoUrl.trim() || null,
    sortOrder: Number.parseInt(values.sortOrder, 10) || 0,
    status: values.status,
    locale: values.locale,
  };
}

type TeamMemberFormProps = {
  mode: 'create' | 'edit';
  memberId?: string;
  initialMember?: TeamMember;
  defaultLocale?: string;
  cancelHref?: string;
};

export function TeamMemberForm({
  mode,
  memberId,
  initialMember,
  defaultLocale = 'fr',
  cancelHref = ABOUT_TEAM_HUB_HREF,
}: TeamMemberFormProps) {
  const { about: getAboutErrorMessage } = useAdminErrorMessages();
  const { hasPermission, isSuperAdmin } = usePermissions();
  const canWrite = isSuperAdmin || hasPermission('content.write');
  const t = useTranslations('modules.about.team.form');
  const tCommon = useTranslations('modules.common');
  const tCommonForm = useTranslations('modules.common.form');
  const tValidation = useTranslations('modules.common.validation');
  const tStatus = useTranslations('modules.about.status');
  const localeOptions = useContentLocaleOptions('modules.about.locale');
  const router = useRouter();
  const photoFileInputId = useId();

  const [values, setValues] = useState<TeamMemberFormValues>(() =>
    initialMember
      ? teamMemberToFormValues(initialMember)
      : { ...defaultValues, locale: defaultLocale },
  );
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof TeamMemberFormValues, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const statusOptions = useMemo(
    () =>
      (['draft', 'published'] as const).map((status) => ({
        value: status,
        label: tStatus(status),
      })),
    [tStatus],
  );

  const updateField = useCallback(
    <K extends keyof TeamMemberFormValues>(key: K, value: TeamMemberFormValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    [],
  );

  async function handlePhotoPick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      if (!ALLOWED_PHOTO_TYPES.has(file.type)) {
        setFieldErrors((prev) => ({ ...prev, photoUrl: tValidation('imageFormat') }));
        return;
      }
      if (file.size > PHOTO_MAX_BYTES) {
        setFieldErrors((prev) => ({ ...prev, photoUrl: tValidation('imageTooLarge') }));
        return;
      }
      const session = getSession();
      if (!session?.accessToken) {
        setFieldErrors((prev) => ({ ...prev, photoUrl: tValidation('sessionExpiredRetry') }));
        return;
      }
      setUploadingPhoto(true);
      setFieldErrors((prev) => ({ ...prev, photoUrl: undefined }));
      const body = new FormData();
      body.append('file', file);
      const response = await fetch(`${resolveApiBaseUrl()}/team-members/upload-photo`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.accessToken}` },
        body,
      });
      if (!response.ok) throw new Error('Upload failed');
      const payload = (await response.json()) as { url?: string };
      if (!payload.url) throw new Error('Invalid upload response');
      updateField('photoUrl', payload.url);
    } catch {
      setFieldErrors((prev) => ({ ...prev, photoUrl: tValidation('uploadFailed') }));
    } finally {
      setUploadingPhoto(false);
      event.target.value = '';
    }
  }

  function validate(): boolean {
    const errors: Partial<Record<keyof TeamMemberFormValues, string>> = {};
    if (!values.name.trim()) errors.name = t('validation.nameRequired');
    if (!values.role.trim()) errors.role = t('validation.roleRequired');
    const photoUrl = values.photoUrl.trim();
    if (photoUrl && !isValidMediaUrl(photoUrl)) {
      errors.photoUrl = t('validation.photoUrlInvalid');
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canWrite) return;
    setFormError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const client = getApiClient();
      const payload = toPayload(values);
      if (mode === 'create') {
        const created = await client.createTeamMember(payload);
        router.push(`/contenu/a-propos/equipe/${created.id}`);
        router.refresh();
      } else if (memberId) {
        await client.updateTeamMember(memberId, payload);
        router.push(cancelHref);
        router.refresh();
      }
    } catch (error) {
      setFormError(getAboutErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  const busy = submitting || uploadingPhoto;

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-lg border border-atg-border bg-atg-elevated/50 px-4 py-3 text-sm text-atg-muted">
          <p>{t('info.sectionHint')}</p>
        </div>

        {formError ? (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400"
          >
            {formError}
          </p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label={t('fields.locale')}
            value={values.locale}
            options={localeOptions}
            onChange={(e) => updateField('locale', e.target.value)}
            disabled={!canWrite}
          />
          <Select
            label={tCommon('columns.status')}
            value={values.status}
            options={statusOptions}
            onChange={(e) => updateField('status', e.target.value as TeamMemberStatus)}
            disabled={!canWrite}
          />
        </div>

        <Input
          label={t('fields.name')}
          name="name"
          value={values.name}
          onChange={(e) => updateField('name', e.target.value)}
          error={fieldErrors.name}
          required
          disabled={!canWrite}
        />
        <Input
          label={t('fields.role')}
          name="role"
          value={values.role}
          onChange={(e) => updateField('role', e.target.value)}
          error={fieldErrors.role}
          required
          disabled={!canWrite}
        />

        <Textarea
          label={t('fields.bio')}
          name="bio"
          rows={4}
          value={values.bio}
          onChange={(e) => updateField('bio', e.target.value)}
          disabled={!canWrite}
        />

        <div className="space-y-3">
          <p className="text-sm font-medium text-atg-fg">{t('fields.photo')}</p>
          {values.photoUrl.trim() ? (
            <div className="space-y-2">
              <Image
                src={resolveMediaUrl(values.photoUrl.trim())}
                alt={t('fields.photoPreviewAlt')}
                width={160}
                height={160}
                unoptimized
                className="h-32 w-32 rounded-full border border-atg-border object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              {canWrite ? (
                <button
                  type="button"
                  onClick={() => updateField('photoUrl', '')}
                  className="text-xs font-medium text-red-600 hover:underline dark:text-red-400"
                >
                  {t('fields.removePhoto')}
                </button>
              ) : null}
            </div>
          ) : null}
          {canWrite ? (
            <div className="flex flex-wrap items-center gap-3">
              <label
                htmlFor={photoFileInputId}
                className="inline-flex cursor-pointer items-center rounded-md border border-atg-border px-3 py-2 text-xs font-medium text-atg-fg hover:bg-atg-muted/10"
              >
                {uploadingPhoto ? tCommonForm('uploading') : tCommonForm('chooseFile')}
                <input
                  id={photoFileInputId}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(e) => void handlePhotoPick(e)}
                  disabled={busy}
                />
              </label>
              <span className="text-xs text-atg-muted">{t('hints.photoUpload')}</span>
            </div>
          ) : null}
          <Input
            label={tCommonForm('externalUrlOptional')}
            name="photoUrl"
            type="url"
            value={values.photoUrl}
            onChange={(e) => updateField('photoUrl', e.target.value)}
            placeholder={tCommonForm('urlPlaceholder')}
            error={fieldErrors.photoUrl}
            disabled={!canWrite}
          />
        </div>

        <Input
          label={t('fields.sortOrder')}
          name="sortOrder"
          type="number"
          min={0}
          value={values.sortOrder}
          onChange={(e) => updateField('sortOrder', e.target.value)}
          disabled={!canWrite}
        />

        <div className="flex flex-wrap gap-3 pt-2">
          {canWrite ? (
            <Button type="submit" loading={submitting} loadingText={t('saving')} disabled={busy}>
              {mode === 'create' ? t('createButton') : t('saveButton')}
            </Button>
          ) : null}
          <Button type="button" variant="outline" href={cancelHref}>
            {t('cancelButton')}
          </Button>
        </div>
      </form>
    </Card>
  );
}

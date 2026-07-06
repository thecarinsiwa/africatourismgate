'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { Button, Input } from '@africatourismgate/ui';
import type {
  CreateTeamMemberRequest,
  TeamMember,
  TeamMemberStatus,
} from '@africatourismgate/types';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useId, useState } from 'react';
import { isValidMediaUrl } from '../../lib/about/form-utils';
import { getApiClient, resolveApiBaseUrl } from '../../lib/auth/api';
import { getSession } from '../../lib/auth/session';
import { resolveMediaUrl } from '../../lib/resolve-media-url';

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
};

export function TeamMemberForm({ mode, memberId, initialMember }: TeamMemberFormProps) {
  const { about: getAboutErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.about.team.form');
  const tCommon = useTranslations('modules.common');
  const tCommonForm = useTranslations('modules.common.form');
  const tValidation = useTranslations('modules.common.validation');
  const tLocale = useTranslations('modules.about.locale');
  const tStatus = useTranslations('modules.about.status');
  const router = useRouter();
  const statusId = useId();
  const localeId = useId();
  const [values, setValues] = useState<TeamMemberFormValues>(() =>
    initialMember ? teamMemberToFormValues(initialMember) : defaultValues,
  );
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof TeamMemberFormValues, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoFileInputId = useId();

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
        router.push('/contenu/a-propos/equipe');
        router.refresh();
      }
    } catch (error) {
      setFormError(getAboutErrorMessage(error));
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

      <Input
        label={t('fields.name')}
        name="name"
        value={values.name}
        onChange={(e) => updateField('name', e.target.value)}
        error={fieldErrors.name}
        required
      />
      <Input
        label={t('fields.role')}
        name="role"
        value={values.role}
        onChange={(e) => updateField('role', e.target.value)}
        error={fieldErrors.role}
        required
      />

      <div>
        <label htmlFor="bio" className="mb-2 block text-sm font-medium text-atg-fg">
          {t('fields.bio')}
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          value={values.bio}
          onChange={(e) => updateField('bio', e.target.value)}
          className="w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-atg-fg">{t('fields.photo')}</p>
        <label
          htmlFor={photoFileInputId}
          className="inline-flex cursor-pointer items-center rounded-md border border-atg-border px-3 py-2 text-xs font-medium text-atg-fg hover:bg-atg-muted/10"
        >
          {uploadingPhoto ? tCommonForm('uploading') : tCommonForm('chooseFile')}
          <input
            id={photoFileInputId}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => void handlePhotoPick(e)}
            disabled={uploadingPhoto || submitting}
          />
        </label>
        {values.photoUrl.trim() ? (
          <Image
            src={resolveMediaUrl(values.photoUrl.trim())}
            alt={t('fields.photoPreviewAlt')}
            width={160}
            height={160}
            unoptimized
            className="h-32 w-32 rounded-full border border-atg-border object-cover"
          />
        ) : null}
        <Input
          label={tCommonForm('externalUrlOptional')}
          name="photoUrl"
          type="url"
          value={values.photoUrl}
          onChange={(e) => updateField('photoUrl', e.target.value)}
          error={fieldErrors.photoUrl}
        />
      </div>

      <Input
        label={t('fields.sortOrder')}
        name="sortOrder"
        type="number"
        min={0}
        value={values.sortOrder}
        onChange={(e) => updateField('sortOrder', e.target.value)}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={statusId} className="mb-2 block text-sm font-medium text-atg-fg">
            {tCommon('columns.status')}
          </label>
          <select
            id={statusId}
            value={values.status}
            onChange={(e) => updateField('status', e.target.value as TeamMemberStatus)}
            className="w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="draft">{tStatus('draft')}</option>
            <option value="published">{tStatus('published')}</option>
          </select>
        </div>
        <div>
          <label htmlFor={localeId} className="mb-2 block text-sm font-medium text-atg-fg">
            {t('fields.locale')}
          </label>
          <select
            id={localeId}
            value={values.locale}
            onChange={(e) => updateField('locale', e.target.value)}
            className="w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="fr">{tLocale('fr')}</option>
            <option value="en">{tLocale('en')}</option>
            <option value="es">{tLocale('es')}</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <Button type="submit" loading={submitting} loadingText={t('saving')} disabled={uploadingPhoto}>
          {mode === 'create' ? t('createButton') : t('saveButton')}
        </Button>
        <Button type="button" variant="outline" href="/contenu/a-propos/equipe">
          {t('cancelButton')}
        </Button>
      </div>
    </form>
  );
}

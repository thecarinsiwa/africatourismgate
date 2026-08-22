'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  Avatar,
  Button,
  Card,
  cn,
  DataTableBadge,
  Input,
  Select,
  Textarea,
  useToast,
} from '@africatourismgate/ui';
import type {
  CreateTourGuideRequest,
  Destination,
  OrganizationListItem,
  TourGuide,
  TourGuideStatus,
  TourGuideType,
  UpdateTourGuideRequest,
  User,
} from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { getApiClient, resolveApiBaseUrl } from '../../lib/auth/api';
import { getSession } from '../../lib/auth/session';
import { resolveMediaUrl } from '../../lib/resolve-media-url';
import {
  useTourGuideStatusLabels,
  useTourGuideTypeLabels,
} from '../../lib/i18n/use-module-labels';

export type TourGuideFormValues = {
  type: TourGuideType;
  userId: string;
  organizationId: string;
  displayName: string;
  contactEmail: string;
  bio: string;
  photoUrl: string;
  languagesInput: string;
  destinationIds: string[];
  status: TourGuideStatus;
};

const defaultValues: TourGuideFormValues = {
  type: 'external',
  userId: '',
  organizationId: '',
  displayName: '',
  contactEmail: '',
  bio: '',
  photoUrl: '',
  languagesInput: 'fr',
  destinationIds: [],
  status: 'active',
};

const PHOTO_MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function parseLanguagesInput(input: string): string[] {
  return input
    .split(/[,;]+/)
    .map((code) => code.trim().toLowerCase())
    .filter(Boolean);
}

function guideToFormValues(guide: TourGuide): TourGuideFormValues {
  return {
    type: guide.type,
    userId: guide.userId ?? '',
    organizationId: guide.organizationId ?? '',
    displayName: guide.displayName,
    contactEmail: guide.contactEmail ?? '',
    bio: guide.bio ?? '',
    photoUrl: guide.photoUrl ?? '',
    languagesInput: guide.languages.join(', '),
    destinationIds: [...guide.destinations],
    status: guide.status,
  };
}

function toCreatePayload(values: TourGuideFormValues): CreateTourGuideRequest {
  const languages = parseLanguagesInput(values.languagesInput);
  return {
    type: values.type,
    displayName: values.displayName.trim(),
    languages,
    destinations: values.destinationIds,
    status: values.status,
    ...(values.type === 'internal' && values.userId ? { userId: values.userId } : {}),
    ...(values.type === 'external' && values.contactEmail.trim()
      ? { contactEmail: values.contactEmail.trim() }
      : {}),
    ...(values.organizationId ? { organizationId: values.organizationId } : {}),
    ...(values.bio.trim() ? { bio: values.bio.trim() } : {}),
    ...(values.photoUrl.trim() ? { photoUrl: values.photoUrl.trim() } : {}),
  };
}

function toUpdatePayload(values: TourGuideFormValues): UpdateTourGuideRequest {
  const languages = parseLanguagesInput(values.languagesInput);
  return {
    type: values.type,
    displayName: values.displayName.trim(),
    languages,
    destinations: values.destinationIds,
    status: values.status,
    userId: values.type === 'internal' && values.userId ? values.userId : null,
    contactEmail:
      values.type === 'external' && values.contactEmail.trim()
        ? values.contactEmail.trim()
        : null,
    organizationId: values.organizationId ? values.organizationId : null,
    bio: values.bio.trim() ? values.bio.trim() : null,
    photoUrl: values.photoUrl.trim() ? values.photoUrl.trim() : null,
  };
}

type TourGuideFormSection = 'identity' | 'coverage' | 'all';

type TourGuideFormProps = {
  mode: 'create' | 'edit';
  layout?: 'narrow' | 'wide';
  activeSection?: TourGuideFormSection;
  guideId?: string;
  initialGuide?: TourGuide;
  onUpdated?: (guide: TourGuide) => void;
};

export function TourGuideForm({
  mode,
  layout = mode === 'edit' ? 'wide' : 'narrow',
  activeSection = 'all',
  guideId,
  initialGuide,
  onUpdated,
}: TourGuideFormProps) {
  const { tourGuides: getTourGuidesErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.tourGuides.form');
  const tToast = useTranslations('modules.common.toast');
  const tCommonForm = useTranslations('modules.common.form');
  const tValidation = useTranslations('modules.common.validation');
  const typeLabels = useTourGuideTypeLabels();
  const statusLabels = useTourGuideStatusLabels();
  const router = useRouter();
  const { toast } = useToast();
  const typeId = useId();
  const userFieldId = useId();
  const orgId = useId();
  const statusId = useId();
  const destinationsSearchId = useId();
  const photoFileInputId = useId();

  const [values, setValues] = useState<TourGuideFormValues>(() =>
    initialGuide ? guideToFormValues(initialGuide) : defaultValues,
  );
  const [users, setUsers] = useState<User[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationListItem[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [destinationSearch, setDestinationSearch] = useState('');
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof TourGuideFormValues, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const showIdentity = activeSection === 'all' || activeSection === 'identity';
  const showCoverage = activeSection === 'all' || activeSection === 'coverage';
  const isWide = layout === 'wide';

  useEffect(() => {
    let cancelled = false;
    async function loadLookups() {
      try {
        const client = getApiClient();
        const [usersResult, orgsResult, destinationsResult] = await Promise.all([
          client.listUsers({ page: 1, limit: 100, status: 'active' }),
          client.listOrganizations({ page: 1, limit: 100 }),
          client.listDestinations({ page: 1, limit: 100 }),
        ]);
        if (!cancelled) {
          setUsers(usersResult.data);
          setOrganizations(orgsResult.data);
          setDestinations(destinationsResult.data);
        }
      } catch {
        if (!cancelled) {
          setUsers([]);
          setOrganizations([]);
          setDestinations([]);
        }
      }
    }
    void loadLookups();
    return () => {
      cancelled = true;
    };
  }, []);

  const updateField = useCallback(
    <K extends keyof TourGuideFormValues>(key: K, value: TourGuideFormValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    [],
  );

  const userOptions = useMemo(() => {
    if (mode === 'edit' && initialGuide?.user) {
      const hasCurrent = users.some((u) => u.id === initialGuide.userId);
      if (!hasCurrent && initialGuide.userId) {
        return [
          {
            id: initialGuide.userId,
            email: initialGuide.user.email,
            firstName: initialGuide.user.firstName,
            lastName: initialGuide.user.lastName,
          } as User,
          ...users,
        ];
      }
    }
    return users;
  }, [initialGuide, mode, users]);

  const linkedUser = useMemo(
    () => userOptions.find((user) => user.id === values.userId),
    [userOptions, values.userId],
  );

  const typeSelectOptions = useMemo(
    () => [
      { value: 'external', label: typeLabels.external },
      { value: 'internal', label: typeLabels.internal },
    ],
    [typeLabels],
  );

  const statusSelectOptions = useMemo(
    () => [
      { value: 'active', label: statusLabels.active },
      { value: 'inactive', label: statusLabels.inactive },
    ],
    [statusLabels],
  );

  const userSelectOptions = useMemo(
    () => [
      { value: '', label: t('userPlaceholder') },
      ...userOptions.map((user) => ({
        value: user.id,
        label: `${user.firstName} ${user.lastName} (${user.email})`,
      })),
    ],
    [t, userOptions],
  );

  const organizationSelectOptions = useMemo(
    () => [
      { value: '', label: t('organizationPlaceholder') },
      ...organizations.map((org) => ({ value: org.id, label: org.name })),
    ],
    [organizations, t],
  );

  const filteredDestinations = useMemo(() => {
    const query = destinationSearch.trim().toLowerCase();
    if (!query) return destinations;
    return destinations.filter((destination) =>
      destination.name.toLowerCase().includes(query),
    );
  }, [destinationSearch, destinations]);

  const selectedDestinations = useMemo(
    () =>
      destinations.filter((destination) => values.destinationIds.includes(destination.id)),
    [destinations, values.destinationIds],
  );

  const previewEmail =
    linkedUser?.email ?? (values.contactEmail.trim() || 'guide@preview.local');
  const previewFirstName =
    linkedUser?.firstName ?? (values.displayName.trim() || 'Guide');
  const previewLastName = linkedUser?.lastName ?? '';

  const photoPreviewSrc = values.photoUrl.trim()
    ? resolveMediaUrl(values.photoUrl.trim())
    : undefined;

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
      const response = await fetch(`${resolveApiBaseUrl()}/tour-guides/upload-photo`, {
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
    const errors: Partial<Record<keyof TourGuideFormValues, string>> = {};
    if (!values.displayName.trim()) {
      errors.displayName = t('validation.displayNameRequired');
    }
    if (values.type === 'internal' && !values.userId) {
      errors.userId = t('validation.userIdRequired');
    }
    if (values.type === 'external' && !values.contactEmail.trim()) {
      errors.contactEmail = t('validation.contactEmailRequired');
    } else if (
      values.type === 'external' &&
      values.contactEmail.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.contactEmail.trim())
    ) {
      errors.contactEmail = t('validation.contactEmailInvalid');
    }
    const languages = parseLanguagesInput(values.languagesInput);
    if (languages.length === 0) {
      errors.languagesInput = t('validation.languagesRequired');
    }
    if (values.destinationIds.length === 0) {
      errors.destinationIds = t('validation.destinationsRequired');
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (!validate()) {
      return;
    }

    setSubmitting(true);
    try {
      const client = getApiClient();
      if (mode === 'create') {
        const created = await client.createTourGuide(toCreatePayload(values));
        router.push(`/guides/${created.id}`);
        router.refresh();
      } else if (guideId) {
        const updated = await client.updateTourGuide(guideId, toUpdatePayload(values));
        onUpdated?.(updated);
        toast({
          title: tToast('tourGuideSavedTitle'),
          message: values.displayName.trim(),
          variant: 'success',
        });
        router.refresh();
      }
    } catch (error) {
      const message = getTourGuidesErrorMessage(error);
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

  const toggleDestination = useCallback((destinationId: string) => {
    setValues((prev) => {
      const exists = prev.destinationIds.includes(destinationId);
      return {
        ...prev,
        destinationIds: exists
          ? prev.destinationIds.filter((id) => id !== destinationId)
          : [...prev.destinationIds, destinationId],
      };
    });
    setFieldErrors((prev) => ({ ...prev, destinationIds: undefined }));
  }, []);

  const photoFields = (
    <div className="space-y-3">
      <label
        htmlFor={photoFileInputId}
        className="inline-flex cursor-pointer items-center rounded-md border border-atg-border px-3 py-2 text-xs font-medium text-atg-fg hover:bg-atg-muted/10"
      >
        {uploadingPhoto ? tCommonForm('uploading') : t('uploadPhoto')}
        <input
          id={photoFileInputId}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => void handlePhotoPick(e)}
          disabled={uploadingPhoto || submitting}
        />
      </label>
      <Input
        label={tCommonForm('externalUrlOptional')}
        name="photoUrl"
        type="url"
        value={values.photoUrl}
        onChange={(e) => updateField('photoUrl', e.target.value)}
        error={fieldErrors.photoUrl}
        disabled={uploadingPhoto}
      />
    </div>
  );

  const identityFields = (
    <div className="space-y-4">
      <Select
        id={typeId}
        label={t('type')}
        hint={t('typeHint')}
        value={values.type}
        options={typeSelectOptions}
        onChange={(e) => {
          const nextType = e.target.value as TourGuideType;
          setValues((prev) => ({
            ...prev,
            type: nextType,
            userId: nextType === 'external' ? '' : prev.userId,
            contactEmail: nextType === 'internal' ? '' : prev.contactEmail,
          }));
          setFieldErrors((prev) => ({
            ...prev,
            userId: undefined,
            contactEmail: undefined,
          }));
        }}
      />

      {values.type === 'internal' ? (
        <Select
          id={userFieldId}
          label={t('userId')}
          hint={t('userIdHint')}
          value={values.userId}
          options={userSelectOptions}
          onChange={(e) => updateField('userId', e.target.value)}
          error={fieldErrors.userId}
          required
        />
      ) : (
        <Input
          label={t('contactEmail')}
          name="contactEmail"
          type="email"
          value={values.contactEmail}
          onChange={(e) => updateField('contactEmail', e.target.value)}
          hint={t('contactEmailHint')}
          error={fieldErrors.contactEmail}
          required
        />
      )}

      <Select
        id={orgId}
        label={t('organizationId')}
        value={values.organizationId}
        options={organizationSelectOptions}
        onChange={(e) => updateField('organizationId', e.target.value)}
      />

      <Input
        label={t('displayName')}
        name="displayName"
        value={values.displayName}
        onChange={(e) => updateField('displayName', e.target.value)}
        error={fieldErrors.displayName}
        required
      />

      <Textarea
        label={t('bio')}
        name="bio"
        rows={4}
        value={values.bio}
        onChange={(e) => updateField('bio', e.target.value)}
      />

      {!isWide || activeSection === 'all' ? photoFields : null}

      <Select
        id={statusId}
        label={t('status')}
        value={values.status}
        options={statusSelectOptions}
        onChange={(e) => updateField('status', e.target.value as TourGuideStatus)}
      />
    </div>
  );

  const coverageFields = (
    <div className="space-y-4">
      <Input
        label={t('languages')}
        name="languagesInput"
        value={values.languagesInput}
        onChange={(e) => updateField('languagesInput', e.target.value)}
        hint={t('languagesHint')}
        error={fieldErrors.languagesInput}
        required
      />

      <div>
        <p className="mb-1 text-sm font-medium text-atg-fg">{t('destinations')}</p>
        <p className="mb-3 text-xs text-atg-muted">{t('destinationsHint')}</p>
        {destinations.length === 0 ? (
          <p className="text-sm text-atg-muted">{t('destinationsEmpty')}</p>
        ) : (
          <div className="space-y-3">
            <Input
              id={destinationsSearchId}
              name="destinationsSearch"
              type="search"
              value={destinationSearch}
              onChange={(e) => setDestinationSearch(e.target.value)}
              placeholder={t('destinationsSearch')}
              aria-label={t('destinationsSearch')}
            />
            <div
              className={cn(
                'grid gap-2 sm:grid-cols-2 xl:grid-cols-3',
                fieldErrors.destinationIds && 'rounded-lg ring-1 ring-red-500',
              )}
            >
              {filteredDestinations.length === 0 ? (
                <p className="col-span-full text-sm text-atg-muted">{t('destinationsEmpty')}</p>
              ) : (
                filteredDestinations.map((destination) => {
                  const selected = values.destinationIds.includes(destination.id);
                  return (
                    <button
                      key={destination.id}
                      type="button"
                      onClick={() => toggleDestination(destination.id)}
                      aria-pressed={selected}
                      className={cn(
                        'rounded-lg border px-3 py-2.5 text-left text-sm transition-colors',
                        selected
                          ? 'border-primary bg-primary/5 font-medium text-atg-fg'
                          : 'border-atg-border bg-atg-elevated text-atg-muted hover:border-primary/40 hover:text-atg-fg',
                      )}
                    >
                      {destination.name}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
        {fieldErrors.destinationIds ? (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.destinationIds}</p>
        ) : null}
      </div>
    </div>
  );

  const identityAside = (
    <aside className="min-w-0 space-y-4 lg:sticky lg:top-6">
      <Card variant="dashboard" padding="md" className="space-y-4">
        <h3 className="text-sm font-semibold text-atg-fg">{t('previewPhoto')}</h3>
        <div className="flex flex-col items-center gap-3 text-center">
          <Avatar
            email={previewEmail}
            firstName={previewFirstName}
            lastName={previewLastName}
            src={photoPreviewSrc}
            size="lg"
            label={values.displayName.trim() || previewFirstName}
          />
          <p className="text-sm font-medium text-atg-fg">
            {values.displayName.trim() || t('previewNamePlaceholder')}
          </p>
          <DataTableBadge variant="muted">{typeLabels[values.type]}</DataTableBadge>
        </div>
        {photoFields}
      </Card>
    </aside>
  );

  const coverageAside = (
    <aside className="min-w-0 space-y-4 lg:sticky lg:top-6">
      <Card variant="dashboard" padding="md" className="space-y-3">
        <h3 className="text-sm font-semibold text-atg-fg">{t('selectedDestinations')}</h3>
        {selectedDestinations.length === 0 ? (
          <p className="text-sm text-atg-muted">{t('noDestinationsSelected')}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selectedDestinations.map((destination) => (
              <DataTableBadge key={destination.id} variant="muted">
                {destination.name}
              </DataTableBadge>
            ))}
          </div>
        )}
        <p className="text-xs text-atg-muted">
          {t('selectedCount', { count: selectedDestinations.length })}
        </p>
      </Card>
    </aside>
  );

  const formClassName = cn(
    'space-y-6',
    isWide ? 'w-full' : 'max-w-2xl',
  );

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className={formClassName}>
      {formError ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {formError}
        </p>
      ) : null}

      {isWide && showIdentity && !showCoverage ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:items-start xl:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
          <Card variant="dashboard" padding="md">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-atg-muted">
              {t('sections.identity')}
            </h2>
            {identityFields}
          </Card>
          {identityAside}
        </div>
      ) : null}

      {isWide && showCoverage && !showIdentity ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:items-start xl:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
          <Card variant="dashboard" padding="md">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-atg-muted">
              {t('sections.coverage')}
            </h2>
            {coverageFields}
          </Card>
          {coverageAside}
        </div>
      ) : null}

      {!isWide || activeSection === 'all' ? (
        <>
          {showIdentity ? (
            <Card variant="dashboard" padding="md" className="space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-atg-muted">
                {t('sections.identity')}
              </h2>
              {identityFields}
            </Card>
          ) : null}

          {showCoverage ? (
            <Card variant="dashboard" padding="md" className="space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-atg-muted">
                {t('sections.coverage')}
              </h2>
              {coverageFields}
            </Card>
          ) : null}
        </>
      ) : null}

      <Button type="submit" variant="primary" loading={submitting}>
        {mode === 'create' ? t('submitCreate') : t('submitUpdate')}
      </Button>
    </form>
  );
}

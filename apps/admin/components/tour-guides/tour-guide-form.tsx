'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { Button, Card, Input, Select, useToast } from '@africatourismgate/ui';
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
import { getApiClient } from '../../lib/auth/api';
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

type TourGuideFormProps = {
  mode: 'create' | 'edit';
  guideId?: string;
  initialGuide?: TourGuide;
  onUpdated?: (guide: TourGuide) => void;
};

export function TourGuideForm({
  mode,
  guideId,
  initialGuide,
  onUpdated,
}: TourGuideFormProps) {
  const { tourGuides: getTourGuidesErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.tourGuides.form');
  const tToast = useTranslations('modules.common.toast');
  const typeLabels = useTourGuideTypeLabels();
  const statusLabels = useTourGuideStatusLabels();
  const router = useRouter();
  const { toast } = useToast();
  const typeId = useId();
  const userFieldId = useId();
  const orgId = useId();
  const statusId = useId();

  const [values, setValues] = useState<TourGuideFormValues>(() =>
    initialGuide ? guideToFormValues(initialGuide) : defaultValues,
  );
  const [users, setUsers] = useState<User[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationListItem[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof TourGuideFormValues, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="max-w-2xl space-y-6">
      {formError ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {formError}
        </p>
      ) : null}

      <Card variant="dashboard" padding="md" className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-atg-muted">
          {t('sections.identity')}
        </h2>

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

        <div>
          <label htmlFor="bio" className="mb-1 block text-sm font-medium text-atg-fg">
            {t('bio')}
          </label>
          <textarea
            id="bio"
            rows={4}
            value={values.bio}
            onChange={(e) => updateField('bio', e.target.value)}
            className="w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg"
          />
        </div>

        <Input
          label={t('photoUrl')}
          name="photoUrl"
          type="url"
          value={values.photoUrl}
          onChange={(e) => updateField('photoUrl', e.target.value)}
        />

        <Select
          id={statusId}
          label={t('status')}
          value={values.status}
          options={statusSelectOptions}
          onChange={(e) => updateField('status', e.target.value as TourGuideStatus)}
        />
      </Card>

      <Card variant="dashboard" padding="md" className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-atg-muted">
          {t('sections.coverage')}
        </h2>

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
          <p className="mb-2 text-sm font-medium text-atg-fg">{t('destinations')}</p>
          <p className="mb-3 text-xs text-atg-muted">{t('destinationsHint')}</p>
          {destinations.length === 0 ? (
            <p className="text-sm text-atg-muted">{t('destinationsEmpty')}</p>
          ) : (
            <div
              className={`max-h-48 space-y-2 overflow-y-auto rounded-lg border p-3 ${
                fieldErrors.destinationIds ? 'border-red-500' : 'border-atg-border'
              }`}
            >
              {destinations.map((destination) => (
                <label key={destination.id} className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={values.destinationIds.includes(destination.id)}
                    onChange={() => toggleDestination(destination.id)}
                    className="rounded border-atg-border"
                  />
                  <span>{destination.name}</span>
                </label>
              ))}
            </div>
          )}
          {fieldErrors.destinationIds ? (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.destinationIds}</p>
          ) : null}
        </div>
      </Card>

      <Button type="submit" variant="primary" loading={submitting}>
        {mode === 'create' ? t('submitCreate') : t('submitUpdate')}
      </Button>
    </form>
  );
}

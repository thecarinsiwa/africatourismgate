'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';
import { Button, Card, Input, Textarea } from '@africatourismgate/ui';
import type {
  Organization,
  OrganizationSetting,
  PublicSiteMaintenance,
  SiteMaintenanceSettingValue,
} from '@africatourismgate/types';
import {
  DEFAULT_SITE_MAINTENANCE,
  normalizeSiteMaintenance,
} from '@africatourismgate/types/organization-settings';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import {
  fromDatetimeLocalValue,
  toDatetimeLocalValue,
} from '../../lib/flight-datetime';
import { OrganizationOrgSelector } from '../organizations/organization-org-selector';

type MaintenanceFormValues = {
  enabled: boolean;
  title: string;
  message: string;
  endsAtLocal: string;
};

function maintenanceToFormValues(
  maintenance: PublicSiteMaintenance,
): MaintenanceFormValues {
  return {
    enabled: maintenance.enabled,
    title: maintenance.title ?? '',
    message: maintenance.message ?? '',
    endsAtLocal: maintenance.endsAt
      ? toDatetimeLocalValue(maintenance.endsAt)
      : '',
  };
}

const defaultValues = maintenanceToFormValues(DEFAULT_SITE_MAINTENANCE);

type MaintenanceSettingsFormProps = {
  organizationId: string;
  isSuperAdmin: boolean;
  canWrite: boolean;
  organizations?: Pick<Organization, 'id' | 'name'>[];
  onOrganizationIdChange?: (id: string) => void;
  onDirtyChange?: (isDirty: boolean) => void;
};

export function MaintenanceSettingsForm({
  organizationId,
  isSuperAdmin,
  canWrite,
  organizations = [],
  onOrganizationIdChange,
  onDirtyChange,
}: MaintenanceSettingsFormProps) {
  const { organizationSettings: getOrganizationSettingsErrorMessage } =
    useAdminErrorMessages();
  const t = useTranslations('modules.settings.form');
  const tToast = useTranslations('modules.common.toast');

  const [values, setValues] = useState<MaintenanceFormValues>(defaultValues);
  const [initialValues, setInitialValues] =
    useState<MaintenanceFormValues>(defaultValues);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof MaintenanceFormValues, string>>
  >({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const updateField = useCallback(
    <K extends keyof MaintenanceFormValues>(
      key: K,
      value: MaintenanceFormValues[K],
    ) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
      setSuccessMessage(null);
    },
    [],
  );

  const isDirty = useMemo(
    () => JSON.stringify(values) !== JSON.stringify(initialValues),
    [values, initialValues],
  );

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    setSuccessMessage(null);

    async function load() {
      try {
        const settingsPage = await getApiClient().listOrganizationSettings({
          organizationId,
          page: 1,
          limit: 100,
        });
        if (cancelled) return;

        const raw = settingsPage.data.find(
          (s: OrganizationSetting) =>
            s.settingGroup === 'site' && s.settingKey === 'maintenance',
        )?.settingValue as SiteMaintenanceSettingValue | undefined;

        const nextValues = maintenanceToFormValues(
          normalizeSiteMaintenance(raw),
        );
        setValues(nextValues);
        setInitialValues(nextValues);
      } catch (error) {
        if (!cancelled) {
          setLoadError(getOrganizationSettingsErrorMessage(error));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [getOrganizationSettingsErrorMessage, organizationId]);

  function validate(): boolean {
    const errors: Partial<Record<keyof MaintenanceFormValues, string>> = {};
    if (values.title.trim().length > 200) {
      errors.title = t('validation.maintenanceTitleTooLong');
    }
    if (values.message.trim().length > 2000) {
      errors.message = t('validation.maintenanceMessageTooLong');
    }
    if (values.endsAtLocal.trim()) {
      const endsAtMs = new Date(values.endsAtLocal).getTime();
      if (!Number.isFinite(endsAtMs)) {
        errors.endsAtLocal = t('validation.maintenanceEndsAtInvalid');
      }
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);
    if (!canWrite) return;
    if (!validate()) return;

    setSubmitting(true);
    try {
      await getApiClient().bulkUpsertOrganizationSettings({
        ...(isSuperAdmin ? { organizationId } : {}),
        settings: [
          {
            settingGroup: 'site',
            settingKey: 'maintenance',
            settingValue: {
              enabled: values.enabled,
              ...(values.title.trim() ? { title: values.title.trim() } : {}),
              ...(values.message.trim()
                ? { message: values.message.trim() }
                : {}),
              endsAt: values.endsAtLocal.trim()
                ? fromDatetimeLocalValue(values.endsAtLocal)
                : null,
            },
          },
        ],
      });
      setInitialValues(values);
      setSuccessMessage(tToast('saved'));
    } catch (error) {
      setFormError(getOrganizationSettingsErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel(): void {
    setValues(initialValues);
    setFieldErrors({});
    setFormError(null);
    setSuccessMessage(null);
  }

  if (loading) {
    return <p className="text-sm text-atg-muted">{t('loading')}</p>;
  }

  if (loadError) {
    return (
      <p role="alert" className="text-sm text-red-600 dark:text-red-400">
        {loadError}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {isSuperAdmin && organizations.length > 0 && onOrganizationIdChange ? (
        <Card variant="dashboard" padding="sm" className="space-y-4">
          <OrganizationOrgSelector
            id="maintenance-org-select"
            organizations={organizations}
            value={organizationId}
            onChange={onOrganizationIdChange}
          />
        </Card>
      ) : null}

      <Card variant="dashboard" padding="sm" className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-atg-fg">
            {t('sections.maintenance.title')}
          </h2>
          <p className="mt-1 text-sm text-atg-muted">
            {t('sections.maintenance.description')}
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm text-atg-fg">
          <input
            type="checkbox"
            checked={values.enabled}
            onChange={(e) => updateField('enabled', e.target.checked)}
            disabled={!canWrite}
            className="rounded border-atg-border"
          />
          {t('sections.maintenance.enabled')}
        </label>
        <Input
          label={t('sections.maintenance.pageTitle')}
          value={values.title}
          onChange={(e) => updateField('title', e.target.value)}
          error={fieldErrors.title}
          hint={t('sections.maintenance.pageTitleHint')}
          maxLength={200}
          disabled={!canWrite}
        />
        <Textarea
          label={t('sections.maintenance.message')}
          value={values.message}
          onChange={(e) => updateField('message', e.target.value)}
          error={fieldErrors.message}
          hint={t('sections.maintenance.messageHint')}
          rows={4}
          maxLength={2000}
          disabled={!canWrite}
        />
        <Input
          label={t('sections.maintenance.endsAt')}
          type="datetime-local"
          value={values.endsAtLocal}
          onChange={(e) => updateField('endsAtLocal', e.target.value)}
          error={fieldErrors.endsAtLocal}
          hint={t('sections.maintenance.endsAtHint')}
          disabled={!canWrite}
        />
      </Card>

      {formError ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {formError}
        </p>
      ) : null}
      {successMessage ? (
        <p role="status" className="text-sm text-primary">
          {successMessage}
        </p>
      ) : null}

      {canWrite ? (
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={submitting || !isDirty}>
            {submitting ? t('saving') : t('save')}
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={submitting || !isDirty}
            onClick={handleCancel}
          >
            {t('cancel')}
          </Button>
          <span className="text-xs text-atg-muted">
            {isDirty ? t('dirty') : t('clean')}
          </span>
        </div>
      ) : null}
    </form>
  );
}

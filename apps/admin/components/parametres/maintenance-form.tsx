'use client';

import { Button, Card, Input, Textarea } from '@africatourismgate/ui';
import type {
  CreateOrganizationMaintenanceRequest,
  OrganizationMaintenance,
} from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useId, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import {
  fromDatetimeLocalValue,
  toDatetimeLocalValue,
} from '../../lib/flight-datetime';
import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

export type MaintenanceFormValues = {
  enabled: boolean;
  title: string;
  message: string;
  startsAtLocal: string;
  endsAtLocal: string;
};

function defaultStartsAtLocal(): string {
  return toDatetimeLocalValue(new Date().toISOString());
}

const defaultValues: MaintenanceFormValues = {
  enabled: false,
  title: '',
  message: '',
  startsAtLocal: '',
  endsAtLocal: '',
};

function maintenanceToFormValues(
  row: OrganizationMaintenance,
): MaintenanceFormValues {
  return {
    enabled: row.enabled,
    title: row.title ?? '',
    message: row.message ?? '',
    startsAtLocal: row.startsAt ? toDatetimeLocalValue(row.startsAt) : '',
    endsAtLocal: row.endsAt ? toDatetimeLocalValue(row.endsAt) : '',
  };
}

type MaintenanceFormProps = {
  mode: 'create' | 'edit';
  maintenanceId?: string;
  initialMaintenance?: OrganizationMaintenance;
  organizationId: string;
  isSuperAdmin: boolean;
  canWrite: boolean;
};

export function MaintenanceForm({
  mode,
  maintenanceId,
  initialMaintenance,
  organizationId,
  isSuperAdmin,
  canWrite,
}: MaintenanceFormProps) {
  const { organizationSettings: getErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.settings.maintenances.form');
  const router = useRouter();

  const [values, setValues] = useState<MaintenanceFormValues>(() =>
    initialMaintenance
      ? maintenanceToFormValues(initialMaintenance)
      : { ...defaultValues, startsAtLocal: defaultStartsAtLocal() },
  );
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof MaintenanceFormValues, string>>
  >({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const titleId = useId();
  const messageId = useId();
  const startsAtId = useId();
  const endsAtId = useId();
  const enabledId = useId();

  const updateField = useCallback(
    <K extends keyof MaintenanceFormValues>(key: K, value: MaintenanceFormValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    [],
  );

  const listHref = `/parametres/maintenance?organizationId=${organizationId}`;

  const validate = (): boolean => {
    const errors: Partial<Record<keyof MaintenanceFormValues, string>> = {};
    if (!values.startsAtLocal.trim()) {
      errors.startsAtLocal = t('validation.startsAtRequired');
    } else if (Number.isNaN(Date.parse(values.startsAtLocal))) {
      errors.startsAtLocal = t('validation.startsAtInvalid');
    }
    if (values.endsAtLocal.trim()) {
      const endMs = Date.parse(values.endsAtLocal);
      const startMs = Date.parse(values.startsAtLocal);
      if (Number.isNaN(endMs)) {
        errors.endsAtLocal = t('validation.endsAtInvalid');
      } else if (!Number.isNaN(startMs) && endMs <= startMs) {
        errors.endsAtLocal = t('validation.endsAtAfterStartsAt');
      }
    }
    if (values.title.length > 200) {
      errors.title = t('validation.titleTooLong');
    }
    if (values.message.length > 2000) {
      errors.message = t('validation.messageTooLong');
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canWrite || !validate()) return;

    setSaving(true);
    setSubmitError(null);

    const payload: CreateOrganizationMaintenanceRequest = {
      ...(isSuperAdmin ? { organizationId } : {}),
      enabled: values.enabled,
      title: values.title.trim() || null,
      message: values.message.trim() || null,
      startsAt: fromDatetimeLocalValue(values.startsAtLocal),
      endsAt: values.endsAtLocal.trim()
        ? fromDatetimeLocalValue(values.endsAtLocal)
        : null,
    };

    try {
      const client = getApiClient();
      if (mode === 'edit' && maintenanceId) {
        await client.updateOrganizationMaintenance(
          maintenanceId,
          payload,
          isSuperAdmin ? organizationId : undefined,
        );
      } else {
        await client.createOrganizationMaintenance(payload);
      }
      router.push(listHref);
      router.refresh();
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <div className="flex items-start gap-3">
          <input
            id={enabledId}
            type="checkbox"
            checked={values.enabled}
            disabled={!canWrite || saving}
            onChange={(e) => updateField('enabled', e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-input"
          />
          <div>
            <label htmlFor={enabledId} className="text-sm font-medium">
              {t('fields.enabled')}
            </label>
            <p className="text-xs text-muted-foreground">{t('fields.enabledHint')}</p>
          </div>
        </div>

        <div>
          <label htmlFor={titleId} className="mb-1 block text-sm font-medium">
            {t('fields.title')}
          </label>
          <Input
            id={titleId}
            value={values.title}
            disabled={!canWrite || saving}
            maxLength={200}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder={t('fields.titlePlaceholder')}
          />
          {fieldErrors.title ? (
            <p className="mt-1 text-xs text-destructive">{fieldErrors.title}</p>
          ) : (
            <p className="mt-1 text-xs text-muted-foreground">{t('fields.titleHint')}</p>
          )}
        </div>

        <div>
          <label htmlFor={messageId} className="mb-1 block text-sm font-medium">
            {t('fields.message')}
          </label>
          <Textarea
            id={messageId}
            value={values.message}
            disabled={!canWrite || saving}
            maxLength={2000}
            rows={4}
            onChange={(e) => updateField('message', e.target.value)}
            placeholder={t('fields.messagePlaceholder')}
          />
          {fieldErrors.message ? (
            <p className="mt-1 text-xs text-destructive">{fieldErrors.message}</p>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={startsAtId} className="mb-1 block text-sm font-medium">
              {t('fields.startsAt')}
            </label>
            <Input
              id={startsAtId}
              type="datetime-local"
              value={values.startsAtLocal}
              disabled={!canWrite || saving}
              onChange={(e) => updateField('startsAtLocal', e.target.value)}
            />
            {fieldErrors.startsAtLocal ? (
              <p className="mt-1 text-xs text-destructive">{fieldErrors.startsAtLocal}</p>
            ) : null}
          </div>
          <div>
            <label htmlFor={endsAtId} className="mb-1 block text-sm font-medium">
              {t('fields.endsAt')}
            </label>
            <Input
              id={endsAtId}
              type="datetime-local"
              value={values.endsAtLocal}
              disabled={!canWrite || saving}
              onChange={(e) => updateField('endsAtLocal', e.target.value)}
            />
            {fieldErrors.endsAtLocal ? (
              <p className="mt-1 text-xs text-destructive">{fieldErrors.endsAtLocal}</p>
            ) : (
              <p className="mt-1 text-xs text-muted-foreground">{t('fields.endsAtHint')}</p>
            )}
          </div>
        </div>

        {submitError ? (
          <p className="text-sm text-destructive" role="alert">
            {submitError}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {canWrite ? (
            <Button type="submit" disabled={saving}>
              {saving ? t('saving') : t('saveButton')}
            </Button>
          ) : null}
          <Button type="button" variant="outline" href={listHref} disabled={saving}>
            {t('cancelButton')}
          </Button>
        </div>
      </form>
    </Card>
  );
}

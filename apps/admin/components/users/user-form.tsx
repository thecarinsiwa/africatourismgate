'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';
import { useAccountStatusLabels } from '../../lib/i18n/use-module-labels';

import { Button, Input } from '@africatourismgate/ui';
import type {
  CreateUserRequest,
  OrganizationListItem,
  UpdateUserRequest,
  User,
} from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useId, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';

export type UserFormValues = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  preferredLanguage: string;
  organizationId: string;
  status: 'active' | 'suspended';
};

const defaultValues: UserFormValues = {
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  phone: '',
  preferredLanguage: 'fr',
  organizationId: '',
  status: 'active',
};

function userToFormValues(user: User): UserFormValues {
  return {
    email: user.email,
    password: '',
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone ?? '',
    preferredLanguage: user.preferredLanguage ?? 'fr',
    organizationId: user.organizationId ?? '',
    status: user.status === 'suspended' ? 'suspended' : 'active',
  };
}

function toCreatePayload(values: UserFormValues): CreateUserRequest {
  return {
    email: values.email.trim(),
    password: values.password,
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    status: values.status,
    ...(values.phone.trim() ? { phone: values.phone.trim() } : {}),
    ...(values.preferredLanguage.trim()
      ? { preferredLanguage: values.preferredLanguage.trim() }
      : {}),
    ...(values.organizationId ? { organizationId: values.organizationId } : {}),
  };
}

function toUpdatePayload(values: UserFormValues): UpdateUserRequest {
  const payload: UpdateUserRequest = {
    email: values.email.trim(),
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    status: values.status,
    ...(values.phone.trim() ? { phone: values.phone.trim() } : {}),
    ...(values.preferredLanguage.trim()
      ? { preferredLanguage: values.preferredLanguage.trim() }
      : {}),
    organizationId: values.organizationId ? values.organizationId : null,
  };
  if (values.password.trim()) {
    payload.password = values.password;
  }
  return payload;
}

type UserFormProps = {
  mode: 'create' | 'edit';
  userId?: string;
  initialUser?: User;
};

export function UserForm({ mode, userId, initialUser }: UserFormProps) {
  const { users: getUsersErrorMessage } = useAdminErrorMessages();
  const tForm = useTranslations('modules.users.form');
  const tActions = useTranslations('common.actions');
  const tLoading = useTranslations('common.loading');
  const statusLabels = useAccountStatusLabels();
  const router = useRouter();
  const statusId = useId();
  const orgId = useId();
  const [values, setValues] = useState<UserFormValues>(() =>
    initialUser ? userToFormValues(initialUser) : defaultValues,
  );
  const [organizations, setOrganizations] = useState<OrganizationListItem[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof UserFormValues, string>>>(
    {},
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadOrganizations() {
      try {
        const result = await getApiClient().listOrganizations({ page: 1, limit: 100 });
        if (!cancelled) {
          setOrganizations(result.data);
        }
      } catch {
        if (!cancelled) {
          setOrganizations([]);
        }
      }
    }
    void loadOrganizations();
    return () => {
      cancelled = true;
    };
  }, []);

  const updateField = useCallback(
    <K extends keyof UserFormValues>(key: K, value: UserFormValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    [],
  );

  const validate = useCallback((): boolean => {
    const errors: Partial<Record<keyof UserFormValues, string>> = {};
    if (!values.email.trim()) {
      errors.email = tForm('validation.emailRequired');
    }
    if (mode === 'create' && values.password.length < 8) {
      errors.password = tForm('validation.passwordMinLength');
    }
    if (mode === 'edit' && values.password.length > 0 && values.password.length < 8) {
      errors.password = tForm('validation.passwordMinLength');
    }
    if (!values.firstName.trim()) {
      errors.firstName = tForm('validation.firstNameRequired');
    }
    if (!values.lastName.trim()) {
      errors.lastName = tForm('validation.lastNameRequired');
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [mode, tForm, values]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const client = getApiClient();
      if (mode === 'create') {
        const created = await client.createUser(toCreatePayload(values));
        router.push(`/utilisateurs/${created.id}`);
        router.refresh();
      } else if (userId) {
        await client.updateUser(userId, toUpdatePayload(values));
        router.push('/utilisateurs');
        router.refresh();
      }
    } catch (error) {
      setFormError(getUsersErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
      {formError ? (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400"
        >
          {formError}
        </p>
      ) : null}

      <Input
        label={tForm('email')}
        name="email"
        type="email"
        value={values.email}
        onChange={(e) => updateField('email', e.target.value)}
        error={fieldErrors.email}
        required
        autoComplete="email"
      />

      <Input
        label={mode === 'create' ? tForm('passwordCreate') : tForm('passwordEdit')}
        name="password"
        type="password"
        value={values.password}
        onChange={(e) => updateField('password', e.target.value)}
        error={fieldErrors.password}
        required={mode === 'create'}
        autoComplete={mode === 'create' ? 'new-password' : 'off'}
        hint={mode === 'edit' ? tForm('passwordHintEdit') : tForm('passwordHintCreate')}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label={tForm('firstName')}
          name="firstName"
          value={values.firstName}
          onChange={(e) => updateField('firstName', e.target.value)}
          error={fieldErrors.firstName}
          required
          autoComplete="given-name"
        />
        <Input
          label={tForm('lastName')}
          name="lastName"
          value={values.lastName}
          onChange={(e) => updateField('lastName', e.target.value)}
          error={fieldErrors.lastName}
          required
          autoComplete="family-name"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label={tForm('phone')}
          name="phone"
          value={values.phone}
          onChange={(e) => updateField('phone', e.target.value)}
        />
        <Input
          label={tForm('preferredLanguage')}
          name="preferredLanguage"
          value={values.preferredLanguage}
          onChange={(e) => updateField('preferredLanguage', e.target.value)}
          maxLength={2}
          hint={tForm('preferredLanguageHint')}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={orgId} className="mb-2 block text-sm font-medium text-atg-fg">
            {tForm('organization')}
          </label>
          <select
            id={orgId}
            name="organizationId"
            value={values.organizationId}
            onChange={(e) => updateField('organizationId', e.target.value)}
            className="w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="">{tForm('organizationNone')}</option>
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={statusId} className="mb-2 block text-sm font-medium text-atg-fg">
            {tForm('status')}
          </label>
          <select
            id={statusId}
            name="status"
            value={values.status}
            onChange={(e) =>
              updateField('status', e.target.value as UserFormValues['status'])
            }
            className="w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="active">{statusLabels.active}</option>
            <option value="suspended">{statusLabels.suspended}</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <Button type="submit" loading={submitting} loadingText={tLoading('submit')}>
          {mode === 'create' ? tForm('submitCreate') : tForm('submitEdit')}
        </Button>
        <Button type="button" variant="outline" href="/utilisateurs">
          {tActions('cancel')}
        </Button>
      </div>
    </form>
  );
}

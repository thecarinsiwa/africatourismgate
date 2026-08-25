'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { AlertDialog, Button, Card, Input, Textarea } from '@africatourismgate/ui';
import type { CreateRoleRequest, Role, UpdateRoleRequest } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useId, useState } from 'react';
import { RoleBadge } from './role-badge';
import { getApiClient } from '../../lib/auth/api';
import { PermissionMatrix } from './permission-matrix';
import { RbacSubnav } from './rbac-subnav';
import { useUnsavedChangesGuard } from './use-unsaved-changes-guard';

type RoleFormValues = {
  code: string;
  name: string;
  description: string;
};

type RoleFormProps = {
  mode: 'create' | 'edit';
  roleId?: string;
  initialRole?: Role;
};

export function RoleForm({ mode, roleId, initialRole }: RoleFormProps) {
  const { rbac: getRbacErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.rbac.roles');
  const tUnsaved = useTranslations('modules.rbac.unsavedChanges');
  const tCommonColumns = useTranslations('modules.common.columns');
  const tCommon = useTranslations('modules.common');
  const tActions = useTranslations('common.actions');
  const tLoading = useTranslations('common.loading');
  const router = useRouter();
  const descriptionId = useId();
  const [values, setValues] = useState<RoleFormValues>(() =>
    initialRole
      ? {
          code: initialRole.code,
          name: initialRole.name,
          description: initialRole.description ?? '',
        }
      : { code: '', name: '', description: '' },
  );
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof RoleFormValues, string>>>(
    {},
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [matrixDirty, setMatrixDirty] = useState(false);
  const {
    dialogOpen,
    setDialogOpen,
    requestAction,
    confirmDiscard,
    cancelDiscard,
  } = useUnsavedChangesGuard(matrixDirty);

  const isSystem = initialRole?.isSystem ?? false;
  const readOnly = mode === 'edit' && isSystem;

  const updateField = useCallback(
    <K extends keyof RoleFormValues>(key: K, value: RoleFormValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    [],
  );

  function validate(): boolean {
    const errors: Partial<Record<keyof RoleFormValues, string>> = {};
    if (mode === 'create' && !values.code.trim()) {
      errors.code = t('validation.codeRequired');
    }
    if (!values.name.trim()) {
      errors.name = t('validation.nameRequired');
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (readOnly) return;
    setFormError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const client = getApiClient();
      if (mode === 'create') {
        const body: CreateRoleRequest = {
          code: values.code.trim().toLowerCase(),
          name: values.name.trim(),
          ...(values.description.trim() ? { description: values.description.trim() } : {}),
        };
        const created = await client.createRole(body);
        router.push(`/systeme/roles/${created.id}`);
        router.refresh();
      } else if (roleId) {
        const body: UpdateRoleRequest = {
          name: values.name.trim(),
          description: values.description.trim() ? values.description.trim() : null,
        };
        await client.updateRole(roleId, body);
        router.push('/systeme/roles');
        router.refresh();
      }
    } catch (error) {
      setFormError(getRbacErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <RbacSubnav
        onNavigate={matrixDirty ? (_href, proceed) => requestAction(proceed) : undefined}
      />
      {mode === 'edit' && initialRole ? (
        <div className="flex flex-wrap items-center gap-3">
          <RoleBadge code={initialRole.code} name={initialRole.name} showCode />
          {initialRole.isSystem ? (
            <span className="text-sm text-atg-muted">{t('systemReadOnlyHint')}</span>
          ) : null}
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className={mode === 'edit' ? 'max-w-2xl space-y-4' : 'mx-auto max-w-2xl space-y-4'}
      >
        {formError ? (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400"
          >
            {formError}
          </p>
        ) : null}

        <Card variant="dashboard" className="space-y-3">
          {mode === 'create' ? (
            <Input
              label={tCommonColumns('code')}
              name="code"
              value={values.code}
              onChange={(e) => updateField('code', e.target.value.toLowerCase())}
              error={fieldErrors.code}
              hint={t('codeHint')}
              required
              autoComplete="off"
            />
          ) : (
            <Input
              label={tCommonColumns('code')}
              name="code"
              value={values.code}
              readOnly
              disabled
            />
          )}

          <Input
            label={tCommonColumns('name')}
            name="name"
            value={values.name}
            onChange={(e) => updateField('name', e.target.value)}
            error={fieldErrors.name}
            readOnly={readOnly}
            disabled={readOnly}
            required
          />

          <Textarea
            id={descriptionId}
            name="description"
            label={tCommon('form.description')}
            rows={3}
            value={values.description}
            onChange={(e) => updateField('description', e.target.value)}
            readOnly={readOnly}
            disabled={readOnly}
          />
        </Card>

        {!readOnly ? (
          <div
            className={
              mode === 'edit'
                ? 'sticky bottom-0 z-10 -mx-1 flex flex-wrap gap-3 border-t border-atg-border bg-atg-bg/95 px-1 py-3 backdrop-blur'
                : 'flex flex-wrap gap-3 pt-1'
            }
          >
            <Button type="submit" variant="primary" loading={submitting} loadingText={tLoading('submit')}>
              {mode === 'create' ? t('createSubmit') : tActions('save')}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={() => requestAction(() => router.push('/systeme/roles'))}
            >
              {tActions('cancel')}
            </Button>
          </div>
        ) : null}
      </form>

      {mode === 'edit' && roleId && initialRole ? (
        <PermissionMatrix
          roleId={roleId}
          isSystem={initialRole.isSystem}
          onDirtyChange={setMatrixDirty}
        />
      ) : null}

      <AlertDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={tUnsaved('title')}
        description={tUnsaved('description')}
        confirmLabel={tUnsaved('confirm')}
        cancelLabel={tUnsaved('cancel')}
        variant="danger"
        onConfirm={confirmDiscard}
        onCancel={cancelDiscard}
      />
    </div>
  );
}

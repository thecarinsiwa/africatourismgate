'use client';

import { Button, Input, AlertDialog } from '@africatourismgate/ui';
import type { CreateRoleRequest, Role, UpdateRoleRequest } from '@africatourismgate/types';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { RoleBadge } from './role-badge';
import { getApiClient } from '../../lib/auth/api';
import { getRbacErrorMessage } from '../../lib/rbac-errors';
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
  const router = useRouter();
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
      errors.code = 'Le code est obligatoire.';
    }
    if (!values.name.trim()) {
      errors.name = 'Le nom est obligatoire.';
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
    <div className="space-y-8">
      <RbacSubnav
        onNavigate={matrixDirty ? (_href, proceed) => requestAction(proceed) : undefined}
      />
      {mode === 'edit' && initialRole ? (
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <RoleBadge code={initialRole.code} name={initialRole.name} showCode />
          {initialRole.isSystem ? (
            <span className="text-sm text-atg-muted">Rôle système (lecture seule)</span>
          ) : null}
        </div>
      ) : null}
      <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
        {formError ? (
          <p role="alert" className="text-sm text-red-600">
            {formError}
          </p>
        ) : null}

        {mode === 'create' ? (
          <Input
            label="Code"
            name="code"
            value={values.code}
            onChange={(e) => updateField('code', e.target.value.toLowerCase())}
            error={fieldErrors.code}
            hint="Minuscules, chiffres et underscore (ex. sales_manager)."
            required
          />
        ) : (
          <Input label="Code" name="code" value={values.code} readOnly disabled />
        )}

        <Input
          label="Nom"
          name="name"
          value={values.name}
          onChange={(e) => updateField('name', e.target.value)}
          error={fieldErrors.name}
          readOnly={readOnly}
          disabled={readOnly}
          required
        />

        <Input
          label="Description"
          name="description"
          value={values.description}
          onChange={(e) => updateField('description', e.target.value)}
          readOnly={readOnly}
          disabled={readOnly}
        />

        {!readOnly ? (
          <div className="flex flex-wrap gap-3">
            <Button type="submit" loading={submitting}>
              {mode === 'create' ? 'Créer le rôle' : 'Enregistrer'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => requestAction(() => router.push('/systeme/roles'))}
            >
              Annuler
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
        title="Modifications non enregistrées"
        description="Des changements n’ont pas été enregistrés. Quitter sans sauvegarder ?"
        confirmLabel="Quitter sans enregistrer"
        cancelLabel="Continuer l’édition"
        variant="danger"
        onConfirm={confirmDiscard}
        onCancel={cancelDiscard}
      />
    </div>
  );
}

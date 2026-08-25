'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { AlertDialog, Button, Card, Input, Select } from '@africatourismgate/ui';
import type {
  CreateUserRoleAssignmentRequest,
  Role,
  ScopeType,
  User,
} from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRbacScopeTypeLabels } from '../../lib/i18n/use-module-labels';
import { getApiClient } from '../../lib/auth/api';

type UserRoleAssignmentFormProps = {
  defaultUserId?: string;
  lockUser?: boolean;
  /** Sans cadre ni titre (ex. contenu d’une Modal). */
  embedded?: boolean;
  submitLabel?: string;
  onSuccess?: () => void;
};

export function UserRoleAssignmentForm({
  defaultUserId = '',
  lockUser = false,
  embedded = false,
  submitLabel,
  onSuccess,
}: UserRoleAssignmentFormProps) {
  const { rbac: getRbacErrorMessage } = useAdminErrorMessages();
  const tRoles = useTranslations('modules.users.roles');
  const tRoleNames = useTranslations('modules.rbac.roleNames');
  const tLoading = useTranslations('common.loading');
  const scopeTypeLabels = useRbacScopeTypeLabels();
  const [userId, setUserId] = useState(defaultUserId);
  const [roleId, setRoleId] = useState('');
  const [scopeType, setScopeType] = useState<ScopeType>('global');
  const [scopeId, setScopeId] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [superAdminDialogOpen, setSuperAdminDialogOpen] = useState(false);

  const scopeTypeOptions = useMemo(
    () =>
      (['global', 'property', 'agency', 'support_queue'] as const).map((value) => ({
        value,
        label: scopeTypeLabels[value],
      })),
    [scopeTypeLabels],
  );

  const userOptions = useMemo(
    () => [
      { value: '', label: tRoles('selectPlaceholder') },
      ...users.map((user) => ({
        value: user.id,
        label: `${user.firstName} ${user.lastName} — ${user.email}`,
      })),
    ],
    [tRoles, users],
  );

  const roleOptions = useMemo(
    () => [
      { value: '', label: tRoles('selectPlaceholder') },
      ...roles.map((role) => {
        const hasTranslated =
          typeof tRoleNames.has === 'function' ? tRoleNames.has(role.code) : false;
        const displayName = hasTranslated ? tRoleNames(role.code) : role.name;
        return {
          value: role.id,
          label: `${displayName} (${role.code})`,
        };
      }),
    ],
    [tRoles, tRoleNames, roles],
  );

  const selectedRole = roles.find((r) => r.id === roleId);
  const selectedRoleDisplayName = selectedRole
    ? typeof tRoleNames.has === 'function' && tRoleNames.has(selectedRole.code)
      ? tRoleNames(selectedRole.code)
      : selectedRole.name
    : '';
  const isSuperAdminRole = selectedRole?.code === 'super_admin';

  useEffect(() => {
    setUserId(defaultUserId);
  }, [defaultUserId]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoadError(null);
      try {
        const client = getApiClient();
        const [me, usersResult, rolesResult] = await Promise.all([
          client.getAuthMe(),
          client.listUsers({ page: 1, limit: 100, status: 'active' }),
          client.listRoles({ page: 1, limit: 100, includeSystem: true }),
        ]);
        if (!cancelled) {
          setUsers(usersResult.data);
          setRoles(
            rolesResult.data.filter((r) => r.code !== 'super_admin' || me.isSuperAdmin),
          );
        }
      } catch (err) {
        if (!cancelled) {
          setUsers([]);
          setRoles([]);
          setLoadError(getRbacErrorMessage(err));
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [getRbacErrorMessage]);

  const submitAssignment = useCallback(async () => {
    setSubmitting(true);
    try {
      const body: CreateUserRoleAssignmentRequest = {
        userId,
        roleId,
        scopeType: isSuperAdminRole ? 'global' : scopeType,
        ...(scopeType !== 'global' && !isSuperAdminRole
          ? { scopeId: scopeId.trim() }
          : {}),
        ...(expiresAt ? { expiresAt } : {}),
      };
      await getApiClient().createUserRoleAssignment(body);
      setRoleId('');
      setScopeId('');
      setExpiresAt('');
      onSuccess?.();
    } catch (err) {
      setError(getRbacErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }, [
    userId,
    roleId,
    scopeType,
    scopeId,
    expiresAt,
    onSuccess,
    isSuperAdminRole,
    getRbacErrorMessage,
  ]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      if (!userId || !roleId) {
        setError(tRoles('validation.userAndRoleRequired'));
        return;
      }
      if (scopeType !== 'global' && !scopeId.trim()) {
        setError(tRoles('validation.scopeIdRequired'));
        return;
      }

      if (isSuperAdminRole) {
        setSuperAdminDialogOpen(true);
        return;
      }

      await submitAssignment();
    },
    [userId, roleId, scopeType, scopeId, isSuperAdminRole, tRoles, submitAssignment],
  );

  const fields = (
    <>
      {loadError ? (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400"
        >
          {loadError}
        </p>
      ) : null}
      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400"
        >
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {lockUser ? null : (
          <Select
            label={tRoles('user')}
            value={userId}
            options={userOptions}
            onChange={(e) => setUserId(e.target.value)}
          />
        )}

        <div className="space-y-1">
          <Select
            label={tRoles('role')}
            value={roleId}
            options={roleOptions}
            onChange={(e) => {
              const nextId = e.target.value;
              setRoleId(nextId);
              const nextRole = roles.find((r) => r.id === nextId);
              if (nextRole?.code === 'super_admin') {
                setScopeType('global');
                setScopeId('');
              }
            }}
          />
          {isSuperAdminRole ? (
            <p className="text-xs text-amber-700 dark:text-amber-400">
              {tRoles('superAdminWarning')}
            </p>
          ) : null}
        </div>

        <Select
          label={tRoles('scope')}
          value={scopeType}
          options={scopeTypeOptions}
          disabled={isSuperAdminRole}
          onChange={(e) => {
            setScopeType(e.target.value as ScopeType);
            if (e.target.value === 'global') setScopeId('');
          }}
        />

        {scopeType !== 'global' ? (
          <Input
            label={tRoles('scopeId')}
            value={scopeId}
            onChange={(e) => setScopeId(e.target.value)}
            hint={tRoles('scopeIdHint')}
          />
        ) : null}

        <Input
          label={tRoles('expiresAt')}
          type="datetime-local"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-3 pt-1">
        <Button
          type="submit"
          variant="primary"
          loading={submitting}
          loadingText={tLoading('submit')}
        >
          {submitLabel ?? tRoles('assignFormTitle')}
        </Button>
      </div>
    </>
  );

  return (
    <>
      <AlertDialog
        open={superAdminDialogOpen}
        onOpenChange={setSuperAdminDialogOpen}
        title={tRoles('superAdminConfirmTitle')}
        description={tRoles('superAdminConfirm', {
          roleName: selectedRoleDisplayName || 'super_admin',
        })}
        confirmLabel={tRoles('superAdminConfirmButton')}
        cancelLabel={tRoles('cancel')}
        variant="danger"
        loading={submitting}
        onConfirm={() => {
          setSuperAdminDialogOpen(false);
          void submitAssignment();
        }}
      />
      {embedded ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields}
        </form>
      ) : (
        <Card variant="dashboard" padding="md" className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-atg-fg">{tRoles('assignFormTitle')}</h3>
            <p className="mt-0.5 text-sm text-atg-muted">{tRoles('assignFormHint')}</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {fields}
          </form>
        </Card>
      )}
    </>
  );
}

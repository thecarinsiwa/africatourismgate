'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { Button, Input } from '@africatourismgate/ui';
import type {
  CreateUserRoleAssignmentRequest,
  Role,
  ScopeType,
  User,
} from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { useRbacScopeTypeLabels } from '../../lib/i18n/use-module-labels';
import { getApiClient } from '../../lib/auth/api';

type UserRoleAssignmentFormProps = {
  defaultUserId?: string;
  lockUser?: boolean;
  onSuccess?: () => void;
};

export function UserRoleAssignmentForm({
  defaultUserId = '',
  lockUser = false,
  onSuccess,
}: UserRoleAssignmentFormProps) {
  const { rbac: getRbacErrorMessage } = useAdminErrorMessages();
  const tRoles = useTranslations('modules.users.roles');
  const scopeTypeLabels = useRbacScopeTypeLabels();
  const userFieldId = useId();
  const roleFieldId = useId();
  const scopeTypeId = useId();
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

  const scopeTypeOptions = useMemo(
    () =>
      (['global', 'property', 'agency', 'support_queue'] as const).map((value) => ({
        value,
        label: scopeTypeLabels[value],
      })),
    [scopeTypeLabels],
  );

  const selectedRole = roles.find((r) => r.id === roleId);
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
            rolesResult.data.filter(
              (r) => r.code !== 'super_admin' || me.isSuperAdmin,
            ),
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
        const label = selectedRole?.name ?? 'super_admin';
        const confirmed = window.confirm(
          tRoles('superAdminConfirm', { roleName: label }),
        );
        if (!confirmed) return;
      }

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
    },
    [
      userId,
      roleId,
      scopeType,
      scopeId,
      expiresAt,
      onSuccess,
      isSuperAdminRole,
      selectedRole?.name,
      tRoles,
      getRbacErrorMessage,
    ],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-atg-border p-4">
      <h3 className="text-sm font-semibold text-atg-fg">{tRoles('assignFormTitle')}</h3>
      {loadError ? (
        <p role="alert" className="text-sm text-red-600">
          {loadError}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}

      <div>
        <label htmlFor={userFieldId} className="mb-2 block text-sm font-medium text-atg-fg">
          {tRoles('user')}
        </label>
        <select
          id={userFieldId}
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          disabled={lockUser}
          className="w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm disabled:opacity-60"
        >
          <option value="">{tRoles('selectPlaceholder')}</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.firstName} {u.lastName} — {u.email}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor={roleFieldId} className="mb-2 block text-sm font-medium text-atg-fg">
          {tRoles('role')}
        </label>
        <select
          id={roleFieldId}
          value={roleId}
          onChange={(e) => {
            const nextId = e.target.value;
            setRoleId(nextId);
            const nextRole = roles.find((r) => r.id === nextId);
            if (nextRole?.code === 'super_admin') {
              setScopeType('global');
              setScopeId('');
            }
          }}
          className="w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm"
        >
          <option value="">{tRoles('selectPlaceholder')}</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name} ({r.code})
            </option>
          ))}
        </select>
        {isSuperAdminRole ? (
          <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
            {tRoles('superAdminWarning')}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={scopeTypeId} className="mb-2 block text-sm font-medium text-atg-fg">
            {tRoles('scope')}
          </label>
          <select
            id={scopeTypeId}
            value={scopeType}
            disabled={isSuperAdminRole}
            onChange={(e) => {
              setScopeType(e.target.value as ScopeType);
              if (e.target.value === 'global') setScopeId('');
            }}
            className="w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm disabled:opacity-60"
          >
            {scopeTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        {scopeType !== 'global' ? (
          <Input
            label={tRoles('scopeId')}
            value={scopeId}
            onChange={(e) => setScopeId(e.target.value)}
            hint={tRoles('scopeIdHint')}
          />
        ) : null}
      </div>

      <Input
        label={tRoles('expiresAt')}
        type="datetime-local"
        value={expiresAt}
        onChange={(e) => setExpiresAt(e.target.value)}
      />

      <Button type="submit" loading={submitting} size="sm">
        {tRoles('assignFormTitle')}
      </Button>
    </form>
  );
}

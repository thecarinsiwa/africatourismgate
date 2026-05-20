'use client';

import { Button, Input } from '@africatourismgate/ui';
import type {
  CreateUserRoleAssignmentRequest,
  Role,
  ScopeType,
  User,
} from '@africatourismgate/types';
import { useCallback, useEffect, useId, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { getRbacErrorMessage } from '../../lib/rbac-errors';

const scopeLabels: Record<ScopeType, string> = {
  global: 'Global',
  property: 'Propriété',
  agency: 'Agence',
  support_queue: 'File support',
};

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

  useEffect(() => {
    setUserId(defaultUserId);
  }, [defaultUserId]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoadError(null);
      try {
        const client = getApiClient();
        const [usersResult, rolesResult] = await Promise.all([
          client.listUsers({ page: 1, limit: 100, status: 'active' }),
          client.listRoles({ page: 1, limit: 100, includeSystem: true }),
        ]);
        if (!cancelled) {
          setUsers(usersResult.data);
          setRoles(rolesResult.data.filter((r) => !r.isSystem || r.code !== 'super_admin'));
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
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      if (!userId || !roleId) {
        setError('Utilisateur et rôle sont obligatoires.');
        return;
      }
      if (scopeType !== 'global' && !scopeId.trim()) {
        setError("L'identifiant de scope est obligatoire pour ce périmètre.");
        return;
      }

      setSubmitting(true);
      try {
        const body: CreateUserRoleAssignmentRequest = {
          userId,
          roleId,
          scopeType,
          ...(scopeType !== 'global' ? { scopeId: scopeId.trim() } : {}),
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
    [userId, roleId, scopeType, scopeId, expiresAt, onSuccess],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-atg-border p-4">
      <h3 className="text-sm font-semibold text-atg-fg">Assigner un rôle</h3>
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
          Utilisateur
        </label>
        <select
          id={userFieldId}
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          disabled={lockUser}
          className="w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm disabled:opacity-60"
        >
          <option value="">Sélectionner…</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.firstName} {u.lastName} — {u.email}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor={roleFieldId} className="mb-2 block text-sm font-medium text-atg-fg">
          Rôle
        </label>
        <select
          id={roleFieldId}
          value={roleId}
          onChange={(e) => setRoleId(e.target.value)}
          className="w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm"
        >
          <option value="">Sélectionner…</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name} ({r.code})
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={scopeTypeId} className="mb-2 block text-sm font-medium text-atg-fg">
            Périmètre (scope)
          </label>
          <select
            id={scopeTypeId}
            value={scopeType}
            onChange={(e) => {
              setScopeType(e.target.value as ScopeType);
              if (e.target.value === 'global') setScopeId('');
            }}
            className="w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm"
          >
            {(Object.keys(scopeLabels) as ScopeType[]).map((s) => (
              <option key={s} value={s}>
                {scopeLabels[s]}
              </option>
            ))}
          </select>
        </div>
        {scopeType !== 'global' ? (
          <Input
            label="ID du scope (UUID)"
            value={scopeId}
            onChange={(e) => setScopeId(e.target.value)}
            hint="Ex. ID propriété, agence ou file support."
          />
        ) : null}
      </div>

      <Input
        label="Expiration (optionnel)"
        type="datetime-local"
        value={expiresAt}
        onChange={(e) => setExpiresAt(e.target.value)}
      />

      <Button type="submit" loading={submitting} size="sm">
        Assigner
      </Button>
    </form>
  );
}

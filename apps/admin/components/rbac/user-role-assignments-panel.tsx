'use client';

import { Button, Card } from '@africatourismgate/ui';
import type { UserRoleAssignment } from '@africatourismgate/types';
import { useCallback, useEffect, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { getRbacErrorMessage } from '../../lib/rbac-errors';
import { UserRoleAssignmentForm } from './user-role-assignment-form';

function scopeLabel(row: UserRoleAssignment): string {
  if (row.scopeType === 'global') return 'Global';
  return `${row.scopeType}${row.scopeId ? `: ${row.scopeId}` : ''}`;
}

type UserRoleAssignmentsPanelProps = {
  userId: string;
};

export function UserRoleAssignmentsPanel({ userId }: UserRoleAssignmentsPanelProps) {
  const [assignments, setAssignments] = useState<UserRoleAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getApiClient().listUserRoleAssignments({
        userId,
        page: 1,
        limit: 100,
        includeRevoked: false,
      });
      setAssignments(result.data);
    } catch (err) {
      setError(getRbacErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleRevoke(id: string) {
    if (!window.confirm('Révoquer ce rôle ?')) return;
    setRevokingId(id);
    try {
      await getApiClient().revokeUserRoleAssignment(id);
      await load();
    } catch (err) {
      window.alert(getRbacErrorMessage(err));
    } finally {
      setRevokingId(null);
    }
  }

  return (
    <Card variant="dashboard" padding="lg" className="mt-8 space-y-4">
      <h2 className="text-lg font-semibold text-atg-fg">Rôles assignés</h2>
      {error ? (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}
      {loading ? (
        <p className="text-sm text-atg-muted">Chargement…</p>
      ) : assignments.length === 0 ? (
        <p className="text-sm text-atg-muted">Aucun rôle actif pour cet utilisateur.</p>
      ) : (
        <ul className="divide-y divide-atg-border">
          {assignments.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
              <div>
                <span className="font-medium text-atg-fg">
                  {a.role?.name ?? a.roleId.slice(0, 8)}
                </span>
                <span className="ml-2 text-xs text-atg-muted">
                  {a.role?.code} · {scopeLabel(a)}
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => void handleRevoke(a.id)}
                disabled={revokingId === a.id}
                loading={revokingId === a.id}
                className="!text-red-600"
              >
                Révoquer
              </Button>
            </li>
          ))}
        </ul>
      )}
      <UserRoleAssignmentForm
        defaultUserId={userId}
        lockUser
        onSuccess={() => void load()}
      />
    </Card>
  );
}

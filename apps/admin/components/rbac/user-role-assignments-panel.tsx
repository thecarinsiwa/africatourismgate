'use client';

import {
  AlertDialog,
  Button,
  Card,
  useToast,
} from '@africatourismgate/ui';
import type { UserRoleAssignment } from '@africatourismgate/types';
import { useCallback, useEffect, useState } from 'react';
import { formatAssignmentScope } from '../../lib/rbac-display';
import { getApiClient } from '../../lib/auth/api';
import { getRbacErrorMessage } from '../../lib/rbac-errors';
import { RoleBadge } from './role-badge';
import { UserRoleAssignmentForm } from './user-role-assignment-form';

type UserRoleAssignmentsPanelProps = {
  userId: string;
};

export function UserRoleAssignmentsPanel({ userId }: UserRoleAssignmentsPanelProps) {
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<UserRoleAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [pendingRevoke, setPendingRevoke] = useState<UserRoleAssignment | null>(null);

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

  const confirmRevoke = useCallback(async () => {
    if (!pendingRevoke) return;
    setRevokingId(pendingRevoke.id);
    try {
      await getApiClient().revokeUserRoleAssignment(pendingRevoke.id);
      toast({
        title: 'Rôle révoqué',
        message: 'L’assignation a été retirée.',
        variant: 'success',
      });
      setPendingRevoke(null);
      await load();
    } catch (err) {
      toast({
        title: 'Échec de la révocation',
        message: getRbacErrorMessage(err),
        variant: 'error',
      });
    } finally {
      setRevokingId(null);
    }
  }, [pendingRevoke, load, toast]);

  return (
    <Card variant="dashboard" padding="lg" className="space-y-4">
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
        <div className="flex flex-wrap gap-2">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="flex flex-wrap items-center gap-2 rounded-lg border border-atg-border bg-atg-elevated px-3 py-2"
            >
              {assignment.role ? (
                <RoleBadge code={assignment.role.code} name={assignment.role.name} />
              ) : (
                <RoleBadge code={assignment.roleId.slice(0, 8)} />
              )}
              <span className="text-xs text-atg-muted">
                {formatAssignmentScope(assignment.scopeType, assignment.scopeId)}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setPendingRevoke(assignment)}
                disabled={revokingId === assignment.id}
                loading={revokingId === assignment.id}
                className="!text-red-600"
              >
                Révoquer
              </Button>
            </div>
          ))}
        </div>
      )}
      <UserRoleAssignmentForm
        defaultUserId={userId}
        lockUser
        onSuccess={() => void load()}
      />

      <AlertDialog
        open={pendingRevoke !== null}
        onOpenChange={(open) => {
          if (!open) setPendingRevoke(null);
        }}
        title="Révoquer le rôle"
        description="Retirer ce rôle pour cet utilisateur ?"
        confirmLabel="Révoquer"
        variant="danger"
        loading={revokingId !== null}
        onConfirm={() => void confirmRevoke()}
      />
    </Card>
  );
}

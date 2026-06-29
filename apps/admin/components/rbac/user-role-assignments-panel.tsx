'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  AlertDialog,
  Button,
  Card,
  useToast,
} from '@africatourismgate/ui';
import type { UserRoleAssignment } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { useRbacScopeDisplayLabels } from '../../lib/i18n/use-module-labels';
import { formatAssignmentScope } from '../../lib/rbac-display';
import { getApiClient } from '../../lib/auth/api';
import { RoleBadge } from './role-badge';
import { UserRoleAssignmentForm } from './user-role-assignment-form';

type UserRoleAssignmentsPanelProps = {
  userId: string;
};

export function UserRoleAssignmentsPanel({ userId }: UserRoleAssignmentsPanelProps) {
  const { rbac: getRbacErrorMessage } = useAdminErrorMessages();
  const tRoles = useTranslations('modules.users.roles');
  const tCommon = useTranslations('modules.common');
  const scopeLabels = useRbacScopeDisplayLabels();
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
  }, [userId, getRbacErrorMessage]);

  useEffect(() => {
    void load();
  }, [load]);

  const confirmRevoke = useCallback(async () => {
    if (!pendingRevoke) return;
    setRevokingId(pendingRevoke.id);
    try {
      await getApiClient().revokeUserRoleAssignment(pendingRevoke.id);
      toast({
        title: tRoles('toast.revokedTitle'),
        message: tRoles('toast.revokedMessage'),
        variant: 'success',
      });
      setPendingRevoke(null);
      await load();
    } catch (err) {
      toast({
        title: tRoles('toast.revokeFailedTitle'),
        message: getRbacErrorMessage(err),
        variant: 'error',
      });
    } finally {
      setRevokingId(null);
    }
  }, [pendingRevoke, load, toast, tRoles, getRbacErrorMessage]);

  return (
    <Card variant="dashboard" padding="lg" className="space-y-4">
      <h2 className="text-lg font-semibold text-atg-fg">{tRoles('assignedTitle')}</h2>
      {error ? (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}
      {loading ? (
        <p className="text-sm text-atg-muted">{tCommon('loading')}</p>
      ) : assignments.length === 0 ? (
        <p className="text-sm text-atg-muted">{tRoles('empty')}</p>
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
                {formatAssignmentScope(
                  assignment.scopeType,
                  scopeLabels,
                  assignment.scopeId,
                )}
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
                {tRoles('revokeDialog.title')}
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
        title={tRoles('revokeDialog.title')}
        description={tRoles('revokeDialog.description')}
        confirmLabel={tRoles('revokeDialog.title')}
        variant="danger"
        loading={revokingId !== null}
        onConfirm={() => void confirmRevoke()}
      />
    </Card>
  );
}

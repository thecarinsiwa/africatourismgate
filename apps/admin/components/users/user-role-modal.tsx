'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';
import { useRbacScopeDisplayLabels } from '../../lib/i18n/use-module-labels';

import {
  AlertDialog,
  Avatar,
  Button,
  Modal,
  useToast,
} from '@africatourismgate/ui';
import type { User, UserRoleAssignment } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { formatAssignmentScope } from '../../lib/rbac-display';
import { getApiClient } from '../../lib/auth/api';
import { RoleBadge } from '../rbac/role-badge';
import { UserRoleAssignmentForm } from '../rbac/user-role-assignment-form';

type UserRoleModalProps = {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChanged?: () => void;
};

export function UserRoleModal({
  user,
  open,
  onOpenChange,
  onChanged,
}: UserRoleModalProps) {
  const { rbac: getRbacErrorMessage } = useAdminErrorMessages();
  const tRoles = useTranslations('modules.users.roles');
  const tCommon = useTranslations('modules.common');
  const scopeLabels = useRbacScopeDisplayLabels();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<UserRoleAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [pendingRevoke, setPendingRevoke] = useState<UserRoleAssignment | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getApiClient().listUserRoleAssignments({
        userId: user.id,
        page: 1,
        limit: 100,
        includeRevoked: false,
      });
      setAssignments(result.data);
    } catch (err) {
      setError(getRbacErrorMessage(err));
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  }, [user, getRbacErrorMessage]);

  useEffect(() => {
    if (open && user) {
      void load();
    }
    if (!open) {
      setAssignments([]);
      setError(null);
      setPendingRevoke(null);
    }
  }, [open, user, load]);

  const handleAssignSuccess = useCallback(() => {
    toast({
      title: tRoles('toast.assignedTitle'),
      message: tRoles('toast.assignedMessage'),
      variant: 'success',
    });
    void load();
    onChanged?.();
  }, [toast, tRoles, load, onChanged]);

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
      onChanged?.();
    } catch (err) {
      toast({
        title: tRoles('toast.revokeFailedTitle'),
        message: getRbacErrorMessage(err),
        variant: 'error',
      });
    } finally {
      setRevokingId(null);
    }
  }, [pendingRevoke, load, toast, tRoles, getRbacErrorMessage, onChanged]);

  if (!user) return null;

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');

  return (
    <>
      <Modal
        open={open}
        onOpenChange={onOpenChange}
        title={tRoles('modalTitle')}
        description={tRoles('modalDescription')}
        showClose
        closeAriaLabel={tRoles('cancel')}
        className="max-w-xl max-h-[90vh] overflow-y-auto"
      >
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-atg-border bg-atg-surface/60 px-4 py-3">
          <Avatar
            email={user.email}
            firstName={user.firstName}
            lastName={user.lastName}
            size="md"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-atg-fg">
              {fullName || user.email}
            </p>
            {fullName ? (
              <p className="truncate text-xs text-atg-muted">{user.email}</p>
            ) : null}
          </div>
        </div>

        <section className="mb-6 space-y-3">
          <h3 className="text-sm font-semibold text-atg-fg">{tRoles('assignedTitle')}</h3>
          {error ? (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          ) : null}
          {loading ? (
            <p className="text-sm text-atg-muted">{tCommon('loading')}</p>
          ) : assignments.length === 0 ? (
            <p className="text-sm text-atg-muted">{tRoles('empty')}</p>
          ) : (
            <ul className="space-y-2">
              {assignments.map((assignment) => (
                <li
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
                    className="ml-auto !text-red-600"
                  >
                    {tRoles('revokeDialog.title')}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-3 border-t border-atg-border pt-5">
          <h3 className="text-sm font-semibold text-atg-fg">{tRoles('assignFormTitle')}</h3>
          <UserRoleAssignmentForm
            defaultUserId={user.id}
            lockUser
            embedded
            submitLabel={tRoles('assignSubmit')}
            onSuccess={handleAssignSuccess}
          />
        </section>
      </Modal>

      <AlertDialog
        open={pendingRevoke !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setPendingRevoke(null);
        }}
        title={tRoles('revokeDialog.title')}
        description={tRoles('revokeDialog.description')}
        confirmLabel={tRoles('revokeDialog.title')}
        cancelLabel={tRoles('cancel')}
        variant="danger"
        loading={revokingId !== null}
        onConfirm={() => void confirmRevoke()}
      />
    </>
  );
}

'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  AlertDialog,
  Card,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  useToast,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { UserRoleAssignment } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRbacScopeDisplayLabels } from '../../lib/i18n/use-module-labels';
import { formatAssignmentScope } from '../../lib/rbac-display';
import { getApiClient } from '../../lib/auth/api';
import { RoleBadge } from './role-badge';
import { UserRoleAssignmentForm } from './user-role-assignment-form';

type UserRoleAssignmentsPanelProps = {
  userId: string;
  /** Affiche les rôles sans formulaire ni révocation. */
  readOnly?: boolean;
  onChanged?: () => void;
};

export function UserRoleAssignmentsPanel({
  userId,
  readOnly = false,
  onChanged,
}: UserRoleAssignmentsPanelProps) {
  const { rbac: getRbacErrorMessage } = useAdminErrorMessages();
  const tRoles = useTranslations('modules.users.roles');
  const tCommon = useTranslations('modules.common');
  const tDataTable = useTranslations('modules.common.dataTable');
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

  const columns = useMemo<ColumnDef<UserRoleAssignment, unknown>[]>(() => {
    const cols: ColumnDef<UserRoleAssignment, unknown>[] = [
      {
        id: 'role',
        header: tCommon('columns.role'),
        meta: { cellClassName: 'min-w-0' },
        cell: ({ row }) => {
          const role = row.original.role;
          return (
            <div className="min-w-0">
              {role ? (
                <RoleBadge code={role.code} name={role.name} />
              ) : (
                <RoleBadge code={row.original.roleId.slice(0, 8)} />
              )}
            </div>
          );
        },
      },
      {
        id: 'scope',
        header: tRoles('scope'),
        meta: { hideOnMobile: true },
        cell: ({ row }) => (
          <span className="text-sm text-atg-muted">
            {formatAssignmentScope(
              row.original.scopeType,
              scopeLabels,
              row.original.scopeId,
              row.original.scopeName,
            )}
          </span>
        ),
      },
    ];

    if (!readOnly) {
      cols.push({
        id: 'actions',
        header: tCommon('columns.actions'),
        meta: { align: 'right', cellClassName: 'w-[5.5rem] sm:w-auto' },
        cell: ({ row }) => {
          const assignment = row.original;
          const busy = revokingId === assignment.id;
          return (
            <DataTableActions>
              <DataTableActionButton
                action="revoke"
                label={tRoles('revokeDialog.title')}
                onClick={() => setPendingRevoke(assignment)}
                disabled={busy}
                loading={busy}
              />
            </DataTableActions>
          );
        },
      });
    }

    return cols;
  }, [readOnly, revokingId, scopeLabels, tCommon, tRoles]);

  return (
    <Card variant="dashboard" padding="lg" className="min-w-0 space-y-4 overflow-x-hidden">
      <h2 className="text-lg font-semibold text-atg-fg">{tRoles('assignedTitle')}</h2>
      {error ? (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}
      <Card variant="dashboard" padding="none" className="min-w-0 overflow-hidden">
        <DataTable
          columns={columns}
          data={assignments}
          isLoading={loading}
          loadingMessage={tDataTable('loading')}
          emptyMessage={tRoles('empty')}
          expandRowLabel={tDataTable('expandRow')}
          collapseRowLabel={tDataTable('collapseRow')}
          expandRowAriaLabel={tDataTable('expandRowAria')}
          getRowId={(row) => row.id}
          aria-label={tRoles('assignedTitle')}
          className="min-w-0"
        />
      </Card>
      {readOnly ? null : (
        <UserRoleAssignmentForm
          defaultUserId={userId}
          lockUser
          onSuccess={() => {
            void load();
            onChanged?.();
          }}
        />
      )}

      {readOnly ? null : (
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
      )}
    </Card>
  );
}

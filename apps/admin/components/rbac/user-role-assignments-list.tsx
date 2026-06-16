'use client';

import {
  AlertDialog,
  Avatar,
  Card,
  useToast,
} from '@africatourismgate/ui';
import type { UserRoleAssignment } from '@africatourismgate/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { formatAssignmentScope } from '../../lib/rbac-display';
import { getApiClient } from '../../lib/auth/api';
import { getRbacErrorMessage } from '../../lib/rbac-errors';
import { UserIdFilterBar } from '../users/user-id-filter-bar';
import { RoleBadge } from './role-badge';
import { RbacSubnav } from './rbac-subnav';
import { UserRoleAssignmentForm } from './user-role-assignment-form';

const PAGE_SIZE = 50;

type UserAssignmentGroup = {
  userId: string;
  user: UserRoleAssignment['user'];
  assignments: UserRoleAssignment[];
};

export function UserRoleAssignmentsList() {
  const { toast } = useToast();
  const [userIdFilter, setUserIdFilter] = useState('');
  const [page, setPage] = useState(1);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | {
        status: 'ready';
        assignments: UserRoleAssignment[];
        total: number;
        totalPages: number;
      }
  >({ status: 'loading' });
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [pendingRevoke, setPendingRevoke] = useState<UserRoleAssignment | null>(null);

  const handleUserIdChange = useCallback((userId: string) => {
    setUserIdFilter(userId);
    setPage(1);
  }, []);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listUserRoleAssignments({
        page,
        limit: PAGE_SIZE,
        includeRevoked: false,
        userId: userIdFilter || undefined,
      });
      setState({
        status: 'ready',
        assignments: result.data,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      setState({ status: 'error', message: getRbacErrorMessage(error) });
    }
  }, [page, userIdFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const groupedByUser = useMemo<UserAssignmentGroup[]>(() => {
    if (state.status !== 'ready') return [];

    const groups = new Map<string, UserAssignmentGroup>();
    for (const assignment of state.assignments) {
      const existing = groups.get(assignment.userId);
      if (existing) {
        existing.assignments.push(assignment);
      } else {
        groups.set(assignment.userId, {
          userId: assignment.userId,
          user: assignment.user,
          assignments: [assignment],
        });
      }
    }

    return Array.from(groups.values()).sort((a, b) => {
      const nameA = a.user
        ? `${a.user.lastName} ${a.user.firstName}`.toLowerCase()
        : a.userId;
      const nameB = b.user
        ? `${b.user.lastName} ${b.user.firstName}`.toLowerCase()
        : b.userId;
      return nameA.localeCompare(nameB, 'fr');
    });
  }, [state]);

  const confirmRevoke = useCallback(async () => {
    if (!pendingRevoke) return;
    setRevokingId(pendingRevoke.id);
    try {
      await getApiClient().revokeUserRoleAssignment(pendingRevoke.id);
      toast({
        title: 'Assignation révoquée',
        message: 'Le rôle a été retiré pour cet utilisateur.',
        variant: 'success',
      });
      setPendingRevoke(null);
      await load();
    } catch (error) {
      toast({
        title: 'Échec de la révocation',
        message: getRbacErrorMessage(error),
        variant: 'error',
      });
    } finally {
      setRevokingId(null);
    }
  }, [pendingRevoke, load, toast]);

  return (
    <div className="space-y-6">
      <RbacSubnav />

      <UserIdFilterBar onUserIdChange={handleUserIdChange} />

      <UserRoleAssignmentForm onSuccess={() => void load()} />

      {state.status === 'error' ? (
        <p role="alert" className="text-sm text-red-600">
          {state.message}
        </p>
      ) : state.status === 'loading' ? (
        <p className="text-sm text-atg-muted">Chargement des assignations…</p>
      ) : groupedByUser.length === 0 ? (
        <Card variant="dashboard" padding="lg">
          <p className="text-sm text-atg-muted">Aucune assignation active.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {groupedByUser.map((group) => (
            <Card key={group.userId} variant="dashboard" padding="lg" className="space-y-4">
              <div className="flex items-start gap-3">
                {group.user ? (
                  <>
                    <Avatar
                      email={group.user.email}
                      firstName={group.user.firstName}
                      lastName={group.user.lastName}
                      size="md"
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-atg-fg">
                        {group.user.firstName} {group.user.lastName}
                      </p>
                      <p className="truncate text-sm text-atg-muted">{group.user.email}</p>
                    </div>
                  </>
                ) : (
                  <p className="font-mono text-sm text-atg-muted">{group.userId}</p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {group.assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex flex-wrap items-center gap-2 rounded-lg border border-atg-border bg-atg-elevated px-3 py-2"
                  >
                    {assignment.role ? (
                      <RoleBadge
                        code={assignment.role.code}
                        name={assignment.role.name}
                      />
                    ) : (
                      <RoleBadge code={assignment.roleId.slice(0, 8)} />
                    )}
                    <span className="text-xs text-atg-muted">
                      {formatAssignmentScope(assignment.scopeType, assignment.scopeId)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPendingRevoke(assignment)}
                      disabled={revokingId === assignment.id}
                      className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
                    >
                      Révoquer
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog
        open={pendingRevoke !== null}
        onOpenChange={(open) => {
          if (!open) setPendingRevoke(null);
        }}
        title="Révoquer l’assignation"
        description="Retirer ce rôle pour l’utilisateur sur ce périmètre ?"
        confirmLabel="Révoquer"
        variant="danger"
        loading={revokingId !== null}
        onConfirm={() => void confirmRevoke()}
      />
    </div>
  );
}

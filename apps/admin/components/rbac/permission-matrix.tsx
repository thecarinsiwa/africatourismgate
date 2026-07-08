'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  Button,
  Card,
  useToast,
} from '@africatourismgate/ui';
import type { Permission } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  useRbacPermissionActionLabels,
  useRbacPermissionDomainLabels,
} from '../../lib/i18n/use-module-labels';
import {
  formatPermissionAction,
  formatPermissionDomain,
} from '../../lib/rbac-display';
import { getApiClient } from '../../lib/auth/api';

type PermissionMatrixProps = {
  roleId: string;
  isSystem: boolean;
  onDirtyChange?: (dirty: boolean) => void;
};

type DomainGroup = {
  resource: string;
  label: string;
  actions: string[];
  permissionByAction: Map<string, Permission>;
};

function setsEqual(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) return false;
  for (const value of Array.from(a)) {
    if (!b.has(value)) return false;
  }
  return true;
}

export function PermissionMatrix({
  roleId,
  isSystem,
  onDirtyChange,
}: PermissionMatrixProps) {
  const { rbac: getRbacErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.rbac.matrix');
  const tUnsaved = useTranslations('modules.rbac.unsavedChanges');
  const tCommon = useTranslations('modules.common');
  const tActions = useTranslations('common.actions');
  const domainLabels = useRbacPermissionDomainLabels();
  const actionLabels = useRbacPermissionActionLabels();
  const emptyDash = tCommon('empty.dash');
  const { toast } = useToast();
  const readOnly = isSystem;
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDirty = !readOnly && !setsEqual(savedIds, selectedIds);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  useEffect(() => {
    if (!isDirty) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const client = getApiClient();
      const [permsResult, rolePerms] = await Promise.all([
        client.listPermissions({ page: 1, limit: 100 }),
        client.getRolePermissions(roleId),
      ]);
      setPermissions(permsResult.data);
      const ids = new Set(rolePerms.permissionIds);
      setSavedIds(ids);
      setSelectedIds(new Set(ids));
    } catch (err) {
      setError(getRbacErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [roleId, getRbacErrorMessage]);

  useEffect(() => {
    void load();
  }, [load]);

  const domainGroups = useMemo<DomainGroup[]>(() => {
    const byResource = new Map<string, Permission[]>();
    for (const permission of permissions) {
      const list = byResource.get(permission.resource) ?? [];
      list.push(permission);
      byResource.set(permission.resource, list);
    }

    return Array.from(byResource.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([resource, perms]) => {
        const sorted = [...perms].sort((a, b) => a.action.localeCompare(b.action));
        const permissionByAction = new Map(sorted.map((perm) => [perm.action, perm]));
        return {
          resource,
          label: formatPermissionDomain(resource, domainLabels, emptyDash),
          actions: sorted.map((perm) => perm.action),
          permissionByAction,
        };
      });
  }, [permissions, domainLabels, emptyDash]);

  function togglePermission(permissionId: string) {
    if (readOnly) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(permissionId)) next.delete(permissionId);
      else next.add(permissionId);
      return next;
    });
  }

  function toggleDomain(group: DomainGroup, checked: boolean) {
    if (readOnly) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const permission of Array.from(group.permissionByAction.values())) {
        if (checked) next.add(permission.id);
        else next.delete(permission.id);
      }
      return next;
    });
  }

  function domainSelectionState(group: DomainGroup): 'none' | 'some' | 'all' {
    const ids = Array.from(group.permissionByAction.values()).map((perm) => perm.id);
    const selectedCount = ids.filter((id) => selectedIds.has(id)).length;
    if (selectedCount === 0) return 'none';
    if (selectedCount === ids.length) return 'all';
    return 'some';
  }

  function handleCancel() {
    setSelectedIds(new Set(savedIds));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const result = await getApiClient().replaceRolePermissions(roleId, {
        permissionIds: Array.from(selectedIds),
      });
      const ids = new Set(result.permissionIds);
      setSavedIds(ids);
      setSelectedIds(new Set(ids));
      toast({
        title: t('toast.savedTitle'),
        message: t('toast.savedMessage'),
        variant: 'success',
      });
    } catch (err) {
      const message = getRbacErrorMessage(err);
      setError(message);
      toast({
        title: t('toast.saveFailedTitle'),
        message,
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-atg-muted">{t('loading')}</p>;
  }

  return (
    <>
      <Card variant="dashboard" padding="lg" className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-atg-fg">{t('title')}</h2>
          <p className="text-sm text-atg-muted">
            {readOnly ? t('descriptionReadOnly') : t('descriptionEditable')}
          </p>
        </div>

        {error ? (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        ) : null}

        <div className="space-y-4">
          {domainGroups.map((group) => {
            const selection = domainSelectionState(group);
            return (
              <Card
                key={group.resource}
                variant="dashboard"
                padding="md"
                className="space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="font-medium text-atg-fg">{group.label}</h3>
                    <p className="font-mono text-xs text-atg-muted">{group.resource}.*</p>
                  </div>
                </div>

                <div className="-mx-2 overflow-x-auto px-2 sm:mx-0 sm:px-0">
                  <table className="w-full min-w-[320px] border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-atg-border text-left text-atg-muted">
                        <th className="py-2 pr-4 font-medium">{t('columns.scope')}</th>
                        {group.actions.map((action) => (
                          <th
                            key={action}
                            className="px-2 py-2 text-center font-medium whitespace-nowrap"
                          >
                            {formatPermissionAction(action, actionLabels)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-atg-border/60">
                        <td className="py-2 pr-4 font-medium text-atg-fg">{t('wholeDomain')}</td>
                        {group.actions.map((action) => {
                          const permission = group.permissionByAction.get(action);
                          if (!permission) {
                            return (
                              <td key={action} className="px-2 py-2 text-center text-atg-muted">
                                {emptyDash}
                              </td>
                            );
                          }
                          return (
                            <td key={action} className="px-2 py-2 text-center">
                              <input
                                type="checkbox"
                                checked={selection === 'all'}
                                ref={(element) => {
                                  if (element) {
                                    element.indeterminate = selection === 'some';
                                  }
                                }}
                                disabled={readOnly}
                                onChange={(event) =>
                                  toggleDomain(group, event.target.checked)
                                }
                                aria-label={t('ariaToggleDomain', {
                                  domain: group.label,
                                  action: formatPermissionAction(action, actionLabels),
                                })}
                                className="h-4 w-4 rounded border-atg-border"
                              />
                            </td>
                          );
                        })}
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 text-atg-muted">{t('perAction')}</td>
                        {group.actions.map((action) => {
                          const permission = group.permissionByAction.get(action);
                          if (!permission) {
                            return (
                              <td key={action} className="px-2 py-2 text-center text-atg-muted">
                                {emptyDash}
                              </td>
                            );
                          }
                          return (
                            <td key={action} className="px-2 py-2 text-center">
                              <input
                                type="checkbox"
                                checked={selectedIds.has(permission.id)}
                                disabled={readOnly}
                                onChange={() => togglePermission(permission.id)}
                                aria-label={permission.code}
                                className="h-4 w-4 rounded border-atg-border"
                              />
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>
            );
          })}
        </div>
      </Card>

      {!readOnly && isDirty ? (
        <div className="sticky bottom-0 z-20 mt-4 border-t border-atg-border bg-atg-bg/95 px-4 py-3 backdrop-blur">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-atg-fg">{tUnsaved('title')}</p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={handleCancel} disabled={saving}>
                {tActions('cancel')}
              </Button>
              <Button type="button" onClick={() => void handleSave()} loading={saving}>
                {tActions('save')}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

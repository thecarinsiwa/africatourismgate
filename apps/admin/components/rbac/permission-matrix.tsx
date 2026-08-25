'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  Button,
  Card,
  Checkbox,
  DataTableBadge,
  Input,
  Skeleton,
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
  permissions: Permission[];
};

function setsEqual(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) return false;
  for (const value of Array.from(a)) {
    if (!b.has(value)) return false;
  }
  return true;
}

async function loadAllPermissions(): Promise<Permission[]> {
  const client = getApiClient();
  const pageSize = 100;
  const first = await client.listPermissions({ page: 1, limit: pageSize });
  const pages = Math.max(1, first.meta.totalPages);
  if (pages === 1) return first.data;

  const rest = await Promise.all(
    Array.from({ length: pages - 1 }, (_, index) =>
      client.listPermissions({ page: index + 2, limit: pageSize }),
    ),
  );
  return [...first.data, ...rest.flatMap((page) => page.data)];
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
  const [search, setSearch] = useState('');
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
      const [allPermissions, rolePerms] = await Promise.all([
        loadAllPermissions(),
        getApiClient().getRolePermissions(roleId),
      ]);
      setPermissions(allPermissions);
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
      .map(([resource, perms]) => ({
        resource,
        label: formatPermissionDomain(resource, domainLabels, emptyDash),
        permissions: [...perms].sort((a, b) => a.action.localeCompare(b.action)),
      }));
  }, [permissions, domainLabels, emptyDash]);

  const filteredGroups = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return domainGroups;
    return domainGroups.filter((group) => {
      if (group.label.toLowerCase().includes(query)) return true;
      if (group.resource.toLowerCase().includes(query)) return true;
      return group.permissions.some(
        (permission) =>
          permission.code.toLowerCase().includes(query) ||
          permission.action.toLowerCase().includes(query) ||
          formatPermissionAction(permission.action, actionLabels)
            .toLowerCase()
            .includes(query),
      );
    });
  }, [actionLabels, domainGroups, search]);

  const selectedCount = selectedIds.size;
  const totalCount = permissions.length;

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
      for (const permission of group.permissions) {
        if (checked) next.add(permission.id);
        else next.delete(permission.id);
      }
      return next;
    });
  }

  function domainSelectionState(group: DomainGroup): 'none' | 'some' | 'all' {
    const selectedCountInGroup = group.permissions.filter((permission) =>
      selectedIds.has(permission.id),
    ).length;
    if (selectedCountInGroup === 0) return 'none';
    if (selectedCountInGroup === group.permissions.length) return 'all';
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
    return (
      <Card variant="dashboard" padding="lg" className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-4 w-full max-w-lg" />
        </div>
        <Skeleton className="h-10 w-full max-w-md" />
        <div className="space-y-4">
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-36 w-full" />
        </div>
        <p className="sr-only">{t('loading')}</p>
      </Card>
    );
  }

  return (
    <>
      <Card variant="dashboard" padding="lg" className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-atg-fg">{t('title')}</h2>
              {readOnly ? (
                <DataTableBadge variant="muted">{t('readOnlyBadge')}</DataTableBadge>
              ) : null}
            </div>
            <p className="text-sm text-atg-muted">
              {readOnly ? t('descriptionReadOnly') : t('descriptionEditable')}
            </p>
          </div>
          <DataTableBadge variant="muted" className="shrink-0 tabular-nums">
            {t('selectedCount', { selected: selectedCount, total: totalCount })}
          </DataTableBadge>
        </div>

        <div className="min-w-[200px] max-w-md">
          <Input
            name="matrix-search"
            type="search"
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label={t('searchPlaceholder')}
          />
        </div>

        {error ? (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400"
          >
            {error}
          </p>
        ) : null}

        {filteredGroups.length === 0 ? (
          <p className="rounded-lg border border-dashed border-atg-border bg-atg-surface/40 px-4 py-8 text-center text-sm text-atg-muted">
            {search.trim() ? t('searchEmpty') : t('empty')}
          </p>
        ) : (
          <div className="space-y-4">
            {filteredGroups.map((group) => {
              const selection = domainSelectionState(group);
              const groupSelected = group.permissions.filter((permission) =>
                selectedIds.has(permission.id),
              ).length;

              return (
                <section
                  key={group.resource}
                  className="overflow-hidden rounded-xl border border-atg-border bg-atg-elevated"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-atg-border bg-atg-surface/50 px-4 py-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-atg-fg">{group.label}</h3>
                        <span className="tabular-nums text-xs text-atg-muted">
                          {t('domainCount', {
                            selected: groupSelected,
                            total: group.permissions.length,
                          })}
                        </span>
                      </div>
                      <p className="mt-0.5 font-mono text-xs text-atg-muted">
                        {group.resource}.*
                      </p>
                    </div>

                    {!readOnly ? (
                      <Checkbox
                        name={`domain-${group.resource}`}
                        checked={selection === 'all'}
                        ref={(element) => {
                          if (element) {
                            element.indeterminate = selection === 'some';
                          }
                        }}
                        onChange={(event) => toggleDomain(group, event.target.checked)}
                        label={t('selectDomain')}
                        aria-label={t('ariaToggleDomainAll', { domain: group.label })}
                        wrapperClassName="shrink-0 text-atg-fg"
                      />
                    ) : null}
                  </div>

                  <ul className="grid gap-2 p-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {group.permissions.map((permission) => {
                      const isSelected = selectedIds.has(permission.id);
                      const actionLabel = formatPermissionAction(
                        permission.action,
                        actionLabels,
                      );
                      return (
                        <li key={permission.id}>
                          <label
                            className={`flex h-full cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2.5 transition-colors ${
                              isSelected
                                ? 'border-primary/40 bg-primary/5'
                                : 'border-atg-border hover:bg-atg-surface/60'
                            } ${readOnly ? 'cursor-default opacity-90' : ''}`}
                          >
                            <input
                              type="checkbox"
                              className="mt-0.5 h-4 w-4 shrink-0 rounded border-atg-border text-primary focus:ring-primary"
                              checked={isSelected}
                              disabled={readOnly}
                              onChange={() => togglePermission(permission.id)}
                              aria-label={permission.code}
                            />
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-medium text-atg-fg">
                                {actionLabel}
                              </span>
                              <code className="mt-1 inline-block max-w-full truncate rounded-md bg-atg-surface px-1.5 py-0.5 font-mono text-[11px] text-atg-muted">
                                {permission.code}
                              </code>
                              {permission.description?.trim() ? (
                                <span className="mt-1.5 block text-xs leading-snug text-atg-muted">
                                  {permission.description.trim()}
                                </span>
                              ) : null}
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })}
          </div>
        )}
      </Card>

      {!readOnly && isDirty ? (
        <div className="sticky bottom-0 z-20 mt-4 border-t border-atg-border bg-atg-bg/95 px-4 py-3 backdrop-blur">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-atg-fg">{tUnsaved('title')}</p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={handleCancel} disabled={saving}>
                {tActions('cancel')}
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={() => void handleSave()}
                loading={saving}
              >
                {tActions('save')}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

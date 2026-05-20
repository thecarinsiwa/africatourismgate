'use client';

import { Button, Card } from '@africatourismgate/ui';
import type { Permission } from '@africatourismgate/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { getRbacErrorMessage } from '../../lib/rbac-errors';

type PermissionMatrixProps = {
  roleId: string;
  isSystem: boolean;
};

export function PermissionMatrix({ roleId, isSystem }: PermissionMatrixProps) {
  const readOnly = isSystem;
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
      setSelected(new Set(rolePerms.permissionIds));
    } catch (err) {
      setError(getRbacErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [roleId]);

  useEffect(() => {
    void load();
  }, [load]);

  const byResource = useMemo(() => {
    const map = new Map<string, Permission[]>();
    for (const p of permissions) {
      const list = map.get(p.resource) ?? [];
      list.push(p);
      map.set(p.resource, list);
    }
    for (const [, list] of map) {
      list.sort((a, b) => a.action.localeCompare(b.action));
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [permissions]);

  function toggle(permissionId: string) {
    if (readOnly) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(permissionId)) next.delete(permissionId);
      else next.add(permissionId);
      return next;
    });
    setSuccess(null);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await getApiClient().replaceRolePermissions(roleId, {
        permissionIds: [...selected],
      });
      setSuccess('Permissions enregistrées.');
    } catch (err) {
      setError(getRbacErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-atg-muted">Chargement de la matrice…</p>;
  }

  return (
    <Card variant="dashboard" padding="lg" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-atg-fg">Matrice des permissions</h2>
          <p className="text-sm text-atg-muted">
            {readOnly
              ? 'Rôle système : consultation seule.'
              : 'Cochez les permissions accordées à ce rôle.'}
          </p>
        </div>
        {!readOnly ? (
          <Button type="button" onClick={() => void handleSave()} loading={saving}>
            Enregistrer la matrice
          </Button>
        ) : null}
      </div>

      {error ? (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}
      {success ? <p className="text-sm text-green-600">{success}</p> : null}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-atg-border text-left text-atg-muted">
              <th className="py-2 pr-4 font-medium">Ressource</th>
              <th className="py-2 pr-4 font-medium">Action</th>
              <th className="py-2 font-medium">Code</th>
              <th className="w-12 py-2 text-center font-medium">Accordée</th>
            </tr>
          </thead>
          <tbody>
            {byResource.map(([resource, perms]) =>
              perms.map((perm, idx) => (
                <tr key={perm.id} className="border-b border-atg-border/60">
                  <td className="py-2 pr-4 text-atg-fg">
                    {idx === 0 ? resource : ''}
                  </td>
                  <td className="py-2 pr-4 text-atg-muted">{perm.action}</td>
                  <td className="py-2 pr-4 font-mono text-xs text-atg-muted">
                    {perm.code}
                  </td>
                  <td className="py-2 text-center">
                    <input
                      type="checkbox"
                      checked={selected.has(perm.id)}
                      disabled={readOnly}
                      onChange={() => toggle(perm.id)}
                      aria-label={`${perm.code} pour ${resource}`}
                      className="h-4 w-4 rounded border-atg-border"
                    />
                  </td>
                </tr>
              )),
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

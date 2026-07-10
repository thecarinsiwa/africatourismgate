'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { getApiClient } from './api';

export type PermissionsContextValue = {
  permissions: string[];
  isSuperAdmin: boolean;
  loading: boolean;
  hasPermission: (code: string) => boolean;
  hasAnyPermission: (codes: string[]) => boolean;
};

const PermissionsContext = createContext<PermissionsContextValue | null>(null);

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void getApiClient()
      .getAuthMe()
      .then((me) => {
        if (!cancelled) {
          setPermissions(me.permissions);
          setIsSuperAdmin(me.isSuperAdmin);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPermissions([]);
          setIsSuperAdmin(false);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const hasPermission = useCallback(
    (code: string) => isSuperAdmin || permissions.includes(code),
    [isSuperAdmin, permissions],
  );

  const hasAnyPermission = useCallback(
    (codes: string[]) =>
      isSuperAdmin || codes.some((code) => permissions.includes(code)),
    [isSuperAdmin, permissions],
  );

  const value = useMemo(
    (): PermissionsContextValue => ({
      permissions,
      isSuperAdmin,
      loading,
      hasPermission,
      hasAnyPermission,
    }),
    [permissions, isSuperAdmin, loading, hasPermission, hasAnyPermission],
  );

  return (
    <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>
  );
}

export function usePermissionsContext(): PermissionsContextValue {
  const ctx = useContext(PermissionsContext);
  if (!ctx) {
    throw new Error('usePermissionsContext must be used within PermissionsProvider');
  }
  return ctx;
}

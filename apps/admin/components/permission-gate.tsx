'use client';

import type { ReactNode } from 'react';
import { usePermissions } from '../lib/auth/use-permissions';

type PermissionGateProps = {
  children: ReactNode;
  permission?: string;
  anyOf?: string[];
  superAdminOnly?: boolean;
  loadingFallback?: ReactNode;
};

export function PermissionGate({
  children,
  permission,
  anyOf,
  superAdminOnly = false,
  loadingFallback = null,
}: PermissionGateProps) {
  const { loading, isSuperAdmin, hasPermission, hasAnyPermission } = usePermissions();

  if (loading) {
    return <>{loadingFallback}</>;
  }

  if (superAdminOnly) {
    return isSuperAdmin ? <>{children}</> : null;
  }

  if (anyOf?.length) {
    return hasAnyPermission(anyOf) ? <>{children}</> : null;
  }

  if (permission) {
    return hasPermission(permission) ? <>{children}</> : null;
  }

  return <>{children}</>;
}

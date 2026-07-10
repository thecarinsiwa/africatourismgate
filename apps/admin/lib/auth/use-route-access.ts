'use client';

import { usePathname } from 'next/navigation';
import { isRouteAllowed } from '../../config/admin-route-permissions';
import { usePermissions } from './use-permissions';

export function useRouteAccess(pathname?: string) {
  const currentPathname = usePathname();
  const resolvedPath = pathname ?? currentPathname;
  const { permissions, isSuperAdmin, loading } = usePermissions();

  const access = isRouteAllowed(resolvedPath, { permissions, isSuperAdmin });

  return {
    ...access,
    loading,
    pathname: resolvedPath,
  };
}

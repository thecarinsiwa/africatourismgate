'use client';

import { usePermissions } from './use-permissions';

export function useModuleStatCards(permission: string) {
  const { hasPermission, loading } = usePermissions();
  const canLoad = hasPermission(permission);

  return {
    canLoad,
    loading,
    shouldRender: !loading && canLoad,
  };
}

'use client';

import { usePermissions } from '../auth/use-permissions';

export function useGapPermissions() {
  const { loading, hasPermission } = usePermissions();

  return {
    canRead: hasPermission('gap.read'),
    canWrite: hasPermission('gap.write'),
    loading,
  };
}

'use client';

import type { ReactNode } from 'react';
import { useRouteAccess } from '../lib/auth/use-route-access';

type RouteAccessGateProps = {
  children: ReactNode;
  loadingFallback?: ReactNode;
};

export function RouteAccessGate({
  children,
  loadingFallback = null,
}: RouteAccessGateProps) {
  const { allowed, loading } = useRouteAccess();

  if (loading) {
    return <>{loadingFallback}</>;
  }

  if (!allowed) {
    return null;
  }

  return <>{children}</>;
}

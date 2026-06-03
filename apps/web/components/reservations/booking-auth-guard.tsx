'use client';

import type { ReactNode } from 'react';
import { WebAuthGuard } from '../account/web-auth-guard';

type Props = {
  children: ReactNode;
  currentPathWithQuery: string;
};

export function BookingAuthGuard({ children, currentPathWithQuery }: Props) {
  return (
    <WebAuthGuard currentPathWithQuery={currentPathWithQuery}>{children}</WebAuthGuard>
  );
}

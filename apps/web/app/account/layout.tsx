'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { AccountShell } from '../../components/account/account-shell';
import { WebAuthGuard } from '../../components/account/web-auth-guard';

export default function AccountLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <WebAuthGuard currentPathWithQuery={pathname}>
      <AccountShell>{children}</AccountShell>
    </WebAuthGuard>
  );
}

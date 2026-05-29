'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { AccountShell } from '../../components/account/account-shell';
import { WebAuthGuard } from '../../components/account/web-auth-guard';
import { HomeFooter } from '../../components/home/home-footer';
import { HomeHeader } from '../../components/home/home-header';

export default function AccountLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <WebAuthGuard currentPathWithQuery={pathname}>
      <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-[#0a1210]">
        <HomeHeader />
        <main className="flex-1">
          <AccountShell>{children}</AccountShell>
        </main>
        <HomeFooter />
      </div>
    </WebAuthGuard>
  );
}

import { Suspense } from 'react';
import { DashboardShellLayout } from '../../components/dashboard-shell-layout';
import { OrganizationThemeProvider } from '../../components/organization-theme-provider';
import { PermissionsProvider } from '../../lib/auth/permissions-provider';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PermissionsProvider>
      <Suspense fallback={<DashboardShellLayout>{children}</DashboardShellLayout>}>
        <OrganizationThemeProvider>
          <DashboardShellLayout>{children}</DashboardShellLayout>
        </OrganizationThemeProvider>
      </Suspense>
    </PermissionsProvider>
  );
}

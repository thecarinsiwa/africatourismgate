import { Suspense } from 'react';
import { DashboardShellLayout } from '../../components/dashboard-shell-layout';
import { OrganizationCurrencyProvider } from '../../components/organization-currency-provider';
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
          <OrganizationCurrencyProvider>
            <DashboardShellLayout>{children}</DashboardShellLayout>
          </OrganizationCurrencyProvider>
        </OrganizationThemeProvider>
      </Suspense>
    </PermissionsProvider>
  );
}

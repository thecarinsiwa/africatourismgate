import { DashboardShellLayout } from '../../components/dashboard-shell-layout';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShellLayout>{children}</DashboardShellLayout>;
}

import { SessionSync } from '../../components/session-sync';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SessionSync />
      {children}
    </>
  );
}

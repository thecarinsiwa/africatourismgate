import { PosShellLayout } from '../../components/pos-shell-layout';

export default function PosAppLayout({ children }: { children: React.ReactNode }) {
  return <PosShellLayout>{children}</PosShellLayout>;
}

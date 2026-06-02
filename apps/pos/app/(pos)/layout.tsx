import { PosShell } from '../../components/pos-shell';

export default function PosAppLayout({ children }: { children: React.ReactNode }) {
  return <PosShell>{children}</PosShell>;
}

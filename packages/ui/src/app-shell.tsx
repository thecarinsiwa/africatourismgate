import type { ReactNode } from 'react';

export function AppShell({ children }: { children: ReactNode }) {
  return <div className="atg-app-shell min-h-screen">{children}</div>;
}

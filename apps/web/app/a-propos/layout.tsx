'use client';

import type { ReactNode } from 'react';
import { AboutShell } from '../../components/about/about-shell';

export default function AProposLayout({ children }: { children: ReactNode }) {
  return <AboutShell>{children}</AboutShell>;
}

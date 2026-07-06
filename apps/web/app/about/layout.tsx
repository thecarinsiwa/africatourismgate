'use client';

import type { ReactNode } from 'react';
import { AboutShell } from '../../components/about/about-shell';

export default function AboutLayout({ children }: { children: ReactNode }) {
  return <AboutShell>{children}</AboutShell>;
}

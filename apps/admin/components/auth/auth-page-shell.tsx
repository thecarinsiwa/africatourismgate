'use client';

import { ThemeToggle } from '@africatourismgate/ui';
import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { BrandingLogo } from '../branding-logo';
import { LanguageSwitcher } from '../language-switcher';
import { AuthVisualPanel } from './auth-visual-panel';

type Props = {
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthPageShell({ children, footer }: Props) {
  const t = useTranslations('theme');

  return (
    <div className="flex min-h-screen flex-col lg:grid lg:grid-cols-2">
      <AuthVisualPanel variant="compact" className="lg:hidden" />

      <div className="flex min-h-0 flex-1 flex-col bg-atg-surface">
        <header className="flex items-center justify-between gap-3 px-4 py-4 sm:px-6 md:px-10 md:py-6">
          <div className="min-w-0 flex-1">
            <BrandingLogo />
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <LanguageSwitcher />
            <ThemeToggle labels={{ light: t('light'), dark: t('dark') }} />
          </div>
        </header>
        <main className="flex flex-1 flex-col items-center justify-center px-4 pb-8 lg:px-10 lg:pb-16">
          {children}
        </main>
        {footer ? (
          <footer className="pb-8 text-center text-sm text-atg-muted lg:px-10 lg:text-left">
            {footer}
          </footer>
        ) : null}
      </div>

      <AuthVisualPanel variant="full" className="hidden lg:flex" />
    </div>
  );
}

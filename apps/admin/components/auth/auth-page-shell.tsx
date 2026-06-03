'use client';

import { ThemeToggle } from '@africatourismgate/ui';
import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { BrandingLogo } from '../branding-logo';
import { LanguageSwitcher } from '../language-switcher';

type Props = {
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthPageShell({ children, footer }: Props) {
  const t = useTranslations('theme');

  return (
    <div className="flex min-h-screen flex-col">
      <header className="relative px-6 py-6 md:px-10">
        <BrandingLogo centered />
        <div className="absolute right-6 top-6 flex items-center gap-3 md:right-10">
          <LanguageSwitcher />
          <ThemeToggle labels={{ light: t('light'), dark: t('dark') }} />
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-16">{children}</main>
      {footer ? <footer className="pb-8 text-center text-sm text-atg-muted">{footer}</footer> : null}
    </div>
  );
}

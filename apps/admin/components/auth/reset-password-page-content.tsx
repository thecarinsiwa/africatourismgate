'use client';

import { Card, TextLink, ThemeToggle } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { Suspense } from 'react';
import { AdminResetPasswordForm } from '../admin-reset-password-form';
import { BrandingLogo } from '../branding-logo';

export function ResetPasswordPageContent() {
  const t = useTranslations('auth.resetPassword');
  const tCommon = useTranslations('common.loading');
  const tTheme = useTranslations('theme');

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between gap-3 px-4 py-4 sm:px-6 md:px-10 md:py-6">
        <div className="min-w-0 flex-1">
          <BrandingLogo />
        </div>
        <div className="shrink-0">
          <ThemeToggle labels={{ light: tTheme('light'), dark: tTheme('dark') }} />
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md">
          <Card accent>
            <h1 className="text-2xl font-bold text-atg-fg">{t('title')}</h1>
            <p className="mt-2 text-sm leading-relaxed text-atg-muted">{t('subtitle')}</p>
            <div className="mt-8">
              <Suspense fallback={<p className="text-sm text-atg-muted">{tCommon('page')}</p>}>
                <AdminResetPasswordForm />
              </Suspense>
            </div>
            <p className="mt-8 text-center text-sm">
              <TextLink href="/login">{t('backToLogin')}</TextLink>
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
}

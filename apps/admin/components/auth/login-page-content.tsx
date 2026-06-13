'use client';

import { Button, Card, Divider, TextLink } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { AdminLoginForm } from '../admin-login-form';
import { useBrandingLogo } from '../branding-logo';
import { AuthPageShell } from './auth-page-shell';

export function LoginPageContent() {
  const t = useTranslations('auth.login');
  const { displayName, logoUrl } = useBrandingLogo();

  return (
    <AuthPageShell
      footer={
        <>
          {t('footerPrefix')}{' '}
          <TextLink href="mailto:support@africatourismgate.org">support@africatourismgate.org</TextLink>
        </>
      }
    >
      <div className="w-full max-w-md">
        <Card accent>
          {logoUrl ? (
            <div className="mb-6 flex justify-center">
              <img
                src={logoUrl}
                alt={displayName}
                className="max-h-16 w-auto max-w-[12rem] object-contain"
              />
            </div>
          ) : null}
          <h1 className="text-2xl font-bold text-atg-fg">{t('title')}</h1>
          <p className="mt-2 text-sm leading-relaxed text-atg-muted">{t('subtitle')}</p>
          <div className="mt-8">
            <AdminLoginForm />
          </div>
          <Divider className="my-8">{t('dividerLabel')}</Divider>
          <Button variant="outline" size="md" fullWidth href="/register">
            {t('secondaryAction')}
          </Button>
        </Card>
      </div>
    </AuthPageShell>
  );
}

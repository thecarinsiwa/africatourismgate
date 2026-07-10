'use client';

import { Button, Card } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { AuthPageShell } from './auth-page-shell';

export function RegisterPendingPageContent() {
  const t = useTranslations('auth.register.pending');

  return (
    <AuthPageShell
      footer={
        <>
          {t('footerPrefix')}{' '}
          <a
            className="font-medium text-atg-primary hover:underline"
            href="mailto:support@africatourismgate.org"
          >
            support@africatourismgate.org
          </a>
        </>
      }
    >
      <div className="w-full max-w-md">
        <Card accent>
          <h1 className="text-2xl font-bold text-atg-fg">{t('title')}</h1>
          <p className="mt-2 text-sm leading-relaxed text-atg-muted">{t('subtitle')}</p>
          <p className="mt-4 text-sm leading-relaxed text-atg-muted">{t('body')}</p>
          <div className="mt-8">
            <Button variant="primary" size="md" fullWidth href="/login">
              {t('loginAction')}
            </Button>
          </div>
        </Card>
      </div>
    </AuthPageShell>
  );
}

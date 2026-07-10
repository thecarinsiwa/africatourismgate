'use client';

import { Button, Card, Divider, TextLink } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { GoogleIcon } from '../icons/google-icon';
import { buildAdminGoogleRegisterUrl } from '../../lib/auth/google-oauth';
import { AuthPageShell } from './auth-page-shell';

type Props = {
  oauthError?: string;
};

function resolveOAuthErrorMessage(
  code: string | undefined,
  tErrors: (key: string) => string,
): string | null {
  if (!code) return null;
  if (code === 'gmail_only') return tErrors('gmailOnly');
  if (code === 'account_exists') return tErrors('accountExistsLogin');
  if (code === 'google_auth_failed') return tErrors('googleAuthFailed');
  if (code === 'google_auth_error') return tErrors('googleAuthError');
  if (code === 'google_no_email') return tErrors('googleNoEmail');
  if (code === 'google_account_inactive') return tErrors('accountPendingApproval');
  if (code === 'google_signup_unavailable') return tErrors('googleSignupUnavailable');
  return tErrors('generic');
}

export function RegisterPageContent({ oauthError }: Props) {
  const t = useTranslations('auth.register');
  const tErrors = useTranslations('auth.register.errors');
  const [error, setError] = useState<string | null>(() =>
    resolveOAuthErrorMessage(oauthError, tErrors),
  );
  const [oauthUrl, setOauthUrl] = useState<string | null>(null);

  useEffect(() => {
    setOauthUrl(buildAdminGoogleRegisterUrl(window.location.origin));
  }, []);

  useEffect(() => {
    setError(resolveOAuthErrorMessage(oauthError, tErrors));
  }, [oauthError, tErrors]);

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
          <h1 className="text-2xl font-bold text-atg-fg">{t('title')}</h1>
          <p className="mt-2 text-sm leading-relaxed text-atg-muted">{t('subtitle')}</p>
          <p className="mt-3 text-xs leading-relaxed text-atg-muted">{t('gmailHint')}</p>

          {error ? (
            <p
              role="alert"
              className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400"
            >
              {error}
            </p>
          ) : null}

          <div className="mt-8">
            <a
              href={oauthUrl ?? '#'}
              aria-disabled={!oauthUrl}
              onClick={(event) => {
                if (!oauthUrl) {
                  event.preventDefault();
                }
              }}
              className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-atg-border bg-atg-elevated px-4 py-2 text-sm font-semibold text-atg-fg hover:bg-atg-surface disabled:pointer-events-none disabled:opacity-60 dark:border-atg-border dark:bg-transparent dark:text-white"
            >
              <GoogleIcon />
              {t('googleAction')}
            </a>
          </div>

          <Divider className="my-8">{t('dividerLabel')}</Divider>
          <Button variant="outline" size="md" fullWidth href="/login">
            {t('secondaryAction')}
          </Button>
        </Card>
      </div>
    </AuthPageShell>
  );
}

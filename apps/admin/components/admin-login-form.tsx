'use client';

import { LoginForm } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { getAdminLoginErrors, getAdminLoginFormConfig } from '../config/login';
import { getAuthErrorMessage } from '../lib/auth/api-errors';
import { getApiClient } from '../lib/auth/api';
import { authResponseToStoredSession, saveSession } from '../lib/auth/session';
import { applyLocaleFromUser } from '../lib/i18n/preferred-language';

export function AdminLoginForm() {
  const router = useRouter();
  const tForm = useTranslations('auth.login.form');
  const tErrors = useTranslations('auth.login.errors');
  const [error, setError] = useState<string | null>(null);

  const formConfig = useMemo(() => getAdminLoginFormConfig(tForm), [tForm]);
  const loginErrorMessages = useMemo(() => getAdminLoginErrors(tErrors), [tErrors]);

  return (
    <div className="space-y-4">
      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400"
        >
          {error}
        </p>
      ) : null}

      <LoginForm
        config={formConfig}
        onSubmit={async ({ email, password, remember }) => {
          setError(null);
          try {
            const response = await getApiClient().login({ email, password });
            saveSession(authResponseToStoredSession(response), remember);
            applyLocaleFromUser(response.user);
            router.refresh();
            router.push('/dashboard');
          } catch (err) {
            setError(getAuthErrorMessage(err, loginErrorMessages));
          }
        }}
      />
    </div>
  );
}

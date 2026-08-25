'use client';

import { RegisterForm } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { getAdminRegisterErrors, getAdminRegisterFormConfig } from '../config/register';
import { getAuthErrorMessage } from '../lib/auth/api-errors';
import { getApiClient } from '../lib/auth/api';
import { authResponseToStoredSession, saveSession } from '../lib/auth/session';
import { applyLocaleFromUser } from '../lib/i18n/preferred-language';
import { withClientInstanceId } from '@africatourismgate/utils';

export function AdminRegisterForm() {
  const router = useRouter();
  const tForm = useTranslations('auth.register.form');
  const tErrors = useTranslations('auth.register.errors');
  const [error, setError] = useState<string | null>(null);

  const formConfig = useMemo(() => getAdminRegisterFormConfig(tForm), [tForm]);
  const registerErrorMessages = useMemo(
    () => ({
      ...getAdminRegisterErrors(tErrors),
      conflict: tErrors('emailAlreadyRegistered'),
    }),
    [tErrors],
  );

  return (
    <div className="space-y-4">
      <RegisterForm
        config={formConfig}
        onSubmit={async ({ firstName, lastName, email, phone, password }) => {
          setError(null);
          try {
            const preferredLanguage =
              document.documentElement.lang === 'en' ? 'en' : 'fr';
            const response = await getApiClient().register(
              withClientInstanceId({
                firstName,
                lastName,
                email,
                password,
                preferredLanguage,
                ...(phone.trim() ? { phone: phone.trim() } : {}),
              }),
            );
            const session = authResponseToStoredSession(response);
            saveSession(session);
            applyLocaleFromUser(session.user);
            router.refresh();
            router.push('/dashboard');
          } catch (err) {
            setError(getAuthErrorMessage(err, registerErrorMessages));
          }
        }}
      />

      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-red-500 bg-red-500/5 px-3 py-2 text-sm text-red-600 dark:border-red-500/50 dark:bg-red-500/10 dark:text-red-400"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

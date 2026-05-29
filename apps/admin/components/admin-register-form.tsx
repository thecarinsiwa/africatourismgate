'use client';

import { RegisterForm } from '@africatourismgate/ui';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { adminRegisterErrors, adminRegisterFormConfig } from '../config/register';
import { getAuthErrorMessage } from '../lib/auth/api-errors';
import { getApiClient } from '../lib/auth/api';
import { authResponseToStoredSession, saveSession } from '../lib/auth/session';

const registerErrorMessages = {
  network: adminRegisterErrors.network,
  generic: adminRegisterErrors.generic,
  envMissing: adminRegisterErrors.envMissing,
  conflict: adminRegisterErrors.emailAlreadyRegistered,
  server: adminRegisterErrors.server,
};

export function AdminRegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

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

      <RegisterForm
        config={adminRegisterFormConfig}
        onSubmit={async ({ firstName, lastName, email, phone, password }) => {
          setError(null);
          try {
            const response = await getApiClient().register({
              firstName,
              lastName,
              email,
              password,
              ...(phone.trim() ? { phone: phone.trim() } : {}),
            });
            saveSession(authResponseToStoredSession(response), false);
            router.refresh();
            router.push('/dashboard');
          } catch (err) {
            setError(getAuthErrorMessage(err, registerErrorMessages));
          }
        }}
      />
    </div>
  );
}

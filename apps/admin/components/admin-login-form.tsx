'use client';

import { LoginForm } from '@africatourismgate/ui';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { adminLoginErrors, adminLoginFormConfig } from '../config/login';
import { getApiClient } from '../lib/auth/api';
import { authResponseToStoredSession, saveSession } from '../lib/auth/session';

function getLoginErrorMessage(error: unknown): string {
  if (error instanceof TypeError) {
    return adminLoginErrors.network;
  }
  if (error instanceof Error && error.message.includes('HTTP 401')) {
    return adminLoginErrors.invalidCredentials;
  }
  return adminLoginErrors.generic;
}

export function AdminLoginForm() {
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

      <LoginForm
        config={adminLoginFormConfig}
        onSubmit={async ({ email, password, remember }) => {
          setError(null);
          try {
            const response = await getApiClient().login({ email, password });
            saveSession(authResponseToStoredSession(response), remember);
            router.push('/dashboard');
          } catch (err) {
            setError(getLoginErrorMessage(err));
          }
        }}
      />
    </div>
  );
}

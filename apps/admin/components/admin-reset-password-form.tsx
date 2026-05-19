'use client';

import { Button, PasswordInput } from '@africatourismgate/ui';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import {
  adminResetPasswordErrors,
  adminResetPasswordPageConfig,
} from '../config/reset-password';
import { getApiClient } from '../lib/auth/api';

const { password: passwordConfig, confirmPassword, submit } =
  adminResetPasswordPageConfig;

function getResetPasswordErrorMessage(error: unknown): string {
  if (error instanceof TypeError) {
    return adminResetPasswordErrors.network;
  }
  if (error instanceof Error && error.message.includes('HTTP 400')) {
    return adminResetPasswordErrors.invalidToken;
  }
  return adminResetPasswordErrors.generic;
}

export function AdminResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token')?.trim() ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [confirmError, setConfirmError] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!token) {
    const { missingToken } = adminResetPasswordPageConfig;
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm font-medium text-atg-fg">{missingToken.title}</p>
        <p className="text-sm text-atg-muted">{missingToken.message}</p>
        <div className="flex flex-col gap-2 pt-2">
          <Button variant="primary" size="md" fullWidth href={missingToken.forgotHref}>
            {missingToken.forgotLabel}
          </Button>
          <Button variant="outline" size="md" fullWidth href={missingToken.loginHref}>
            {missingToken.loginLabel}
          </Button>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setConfirmError(confirmPassword.mismatchError);
      return;
    }
    setConfirmError(undefined);

    setLoading(true);
    try {
      await getApiClient().resetPassword({ token, password });
      router.push(adminResetPasswordPageConfig.successRedirect);
    } catch (err) {
      setError(getResetPasswordErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

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

      <form onSubmit={handleSubmit} className="space-y-5">
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          label={passwordConfig.label}
          placeholder={passwordConfig.placeholder}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (confirmError) setConfirmError(undefined);
          }}
          required
          minLength={8}
        />

        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          autoComplete="new-password"
          label={confirmPassword.label}
          placeholder={confirmPassword.placeholder}
          value={confirm}
          onChange={(e) => {
            setConfirm(e.target.value);
            if (confirmError) setConfirmError(undefined);
          }}
          required
          minLength={8}
          error={confirmError}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
          loadingText={submit.loadingLabel}
        >
          {submit.label}
        </Button>
      </form>
    </div>
  );
}

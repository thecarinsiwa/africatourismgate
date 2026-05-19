'use client';

import { Button, Input } from '@africatourismgate/ui';
import { useState } from 'react';
import {
  adminForgotPasswordErrors,
  adminForgotPasswordPageConfig,
} from '../config/forgot-password';
import { getApiClient } from '../lib/auth/api';

const { email: emailConfig, submit } = adminForgotPasswordPageConfig;

function getForgotPasswordErrorMessage(error: unknown): string {
  if (error instanceof TypeError) {
    return adminForgotPasswordErrors.network;
  }
  return adminForgotPasswordErrors.generic;
}

export function AdminForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await getApiClient().forgotPassword({ email });
      setSuccess(true);
    } catch (err) {
      setError(getForgotPasswordErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <p
        role="status"
        className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800 dark:border-green-900/50 dark:bg-green-950/40 dark:text-green-300"
      >
        {adminForgotPasswordPageConfig.successMessage}
      </p>
    );
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
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          label={emailConfig.label}
          placeholder={emailConfig.placeholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
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

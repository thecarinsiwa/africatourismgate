'use client';

import { Button, Input } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import {
  getAdminForgotPasswordErrors,
  getAdminForgotPasswordFormConfig,
} from '../config/forgot-password';
import { getAuthErrorMessage } from '../lib/auth/api-errors';
import { getApiClient } from '../lib/auth/api';

export function AdminForgotPasswordForm() {
  const tForm = useTranslations('auth.forgotPassword.form');
  const tErrors = useTranslations('auth.forgotPassword.errors');
  const tPage = useTranslations('auth.forgotPassword');
  const formConfig = useMemo(() => getAdminForgotPasswordFormConfig(tForm), [tForm]);
  const errorMessages = useMemo(() => getAdminForgotPasswordErrors(tErrors), [tErrors]);

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
      setError(getAuthErrorMessage(err, errorMessages));
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
        {tPage('successMessage')}
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
          label={formConfig.email.label}
          placeholder={formConfig.email.placeholder}
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
          loadingText={formConfig.submit.loadingLabel}
        >
          {formConfig.submit.label}
        </Button>
      </form>
    </div>
  );
}

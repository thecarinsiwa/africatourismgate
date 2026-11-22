'use client';

import { ApiHttpError } from '@africatourismgate/api-client';
import { Button, PasswordInput } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import {
  buildBookingResetPasswordErrors,
  buildBookingResetPasswordFormConfig,
  buildBookingResetPasswordMissingTokenCopy,
} from '../../config/booking-reset-password';
import { resetPassword } from '../../lib/api/auth';
import { getAuthErrorMessage } from '../../lib/auth/api-errors';

export function BookingResetPasswordForm() {
  const tForm = useTranslations('booking.resetPassword.form');
  const tMissing = useTranslations('booking.resetPassword.missingToken');
  const tErrors = useTranslations('booking.resetPassword.errors');
  const formConfig = useMemo(
    () => buildBookingResetPasswordFormConfig(tForm),
    [tForm],
  );
  const missingToken = useMemo(
    () => buildBookingResetPasswordMissingTokenCopy(tMissing),
    [tMissing],
  );
  const errorMessages = useMemo(
    () => ({
      ...buildBookingResetPasswordErrors(tErrors),
      unauthorized: tErrors('invalidToken'),
    }),
    [tErrors],
  );

  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token')?.trim() ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [confirmError, setConfirmError] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!token) {
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
      setConfirmError(formConfig.confirmPassword.mismatchError);
      return;
    }
    setConfirmError(undefined);

    setLoading(true);
    try {
      await resetPassword({ token, password });
      router.push(formConfig.successRedirect);
    } catch (err) {
      if (err instanceof ApiHttpError && err.status === 400) {
        setError(errorMessages.invalidToken);
        return;
      }
      setError(getAuthErrorMessage(err, errorMessages));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
        >
          {error}
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-5">
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          label={formConfig.password.label}
          placeholder={formConfig.password.placeholder}
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
          label={formConfig.confirmPassword.label}
          placeholder={formConfig.confirmPassword.placeholder}
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
          loadingText={formConfig.submit.loadingLabel}
        >
          {formConfig.submit.label}
        </Button>
      </form>
    </div>
  );
}

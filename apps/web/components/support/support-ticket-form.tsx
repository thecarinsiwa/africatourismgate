'use client';

import { ApiHttpError } from '@africatourismgate/api-client';
import type { SupportTicketCreated } from '@africatourismgate/types';
import { Button, Input } from '@africatourismgate/ui';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getAccountApiClient } from '../../lib/api/account';
import { ensureClientAccessToken } from '../../lib/auth/client-session';
import { useTranslations } from '../../lib/i18n/locale-provider';

export function SupportTicketForm() {
  const t = useTranslations();
  const s = t.support;

  const [sessionChecked, setSessionChecked] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<SupportTicketCreated | null>(null);

  useEffect(() => {
    let mounted = true;
    void ensureClientAccessToken().then((token) => {
      if (!mounted) return;
      setHasSession(Boolean(token));
      setSessionChecked(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setValidationError(null);
    setError(null);

    const trimmedSubject = subject.trim();
    const trimmedBody = body.trim();

    if (!trimmedSubject) {
      setValidationError(s.subjectRequired);
      return;
    }
    if (trimmedBody.length < 10) {
      setValidationError(s.messageTooShort);
      return;
    }

    setSubmitting(true);
    try {
      const client = await getAccountApiClient();
      const result = await client.createSupportTicket({
        subject: trimmedSubject,
        body: trimmedBody,
      });
      setCreated(result);
      setSubject('');
      setBody('');
    } catch (err) {
      if (err instanceof ApiHttpError) {
        const msg =
          typeof err.body === 'object' &&
          err.body &&
          'message' in err.body &&
          typeof (err.body as { message: unknown }).message === 'string'
            ? (err.body as { message: string }).message
            : s.submitError;
        setError(msg);
      } else if (err instanceof Error && err.message === 'Not authenticated') {
        setHasSession(false);
        setError(s.signInPrompt);
      } else {
        setError(s.submitError);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (!sessionChecked) {
    return (
      <p className="text-sm text-gray-600 dark:text-atg-muted">{s.checkingSession}</p>
    );
  }

  if (!hasSession) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-atg-border dark:bg-atg-elevated">
        <p className="text-sm text-gray-700 dark:text-atg-muted">{s.signInPrompt}</p>
        <Link
          href="/booking/login?next=%2Fsupport"
          className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-[var(--atg-primary-hover)]"
        >
          {s.signInCta}
        </Link>
      </div>
    );
  }

  if (created) {
    return (
      <div
        className="rounded-lg border border-primary/30 bg-primary/5 p-6 dark:border-primary/40 dark:bg-primary/10"
        role="status"
      >
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
          {s.successTitle}
        </h3>
        <p className="mt-2 text-sm text-gray-700 dark:text-atg-muted">
          {s.successMessage.replace('{ticketId}', created.ticket.id)}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-atg-border dark:bg-atg-elevated"
    >
      <div>
        <label
          htmlFor="support-subject"
          className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-atg-muted"
        >
          {s.subjectLabel}
        </label>
        <Input
          id="support-subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder={s.subjectPlaceholder}
          maxLength={255}
          disabled={submitting}
          required
        />
      </div>

      <div>
        <label
          htmlFor="support-message"
          className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-atg-muted"
        >
          {s.messageLabel}
        </label>
        <textarea
          id="support-message"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={s.messagePlaceholder}
          rows={5}
          disabled={submitting}
          required
          minLength={10}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60 dark:border-atg-border dark:bg-atg-surface dark:text-white dark:placeholder:text-atg-muted"
        />
      </div>

      {validationError ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {validationError}
        </p>
      ) : null}
      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" disabled={submitting}>
        {submitting ? s.submitting : s.submit}
      </Button>
    </form>
  );
}

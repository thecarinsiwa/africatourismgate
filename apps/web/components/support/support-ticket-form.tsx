'use client';

import { ApiHttpError } from '@africatourismgate/api-client';
import type { SupportTicketCreated } from '@africatourismgate/types';
import { Button, Card, cn, Input } from '@africatourismgate/ui';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getAccountApiClient } from '../../lib/api/account';
import { ensureClientAccessToken } from '../../lib/auth/client-session';
import { useTranslations } from '../../lib/i18n/locale-provider';

const messageTextareaClass =
  'w-full rounded-lg border bg-atg-elevated px-4 py-3 text-sm text-atg-fg placeholder:text-atg-muted/70 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-60 dark:bg-atg-surface dark:text-white';

export function SupportTicketForm() {
  const t = useTranslations();
  const s = t.support;

  const [sessionChecked, setSessionChecked] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [subjectError, setSubjectError] = useState<string | null>(null);
  const [bodyError, setBodyError] = useState<string | null>(null);
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
    setSubjectError(null);
    setBodyError(null);
    setError(null);

    const trimmedSubject = subject.trim();
    const trimmedBody = body.trim();

    let hasValidationError = false;
    if (!trimmedSubject) {
      setSubjectError(s.subjectRequired);
      hasValidationError = true;
    }
    if (trimmedBody.length < 10) {
      setBodyError(s.messageTooShort);
      hasValidationError = true;
    }
    if (hasValidationError) {
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
      <p className="text-sm text-atg-muted">{s.checkingSession}</p>
    );
  }

  if (!hasSession) {
    return (
      <Card variant="dashboard" padding="sm">
        <p className="text-sm text-atg-muted">{s.signInPrompt}</p>
        <Link
          href="/booking/login?next=%2Fsupport"
          className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-[var(--atg-primary-hover)]"
        >
          {s.signInCta}
        </Link>
      </Card>
    );
  }

  if (created) {
    return (
      <Card variant="dashboard" padding="sm" role="status">
        <h3 className="text-base font-semibold text-atg-fg">
          {s.successTitle}
        </h3>
        <p className="mt-2 text-sm text-atg-muted">
          {s.successMessage.replace('{ticketId}', created.ticket.id)}
        </p>
      </Card>
    );
  }

  return (
    <Card variant="dashboard" padding="sm">
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <Input
          id="support-subject"
          label={s.subjectLabel}
          value={subject}
          onChange={(e) => {
            setSubject(e.target.value);
            if (subjectError) setSubjectError(null);
          }}
          placeholder={s.subjectPlaceholder}
          maxLength={255}
          disabled={submitting}
          required
          error={subjectError ?? undefined}
        />

        <div className="w-full">
          <label
            htmlFor="support-message"
            className="mb-2 block text-sm font-medium text-atg-fg"
          >
            {s.messageLabel}
          </label>
          <textarea
            id="support-message"
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
              if (bodyError) setBodyError(null);
            }}
            placeholder={s.messagePlaceholder}
            rows={5}
            disabled={submitting}
            required
            minLength={10}
            aria-invalid={bodyError ? true : undefined}
            aria-describedby={bodyError ? 'support-message-error' : undefined}
            className={cn(
              messageTextareaClass,
              bodyError
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-atg-border',
            )}
          />
          {bodyError ? (
            <p
              id="support-message-error"
              className="mt-1.5 text-xs text-red-500 dark:text-red-400"
              role="alert"
            >
              {bodyError}
            </p>
          ) : null}
        </div>

        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        ) : null}

        <Button type="submit" disabled={submitting}>
          {submitting ? s.submitting : s.submit}
        </Button>
      </form>
    </Card>
  );
}

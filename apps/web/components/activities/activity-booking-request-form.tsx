'use client';

import { useState } from 'react';
import { submitActivityBookingRequest } from '../../lib/api/public';
import { todayDateInputValue } from '../../lib/activities/booking-request';
import type { Translations } from '../../lib/i18n/message-types';
import {
  BookingSidebarField,
  BookingSidebarHint,
  bookingSidebarInputClass,
} from '../shared/booking-sidebar-shell';

type ActivityBookingRequestFormProps = {
  activityId: string;
  initialParticipants: number;
  initialPreferredDate?: string;
  t: Translations['activities'];
};

type FieldErrors = Partial<
  Record<'fullName' | 'email' | 'preferredDate' | 'participants', string>
>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ActivityBookingRequestForm({
  activityId,
  initialParticipants,
  initialPreferredDate,
  t,
}: ActivityBookingRequestFormProps) {
  const minDate = todayDateInputValue();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredDate, setPreferredDate] = useState(
    initialPreferredDate && initialPreferredDate >= minDate
      ? initialPreferredDate
      : minDate,
  );
  const [participants, setParticipants] = useState(Math.max(1, initialParticipants));
  const [message, setMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function validate(): boolean {
    const errors: FieldErrors = {};
    if (!fullName.trim()) {
      errors.fullName = t.bookingRequestFullNameRequired;
    }
    if (!email.trim()) {
      errors.email = t.bookingRequestEmailRequired;
    } else if (!EMAIL_RE.test(email.trim())) {
      errors.email = t.bookingRequestEmailInvalid;
    }
    if (!preferredDate) {
      errors.preferredDate = t.bookingRequestDateRequired;
    } else if (preferredDate < minDate) {
      errors.preferredDate = t.bookingRequestDatePast;
    }
    if (!Number.isFinite(participants) || participants < 1) {
      errors.participants = t.bookingRequestParticipantsInvalid;
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitError(null);
    if (!validate()) {
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitActivityBookingRequest(activityId, {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        preferredDate,
        participants,
        message: message.trim() || null,
      });
      setSuccessMessage(result.message || t.bookingRequestSuccess);
    } catch (err) {
      const msg = err instanceof Error ? err.message : t.bookingRequestError;
      setSubmitError(msg.includes('API ') ? t.bookingRequestError : msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (successMessage) {
    return (
      <div id="booking-request" className="space-y-3">
        <BookingSidebarHint tone="muted">{t.bookingRequestTitle}</BookingSidebarHint>
        <p
          className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-3 text-sm text-atg-fg"
          role="status"
        >
          {successMessage}
        </p>
      </div>
    );
  }

  return (
    <form id="booking-request" className="space-y-3" onSubmit={(e) => void handleSubmit(e)}>
      <div>
        <p className="text-sm font-semibold text-atg-fg">{t.bookingRequestTitle}</p>
        <p className="mt-1 text-sm text-atg-muted">{t.bookingRequestSubtitle}</p>
      </div>

      <BookingSidebarField label={t.bookingRequestFullName}>
        <input
          type="text"
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className={bookingSidebarInputClass}
          disabled={submitting}
          aria-invalid={Boolean(fieldErrors.fullName)}
        />
        {fieldErrors.fullName ? (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.fullName}</p>
        ) : null}
      </BookingSidebarField>

      <BookingSidebarField label={t.bookingRequestEmail}>
        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={bookingSidebarInputClass}
          disabled={submitting}
          aria-invalid={Boolean(fieldErrors.email)}
        />
        {fieldErrors.email ? (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.email}</p>
        ) : null}
      </BookingSidebarField>

      <BookingSidebarField label={t.bookingRequestPhone}>
        <input
          type="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={bookingSidebarInputClass}
          disabled={submitting}
          placeholder={t.bookingRequestPhoneOptional}
        />
      </BookingSidebarField>

      <BookingSidebarField label={t.bookingRequestPreferredDate}>
        <input
          type="date"
          min={minDate}
          value={preferredDate}
          onChange={(e) => setPreferredDate(e.target.value)}
          className={bookingSidebarInputClass}
          disabled={submitting}
          aria-invalid={Boolean(fieldErrors.preferredDate)}
        />
        {fieldErrors.preferredDate ? (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {fieldErrors.preferredDate}
          </p>
        ) : null}
      </BookingSidebarField>

      <BookingSidebarField label={t.participants}>
        <input
          type="number"
          min={1}
          max={50}
          value={participants}
          onChange={(e) =>
            setParticipants(Math.max(1, Number.parseInt(e.target.value, 10) || 1))
          }
          className={bookingSidebarInputClass}
          disabled={submitting}
          aria-invalid={Boolean(fieldErrors.participants)}
        />
        {fieldErrors.participants ? (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {fieldErrors.participants}
          </p>
        ) : null}
      </BookingSidebarField>

      <BookingSidebarField label={t.bookingRequestMessage}>
        <textarea
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={`${bookingSidebarInputClass} resize-y`}
          disabled={submitting}
          placeholder={t.bookingRequestMessageOptional}
        />
      </BookingSidebarField>

      {submitError ? <BookingSidebarHint tone="error">{submitError}</BookingSidebarHint> : null}

      <button
        type="submit"
        disabled={submitting}
        className="w-full min-h-[48px] rounded-lg bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? t.bookingRequestSubmitting : t.bookingRequestSubmit}
      </button>
    </form>
  );
}

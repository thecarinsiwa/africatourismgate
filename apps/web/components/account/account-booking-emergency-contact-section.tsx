'use client';

import { Button } from '@africatourismgate/ui';
import type { BookingEmergencyContact, BookingStatus } from '@africatourismgate/types';
import { formatNationalityDisplay } from '@africatourismgate/utils';
import { useEffect, useState } from 'react';
import { useLocale, useMessages } from 'next-intl';
import type { Translations } from '../../lib/i18n/message-types';
import { getAccountApiClient } from '../../lib/api/account';
import {
  BookingEmergencyContactForm,
  emergencyContactDraftFromApi,
  emergencyContactDraftToPayload,
  type EmergencyContactDraft,
  type EmergencyContactFieldErrors,
} from '../reservations/booking-emergency-contact-form';

type Props = {
  bookingId: string;
  bookingStatus: BookingStatus;
  initialContact?: BookingEmergencyContact | null;
  onUpdated?: () => void | Promise<void>;
};

function canEdit(status: BookingStatus): boolean {
  return (
    status === 'pending_approval' ||
    status === 'pending_payment' ||
    status === 'confirmed'
  );
}

export function AccountBookingEmergencyContactSection({
  bookingId,
  bookingStatus,
  initialContact = null,
  onUpdated,
}: Props) {
  const locale = useLocale();
  const messages = useMessages();
  const t = (
    messages as {
      account: Translations['account'];
    }
  ).account.reservations.detail.emergencyContact;

  const editable = canEdit(bookingStatus);
  const [draft, setDraft] = useState<EmergencyContactDraft>(() =>
    emergencyContactDraftFromApi(initialContact),
  );
  const [saved, setSaved] = useState<BookingEmergencyContact | null>(initialContact ?? null);
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState<EmergencyContactFieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    setSaved(initialContact ?? null);
    if (!editing) {
      setDraft(emergencyContactDraftFromApi(initialContact));
    }
  }, [initialContact, editing]);

  const hasContact = Boolean(saved?.name?.trim() || saved?.phone?.trim());

  async function handleSave() {
    const nextErrors: EmergencyContactFieldErrors = {};
    if (!draft.name.trim()) nextErrors.name = t.nameRequired;
    if (!draft.phone.trim()) nextErrors.phone = t.phoneRequired;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    setActionError(null);
    try {
      const client = await getAccountApiClient();
      const updated = await client.updateBookingEmergencyContact(
        bookingId,
        emergencyContactDraftToPayload(draft),
      );
      setSaved(updated);
      setDraft(emergencyContactDraftFromApi(updated));
      setEditing(false);
      await onUpdated?.();
    } catch {
      setActionError(t.saveError);
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setDraft(emergencyContactDraftFromApi(saved));
    setErrors({});
    setActionError(null);
    setEditing(false);
  }

  if (!editable && !hasContact) {
    return null;
  }

  if (editing || (!hasContact && editable)) {
    return (
      <div className="space-y-3">
        <BookingEmergencyContactForm
          value={draft}
          onChange={(next) => {
            setDraft(next);
            setErrors({});
          }}
          labels={{
            title: t.title,
            subtitle: t.subtitle,
            name: t.name,
            phone: t.phone,
            email: t.email,
            country: t.country,
            address: t.address,
            addressPlaceholder: t.addressPlaceholder,
            nationalityPlaceholder: t.nationalityPlaceholder,
            nationalitySearch: t.nationalitySearch,
            nationalityEmpty: t.nationalityEmpty,
          }}
          errors={errors}
          disabled={saving}
        />
        {actionError ? (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {actionError}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" onClick={() => void handleSave()} disabled={saving}>
            {saving ? t.saving : t.save}
          </Button>
          {hasContact ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={saving}
            >
              {t.cancel}
            </Button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <section className="rounded-lg border border-atg-border bg-atg-surface p-4 dark:border-atg-border dark:bg-white/5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-atg-fg">{t.title}</h3>
          <p className="mt-1 text-sm text-atg-muted">{t.subtitle}</p>
        </div>
        {editable ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setDraft(emergencyContactDraftFromApi(saved));
              setEditing(true);
            }}
          >
            {t.edit}
          </Button>
        ) : null}
      </div>
      {hasContact ? (
        <p className="mt-3 text-sm text-atg-fg">
          {[
            saved?.name,
            saved?.phone,
            saved?.email,
            saved?.country ? formatNationalityDisplay(saved.country, locale) : null,
            saved?.address,
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>
      ) : (
        <p className="mt-3 text-sm text-atg-muted">{t.empty}</p>
      )}
    </section>
  );
}

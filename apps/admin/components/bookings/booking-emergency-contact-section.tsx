'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';
import { Button, Card, Input, useToast } from '@africatourismgate/ui';
import type { BookingEmergencyContact } from '@africatourismgate/types';
import { formatNationalityDisplay } from '@africatourismgate/utils';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { CountryCodeCombobox } from '../destinations/country-code-combobox';

type Draft = {
  name: string;
  phone: string;
  email: string;
  country: string;
  address: string;
};

function emptyDraft(): Draft {
  return { name: '', phone: '', email: '', country: '', address: '' };
}

function fromApi(contact: BookingEmergencyContact | null | undefined): Draft {
  if (!contact) return emptyDraft();
  return {
    name: contact.name?.trim() ?? '',
    phone: contact.phone?.trim() ?? '',
    email: contact.email?.trim() ?? '',
    country: contact.country?.trim() ?? '',
    address: contact.address?.trim() ?? '',
  };
}

type Props = {
  bookingId: string;
  canWrite: boolean;
  initialContact?: BookingEmergencyContact | null;
  onUpdated?: () => void | Promise<void>;
  embedded?: boolean;
};

export function BookingEmergencyContactSection({
  bookingId,
  canWrite,
  initialContact = null,
  onUpdated,
  embedded = false,
}: Props) {
  const t = useTranslations('modules.bookings.emergencyContact');
  const locale = useLocale();
  const { toast } = useToast();
  const { bookings: getBookingsErrorMessage } = useAdminErrorMessages();

  const [saved, setSaved] = useState<BookingEmergencyContact | null>(initialContact ?? null);
  const [draft, setDraft] = useState<Draft>(() => fromApi(initialContact));
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    setSaved(initialContact ?? null);
    if (!editing) {
      setDraft(fromApi(initialContact));
    }
  }, [initialContact, editing]);

  const hasContact = Boolean(saved?.name?.trim() || saved?.phone?.trim());
  const showEditor = editing || (!hasContact && canWrite);

  async function handleSave() {
    if (!draft.name.trim()) {
      setActionError(t('nameRequired'));
      return;
    }
    if (!draft.phone.trim()) {
      setActionError(t('phoneRequired'));
      return;
    }
    setSaving(true);
    setActionError(null);
    try {
      const updated = await getApiClient().updateBookingEmergencyContact(bookingId, {
        name: draft.name.trim(),
        phone: draft.phone.trim(),
        email: draft.email.trim() || null,
        country: draft.country.trim() || null,
        address: draft.address.trim() || null,
      });
      setSaved(updated);
      setDraft(fromApi(updated));
      setEditing(false);
      toast({ variant: 'success', message: t('saveSuccess') });
      await onUpdated?.();
    } catch (err) {
      setActionError(getBookingsErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setDraft(fromApi(saved));
    setActionError(null);
    setEditing(false);
  }

  if (!canWrite && !hasContact) {
    return null;
  }

  const body = (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-atg-fg">{t('title')}</h3>
          <p className="mt-1 text-sm text-atg-muted">{t('subtitle')}</p>
        </div>
        {canWrite && hasContact && !showEditor ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setDraft(fromApi(saved));
              setEditing(true);
            }}
          >
            {t('edit')}
          </Button>
        ) : null}
      </div>

      {showEditor ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label={t('name')}
            labelExtra={
              <span className="text-red-500" aria-hidden="true">
                *
              </span>
            }
            name="emergencyContactName"
            value={draft.name}
            onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
            required
            disabled={saving}
          />
          <Input
            label={t('phone')}
            labelExtra={
              <span className="text-red-500" aria-hidden="true">
                *
              </span>
            }
            name="emergencyContactPhone"
            type="tel"
            value={draft.phone}
            onChange={(e) => setDraft((prev) => ({ ...prev, phone: e.target.value }))}
            required
            disabled={saving}
          />
          <Input
            label={t('email')}
            name="emergencyContactEmail"
            type="email"
            value={draft.email}
            onChange={(e) => setDraft((prev) => ({ ...prev, email: e.target.value }))}
            disabled={saving}
          />
          <CountryCodeCombobox
            label={t('country')}
            name="emergencyContactCountry"
            value={draft.country}
            onChange={(code) => setDraft((prev) => ({ ...prev, country: code }))}
            disabled={saving}
          />
          <Input
            className="sm:col-span-2"
            label={t('address')}
            name="emergencyContactAddress"
            value={draft.address}
            onChange={(e) => setDraft((prev) => ({ ...prev, address: e.target.value }))}
            placeholder={t('addressPlaceholder')}
            disabled={saving}
          />
          {actionError ? (
            <p role="alert" className="sm:col-span-2 text-sm text-red-600 dark:text-red-400">
              {actionError}
            </p>
          ) : null}
          <div className="sm:col-span-2 flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={() => void handleSave()} disabled={saving}>
              {saving ? t('saving') : t('save')}
            </Button>
            {hasContact ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={saving}
              >
                {t('cancel')}
              </Button>
            ) : null}
          </div>
        </div>
      ) : hasContact ? (
        <p className="text-sm text-atg-fg">
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
        <p className="text-sm text-atg-muted">{t('empty')}</p>
      )}
    </div>
  );

  if (embedded) {
    return <div className="mb-6 border-b border-atg-border pb-6">{body}</div>;
  }

  return (
    <Card variant="dashboard" padding="md">
      {body}
    </Card>
  );
}

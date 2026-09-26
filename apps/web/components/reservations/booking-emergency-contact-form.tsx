'use client';

import type { UpdateBookingEmergencyContactRequest } from '@africatourismgate/types';
import { useId } from 'react';
import { useLocale } from 'next-intl';
import { NationalitySelect } from './nationality-select';

export type EmergencyContactDraft = {
  name: string;
  phone: string;
  email: string;
  country: string;
  address: string;
};

export type EmergencyContactFieldErrors = {
  name?: string;
  phone?: string;
};

export function emptyEmergencyContactDraft(): EmergencyContactDraft {
  return {
    name: '',
    phone: '',
    email: '',
    country: '',
    address: '',
  };
}

export function emergencyContactDraftFromApi(contact: {
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  country?: string | null;
  address?: string | null;
} | null | undefined): EmergencyContactDraft {
  if (!contact) return emptyEmergencyContactDraft();
  return {
    name: contact.name?.trim() ?? '',
    phone: contact.phone?.trim() ?? '',
    email: contact.email?.trim() ?? '',
    country: contact.country?.trim() ?? '',
    address: contact.address?.trim() ?? '',
  };
}

export function emergencyContactDraftToPayload(
  draft: EmergencyContactDraft,
): UpdateBookingEmergencyContactRequest {
  return {
    name: draft.name.trim(),
    phone: draft.phone.trim(),
    email: draft.email.trim() || null,
    country: draft.country.trim() || null,
    address: draft.address.trim() || null,
  };
}

export type BookingEmergencyContactFormLabels = {
  title: string;
  subtitle?: string;
  name: string;
  phone: string;
  email: string;
  country: string;
  address: string;
  addressPlaceholder: string;
  nationalityPlaceholder: string;
  nationalitySearch: string;
  nationalityEmpty: string;
};

type Props = {
  value: EmergencyContactDraft;
  onChange: (next: EmergencyContactDraft) => void;
  labels: BookingEmergencyContactFormLabels;
  errors?: EmergencyContactFieldErrors;
  disabled?: boolean;
  idPrefix?: string;
};

export function BookingEmergencyContactForm({
  value,
  onChange,
  labels,
  errors,
  disabled = false,
  idPrefix,
}: Props) {
  const locale = useLocale();
  const reactId = useId();
  const prefix = idPrefix ?? `em-contact-${reactId}`;

  function patch(partial: Partial<EmergencyContactDraft>) {
    onChange({ ...value, ...partial });
  }

  return (
    <section className="space-y-3 rounded-lg border border-atg-border p-4 dark:border-atg-border">
      <div>
        <h3 className="text-base font-semibold text-atg-fg">{labels.title}</h3>
        {labels.subtitle ? (
          <p className="mt-1 text-sm text-atg-muted">{labels.subtitle}</p>
        ) : null}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={`${prefix}-name`} className="block text-sm font-medium text-atg-fg">
            {labels.name}
            <span className="ml-1 text-red-500" aria-hidden="true">
              *
            </span>
          </label>
          <input
            id={`${prefix}-name`}
            type="text"
            value={value.name}
            onChange={(e) => patch({ name: e.target.value })}
            disabled={disabled}
            className="mt-1 w-full rounded-lg border border-atg-border bg-transparent px-3 py-2 text-sm text-atg-fg disabled:opacity-60 dark:border-atg-border"
            required
            aria-required="true"
            aria-invalid={Boolean(errors?.name)}
          />
          {errors?.name ? (
            <p role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">
              {errors.name}
            </p>
          ) : null}
        </div>
        <div>
          <label htmlFor={`${prefix}-phone`} className="block text-sm font-medium text-atg-fg">
            {labels.phone}
            <span className="ml-1 text-red-500" aria-hidden="true">
              *
            </span>
          </label>
          <input
            id={`${prefix}-phone`}
            type="tel"
            value={value.phone}
            onChange={(e) => patch({ phone: e.target.value })}
            disabled={disabled}
            className="mt-1 w-full rounded-lg border border-atg-border bg-transparent px-3 py-2 text-sm text-atg-fg disabled:opacity-60 dark:border-atg-border"
            required
            aria-required="true"
            aria-invalid={Boolean(errors?.phone)}
          />
          {errors?.phone ? (
            <p role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">
              {errors.phone}
            </p>
          ) : null}
        </div>
        <div>
          <label htmlFor={`${prefix}-email`} className="block text-sm font-medium text-atg-fg">
            {labels.email}
          </label>
          <input
            id={`${prefix}-email`}
            type="email"
            value={value.email}
            onChange={(e) => patch({ email: e.target.value })}
            disabled={disabled}
            className="mt-1 w-full rounded-lg border border-atg-border bg-transparent px-3 py-2 text-sm text-atg-fg disabled:opacity-60 dark:border-atg-border"
          />
        </div>
        <div>
          <NationalitySelect
            id={`${prefix}-country`}
            label={labels.country}
            value={value.country}
            onChange={(code) => patch({ country: code })}
            locale={locale}
            placeholder={labels.nationalityPlaceholder}
            searchPlaceholder={labels.nationalitySearch}
            emptyMessage={labels.nationalityEmpty}
            disabled={disabled}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor={`${prefix}-address`} className="block text-sm font-medium text-atg-fg">
            {labels.address}
          </label>
          <input
            id={`${prefix}-address`}
            type="text"
            value={value.address}
            onChange={(e) => patch({ address: e.target.value })}
            disabled={disabled}
            placeholder={labels.addressPlaceholder}
            className="mt-1 w-full rounded-lg border border-atg-border bg-transparent px-3 py-2 text-sm text-atg-fg disabled:opacity-60 dark:border-atg-border"
          />
        </div>
      </div>
    </section>
  );
}

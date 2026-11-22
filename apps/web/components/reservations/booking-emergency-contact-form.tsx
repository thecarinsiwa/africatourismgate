'use client';

import type { UpdateBookingEmergencyContactRequest } from '@africatourismgate/types';
import { useEffect, useId, useState } from 'react';
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
  /** When true, render as a closed-by-default accordion (checkout recap). */
  collapsible?: boolean;
};

export function BookingEmergencyContactForm({
  value,
  onChange,
  labels,
  errors,
  disabled = false,
  idPrefix,
  collapsible = false,
}: Props) {
  const locale = useLocale();
  const reactId = useId();
  const prefix = idPrefix ?? `em-contact-${reactId}`;
  const triggerId = `${prefix}-trigger`;
  const panelId = `${prefix}-panel`;
  const [expanded, setExpanded] = useState(!collapsible);

  useEffect(() => {
    if (!collapsible) {
      setExpanded(true);
      return;
    }
    if (errors?.name || errors?.phone) {
      setExpanded(true);
    }
  }, [collapsible, errors?.name, errors?.phone]);

  function patch(partial: Partial<EmergencyContactDraft>) {
    onChange({ ...value, ...partial });
  }

  const nameSummary = value.name.trim() || '-';
  const phoneSummary = value.phone.trim() || '-';

  const fields = (
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
  );

  if (!collapsible) {
    return (
      <section className="space-y-3 rounded-lg border border-atg-border p-4 dark:border-atg-border">
        <div>
          <h3 className="text-base font-semibold text-atg-fg">{labels.title}</h3>
          {labels.subtitle ? (
            <p className="mt-1 text-sm text-atg-muted">{labels.subtitle}</p>
          ) : null}
        </div>
        {fields}
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-xl border-2 border-red-600 bg-atg-elevated dark:border-red-500 dark:bg-atg-elevated">
      <div className="flex items-center gap-2 bg-atg-surface px-3 py-2 dark:bg-white/5 sm:px-4">
        <button
          type="button"
          id={triggerId}
          aria-expanded={expanded}
          aria-controls={panelId}
          onClick={() => setExpanded((current) => !current)}
          className="flex min-w-0 flex-1 items-center gap-3 py-1 text-left"
        >
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-atg-fg">
              {labels.title} : {nameSummary}
            </span>
            <span className="mt-0.5 block truncate text-sm text-atg-muted sm:hidden">
              {labels.phone}: {phoneSummary}
            </span>
          </span>
          <span className="hidden min-w-0 flex-1 truncate text-sm font-semibold text-atg-fg sm:block">
            {labels.phone}: {phoneSummary}
          </span>
        </button>
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={panelId}
          onClick={() => setExpanded((current) => !current)}
          aria-label={labels.title}
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded border border-red-600 text-atg-fg transition-colors hover:bg-red-50 dark:border-red-500 dark:hover:bg-red-950/30"
        >
          <svg
            className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
      {expanded ? (
        <div
          id={panelId}
          role="region"
          aria-labelledby={triggerId}
          className="space-y-3 border-t border-red-600/40 p-4 dark:border-red-500/40"
        >
          {labels.subtitle ? (
            <p className="text-sm text-atg-muted">{labels.subtitle}</p>
          ) : null}
          {fields}
        </div>
      ) : null}
    </section>
  );
}

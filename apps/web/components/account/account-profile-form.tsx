'use client';

import { Button, Input, Spinner } from '@africatourismgate/ui';
import type { AuthUser, UserStatus } from '@africatourismgate/types';
import { useEffect, useMemo, useState } from 'react';
import { getAccountApiClient } from '../../lib/api/account';
import {
  formatProfileDisplayName,
  getProfileInitials,
} from '../../lib/account/display';
import {
  getWebSession,
  saveWebSession,
} from '../../lib/auth/client-session';
import { useLocale, useTranslations } from '../../lib/i18n/locale-provider';
import {
  localeFromPreferredLanguage,
  syncSessionUserPreferredLanguage,
} from '../../lib/i18n/preferred-language';
import { LOCALES } from '../../lib/i18n/types';

const statusStyles: Record<UserStatus, string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-300',
  suspended: 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300',
  deleted: 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300',
};

function ProfileStatusBadge({
  status,
  label,
}: {
  status: UserStatus;
  label: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusStyles[status]}`}
    >
      {label}
    </span>
  );
}

export function AccountProfileForm() {
  const t = useTranslations();
  const { setLocale } = useLocale();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('fr');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const displayName = useMemo(() => {
    if (!user) return '';
    return formatProfileDisplayName(firstName, lastName, user.email);
  }, [user, firstName, lastName]);

  const initials = useMemo(() => {
    if (!user) return '';
    return getProfileInitials(firstName, lastName, user.email);
  }, [user, firstName, lastName]);

  const isDirty = useMemo(() => {
    if (!user) return false;
    return (
      firstName.trim() !== user.firstName ||
      lastName.trim() !== user.lastName ||
      (phone.trim() || '') !== (user.phone?.trim() ?? '') ||
      (preferredLanguage.trim() || 'fr') !== (user.preferredLanguage?.trim() ?? 'fr')
    );
  }, [user, firstName, lastName, phone, preferredLanguage]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const client = await getAccountApiClient();
        const me = await client.getAuthMe();
        if (!mounted) return;
        setUser(me.user);
        setFirstName(me.user.firstName);
        setLastName(me.user.lastName);
        setPhone(me.user.phone ?? '');
        setPreferredLanguage(me.user.preferredLanguage ?? 'fr');
        syncSessionUserPreferredLanguage(me.user);
        const loadedLocale = localeFromPreferredLanguage(me.user.preferredLanguage);
        if (loadedLocale) {
          setLocale(loadedLocale, { persist: false });
        }
      } catch {
        if (mounted) setError(t.account.profile.loadError);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    void load();
    return () => {
      mounted = false;
    };
  }, [t.account.profile.loadError]);

  function handleReset() {
    if (!user) return;
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setPhone(user.phone ?? '');
    setPreferredLanguage(user.preferredLanguage ?? 'fr');
    setMessage(null);
    setError(null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const client = await getAccountApiClient();
      const updated = await client.updateAuthProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || null,
        preferredLanguage: preferredLanguage.trim() || null,
      });
      setUser(updated);
      setFirstName(updated.firstName);
      setLastName(updated.lastName);
      setPhone(updated.phone ?? '');
      setPreferredLanguage(updated.preferredLanguage ?? 'fr');
      const session = getWebSession();
      if (session) {
        saveWebSession({ ...session, user: updated });
      }
      const savedLocale = localeFromPreferredLanguage(updated.preferredLanguage);
      if (savedLocale) {
        setLocale(savedLocale, { persist: false });
      }
      setMessage(t.account.profile.saved);
    } catch {
      setError(t.account.profile.saveError);
    } finally {
      setSaving(false);
    }
  }

  function statusLabel(status: UserStatus): string {
    if (status === 'active') return t.account.profile.statusActive;
    if (status === 'suspended') return t.account.profile.statusSuspended;
    return t.account.profile.statusDeleted;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="md" variant="primary" label={t.account.loading} showLabel />
      </div>
    );
  }

  if (error && !user) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400" role="alert">
        {error}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-atg-border bg-gradient-to-br from-primary/5 via-white to-white p-5 sm:flex-row sm:items-center sm:justify-between dark:border-atg-border dark:from-primary/10 dark:via-atg-elevated dark:to-atg-elevated">
        <div className="flex items-center gap-4">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-white shadow-sm"
            aria-hidden
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold text-atg-fg">
              {displayName}
            </p>
            <p className="truncate text-sm text-atg-muted">{user?.email}</p>
            {user ? (
              <div className="mt-2">
                <ProfileStatusBadge status={user.status} label={statusLabel(user.status)} />
              </div>
            ) : null}
          </div>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-xs font-medium uppercase tracking-wide text-atg-muted">
            {t.account.profile.memberId}
          </p>
          <p className="mt-1 font-mono text-xs text-atg-fg/80">{user?.id}</p>
        </div>
      </div>

      {message ? (
        <div
          className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-300"
          role="status"
        >
          {message}
        </div>
      ) : null}

      {error && user ? (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
          <section className="rounded-lg border border-atg-border p-4 dark:border-atg-border">
            <h3 className="text-sm font-semibold text-atg-fg">
              {t.account.profile.personalInfo}
            </h3>
            <p className="mt-1 text-xs text-atg-muted">
              {t.account.profile.personalInfoHint}
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  htmlFor="profile-email"
                  className="mb-1 block text-sm font-medium text-atg-fg/80"
                >
                  {t.account.profile.email}
                </label>
                <Input id="profile-email" value={user?.email ?? ''} disabled readOnly />
                <p className="mt-1 text-xs text-atg-muted">
                  {t.account.profile.emailHint}
                </p>
              </div>
              <div>
                <label
                  htmlFor="profile-first-name"
                  className="mb-1 block text-sm font-medium text-atg-fg/80"
                >
                  {t.account.profile.firstName}
                </label>
                <Input
                  id="profile-first-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  autoComplete="given-name"
                />
              </div>
              <div>
                <label
                  htmlFor="profile-last-name"
                  className="mb-1 block text-sm font-medium text-atg-fg/80"
                >
                  {t.account.profile.lastName}
                </label>
                <Input
                  id="profile-last-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  autoComplete="family-name"
                />
              </div>
              <div className="sm:col-span-2">
                <label
                  htmlFor="profile-phone"
                  className="mb-1 block text-sm font-medium text-atg-fg/80"
                >
                  {t.account.profile.phone}
                </label>
                <Input
                  id="profile-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                  placeholder="+243 800 000 000"
                />
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-atg-border p-4 dark:border-atg-border">
            <h3 className="text-sm font-semibold text-atg-fg">
              {t.account.profile.preferences}
            </h3>
            <p className="mt-1 text-xs text-atg-muted">
              {t.account.profile.preferencesHint}
            </p>
            <div className="mt-4">
              <label
                htmlFor="profile-language"
                className="mb-1 block text-sm font-medium text-atg-fg/80"
              >
                {t.account.profile.language}
              </label>
              <select
                id="profile-language"
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="w-full rounded-lg border border-atg-border bg-atg-elevated px-3 py-2.5 text-sm dark:border-atg-border dark:bg-atg-elevated dark:text-white"
              >
                {LOCALES.map((entry) => (
                  <option key={entry.code} value={entry.code}>
                    {entry.name}
                  </option>
                ))}
              </select>
            </div>
          </section>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="submit"
              loading={saving}
              loadingText={t.account.profile.saving}
              disabled={!isDirty}
            >
              {t.account.profile.save}
            </Button>
            {isDirty ? (
              <Button type="button" variant="outline" onClick={handleReset} disabled={saving}>
                {t.account.profile.reset}
              </Button>
            ) : null}
            {isDirty ? (
              <span className="text-xs text-atg-muted">
                {t.account.profile.unsavedChanges}
              </span>
            ) : null}
          </div>
      </form>
    </div>
  );
}

'use client';

import { Button, Input, Spinner } from '@africatourismgate/ui';
import type { AuthUser, UserStatus } from '@africatourismgate/types';
import { normalizeBrandingAssetUrl } from '@africatourismgate/utils';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getAccountApiClient } from '../../lib/api/account';
import {
  formatProfileDisplayName,
  getProfileInitials,
} from '../../lib/account/display';
import {
  getWebSession,
  saveWebSession,
} from '../../lib/auth/client-session';
import {
  applyLocaleToDocument,
  localeFromPreferredLanguage,
  syncSessionUserPreferredLanguage,
} from '../../lib/i18n/preferred-language';
import { LOCALES } from '../../lib/i18n/types';

const AVATAR_MAX_BYTES = 5 * 1024 * 1024;
const AVATAR_ACCEPT = 'image/jpeg,image/png,image/webp';

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
  const t = useTranslations('account');
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  /** Prevents a late/duplicate GET /auth/me from clobbering in-progress edits (Strict Mode / slow CI). */
  const hasHydratedRef = useRef(false);

  const [user, setUser] = useState<AuthUser | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('fr');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
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

  const avatarSrc = useMemo(
    () => normalizeBrandingAssetUrl(user?.avatarUrl ?? null),
    [user?.avatarUrl],
  );

  const isDirty = useMemo(() => {
    if (!user) return false;
    return (
      firstName.trim() !== user.firstName ||
      lastName.trim() !== user.lastName ||
      (phone.trim() || '') !== (user.phone?.trim() ?? '') ||
      (preferredLanguage.trim() || 'fr') !== (user.preferredLanguage?.trim() ?? 'fr')
    );
  }, [user, firstName, lastName, phone, preferredLanguage]);

  function applyUser(updated: AuthUser) {
    setUser(updated);
    setFirstName(updated.firstName);
    setLastName(updated.lastName);
    setPhone(updated.phone ?? '');
    setPreferredLanguage(updated.preferredLanguage ?? 'fr');
    const session = getWebSession();
    if (session) {
      saveWebSession({ ...session, user: updated });
    }
    syncSessionUserPreferredLanguage(updated);
    const savedLocale = localeFromPreferredLanguage(updated.preferredLanguage);
    if (savedLocale) {
      applyLocaleToDocument(savedLocale);
      router.refresh();
    }
  }

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const client = await getAccountApiClient();
        const me = await client.getAuthMe();
        if (!mounted) return;
        if (hasHydratedRef.current) return;
        hasHydratedRef.current = true;
        applyUser(me.user);
      } catch {
        if (mounted) setError(t('profile.loadError'));
      } finally {
        if (mounted) setLoading(false);
      }
    }
    void load();
    return () => {
      mounted = false;
    };
    // Load profile once on mount; `t` is stable for error strings.
  }, [t]);

  function handleReset() {
    if (!user) return;
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setPhone(user.phone ?? '');
    setPreferredLanguage(user.preferredLanguage ?? 'fr');
    setMessage(null);
    setError(null);
  }

  async function handlePhotoChange(file: File | undefined) {
    if (!file) return;
    if (file.size > AVATAR_MAX_BYTES) {
      setError(t('profile.photoTooLarge'));
      return;
    }
    setUploadingPhoto(true);
    setMessage(null);
    setError(null);
    try {
      const client = await getAccountApiClient();
      const form = new FormData();
      form.append('file', file);
      const updated = await client.uploadAuthAvatar(form);
      applyUser(updated);
      setMessage(t('profile.saved'));
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch {
      setError(t('profile.photoUploadError'));
    } finally {
      setUploadingPhoto(false);
    }
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
      applyUser(updated);
      setMessage(t('profile.saved'));
    } catch {
      setError(t('profile.saveError'));
    } finally {
      setSaving(false);
    }
  }

  function statusLabel(status: UserStatus): string {
    if (status === 'active') return t('profile.statusActive');
    if (status === 'suspended') return t('profile.statusSuspended');
    return t('profile.statusDeleted');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="md" variant="primary" label={t('loading')} showLabel />
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
          <div className="relative shrink-0">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt=""
                className="h-16 w-16 rounded-2xl object-cover shadow-sm"
              />
            ) : (
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-white shadow-sm"
                aria-hidden
              >
                {initials}
              </div>
            )}
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
            {t('profile.memberId')}
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

      <section className="max-w-2xl rounded-lg border border-atg-border p-4 dark:border-atg-border">
        <h3 className="text-sm font-semibold text-atg-fg">{t('profile.photo')}</h3>
        <p className="mt-1 text-xs text-atg-muted">{t('profile.photoHint')}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept={AVATAR_ACCEPT}
            className="sr-only"
            id="profile-avatar-input"
            disabled={uploadingPhoto}
            onChange={(e) => void handlePhotoChange(e.target.files?.[0])}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            loading={uploadingPhoto}
            loadingText={t('profile.photoUploading')}
            onClick={() => fileInputRef.current?.click()}
          >
            {avatarSrc ? t('profile.photoChange') : t('profile.photoAdd')}
          </Button>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
          <section className="rounded-lg border border-atg-border p-4 dark:border-atg-border">
            <h3 className="text-sm font-semibold text-atg-fg">
              {t('profile.personalInfo')}
            </h3>
            <p className="mt-1 text-xs text-atg-muted">
              {t('profile.personalInfoHint')}
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  htmlFor="profile-email"
                  className="mb-1 block text-sm font-medium text-atg-fg/80"
                >
                  {t('profile.email')}
                </label>
                <Input id="profile-email" value={user?.email ?? ''} disabled readOnly />
                <p className="mt-1 text-xs text-atg-muted">
                  {t('profile.emailHint')}
                </p>
              </div>
              <div>
                <label
                  htmlFor="profile-first-name"
                  className="mb-1 block text-sm font-medium text-atg-fg/80"
                >
                  {t('profile.firstName')}
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
                  {t('profile.lastName')}
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
                  {t('profile.phone')}
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
              {t('profile.preferences')}
            </h3>
            <p className="mt-1 text-xs text-atg-muted">
              {t('profile.preferencesHint')}
            </p>
            <div className="mt-4">
              <label
                htmlFor="profile-language"
                className="mb-1 block text-sm font-medium text-atg-fg/80"
              >
                {t('profile.language')}
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
              loadingText={t('profile.saving')}
              disabled={!isDirty}
            >
              {t('profile.save')}
            </Button>
            {isDirty ? (
              <Button type="button" variant="outline" onClick={handleReset} disabled={saving}>
                {t('profile.reset')}
              </Button>
            ) : null}
            {isDirty ? (
              <span className="text-xs text-atg-muted">
                {t('profile.unsavedChanges')}
              </span>
            ) : null}
          </div>
      </form>
    </div>
  );
}

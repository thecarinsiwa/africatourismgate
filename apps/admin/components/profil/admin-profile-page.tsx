'use client';

import type { AuthUser } from '@africatourismgate/types';
import { Button, Input, Spinner } from '@africatourismgate/ui';
import { normalizeBrandingAssetUrl } from '@africatourismgate/utils';
import { useTranslations } from 'next-intl';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { getSession, saveSession } from '../../lib/auth/session';
import {
  applyLocaleFromUser,
  localeFromPreferredLanguage,
} from '../../lib/i18n/preferred-language';
import { useSetAdminPageMeta } from '../admin-page-meta-context';

const AVATAR_MAX_BYTES = 5 * 1024 * 1024;
const AVATAR_ACCEPT = 'image/jpeg,image/png,image/webp';
const LOCALES = [
  { code: 'fr', name: 'Français' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
] as const;

export function AdminProfilePage() {
  const t = useTranslations('pages.profil');
  const tForm = useTranslations('modules.users.form');
  const tActions = useTranslations('common.actions');
  const tLoading = useTranslations('common.loading');
  const tValidation = useTranslations('modules.common.validation');
  useSetAdminPageMeta({ title: t('title') });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const languageId = useId();

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
    const session = getSession();
    if (session) {
      saveSession({ ...session, user: updated });
    }
    applyLocaleFromUser(updated);
    const locale = localeFromPreferredLanguage(updated.preferredLanguage);
    if (locale) {
      document.documentElement.lang = locale;
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const me = await getApiClient().getAuthMe();
        if (cancelled) return;
        applyUser(me.user);
      } catch {
        if (!cancelled) setError(t('loadError'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once
  }, [t]);

  async function handlePhotoChange(file: File | undefined) {
    if (!file) return;
    if (file.size > AVATAR_MAX_BYTES) {
      setError(tValidation('imageTooLarge'));
      return;
    }
    setUploadingPhoto(true);
    setMessage(null);
    setError(null);
    try {
      const form = new FormData();
      form.append('file', file);
      const updated = await getApiClient().uploadAuthAvatar(form);
      applyUser(updated);
      setMessage(t('saved'));
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch {
      setError(t('photoUploadError'));
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
      const updated = await getApiClient().updateAuthProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || null,
        preferredLanguage: preferredLanguage.trim() || null,
      });
      applyUser(updated);
      setMessage(t('saved'));
    } catch {
      setError(t('saveError'));
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    if (!user) return;
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setPhone(user.phone ?? '');
    setPreferredLanguage(user.preferredLanguage ?? 'fr');
    setMessage(null);
    setError(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="md" variant="primary" label={tLoading('default')} showLabel />
      </div>
    );
  }

  if (error && !user) {
    return (
      <p role="alert" className="text-sm text-red-600 dark:text-red-400">
        {error}
      </p>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-atg-fg">{t('title')}</h2>
        <p className="mt-1 text-sm text-atg-muted">{t('description')}</p>
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

      <section className="rounded-lg border border-atg-border bg-atg-elevated p-4">
        <h3 className="text-sm font-semibold text-atg-fg">{t('photo')}</h3>
        <p className="mt-1 text-xs text-atg-muted">{t('photoHint')}</p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          {avatarSrc ? (
            // eslint-disable-next-line @next/next/no-img-element -- remote upload URL from API
            <img
              src={avatarSrc}
              alt=""
              className="h-16 w-16 rounded-full object-cover ring-1 ring-atg-border/60"
            />
          ) : (
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-lg font-bold text-white"
              aria-hidden
            >
              {(firstName[0] ?? user?.email[0] ?? '?').toUpperCase()}
            </div>
          )}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept={AVATAR_ACCEPT}
              className="sr-only"
              id="admin-profile-avatar-input"
              disabled={uploadingPhoto}
              onChange={(e) => void handlePhotoChange(e.target.files?.[0])}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              loading={uploadingPhoto}
              loadingText={t('photoUploading')}
              onClick={() => fileInputRef.current?.click()}
            >
              {avatarSrc ? t('photoChange') : t('photoAdd')}
            </Button>
          </div>
        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-lg border border-atg-border bg-atg-elevated p-4"
      >
        <div>
          <label htmlFor="admin-profile-email" className="mb-1 block text-sm font-medium text-atg-fg">
            {tForm('email')}
          </label>
          <Input id="admin-profile-email" value={user?.email ?? ''} disabled readOnly />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="admin-profile-first-name"
              className="mb-1 block text-sm font-medium text-atg-fg"
            >
              {tForm('firstName')}
            </label>
            <Input
              id="admin-profile-first-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              autoComplete="given-name"
            />
          </div>
          <div>
            <label
              htmlFor="admin-profile-last-name"
              className="mb-1 block text-sm font-medium text-atg-fg"
            >
              {tForm('lastName')}
            </label>
            <Input
              id="admin-profile-last-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              autoComplete="family-name"
            />
          </div>
        </div>
        <div>
          <label htmlFor="admin-profile-phone" className="mb-1 block text-sm font-medium text-atg-fg">
            {tForm('phone')}
          </label>
          <Input
            id="admin-profile-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
          />
        </div>
        <div>
          <label htmlFor={languageId} className="mb-1 block text-sm font-medium text-atg-fg">
            {tForm('preferredLanguage')}
          </label>
          <select
            id={languageId}
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
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button type="submit" loading={saving} disabled={!isDirty}>
            {tActions('save')}
          </Button>
          {isDirty ? (
            <Button type="button" variant="outline" onClick={handleReset} disabled={saving}>
              {tActions('cancel')}
            </Button>
          ) : null}
        </div>
      </form>
    </div>
  );
}

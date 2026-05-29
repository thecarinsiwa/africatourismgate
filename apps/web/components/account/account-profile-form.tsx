'use client';

import { Button, Input } from '@africatourismgate/ui';
import type { AuthUser } from '@africatourismgate/types';
import { useEffect, useState } from 'react';
import { getAccountApiClient } from '../../lib/api/account';
import {
  getWebSession,
  saveWebSession,
} from '../../lib/auth/client-session';
import { useTranslations } from '../../lib/i18n/locale-provider';

export function AccountProfileForm() {
  const t = useTranslations();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('fr');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      const session = getWebSession();
      if (session) {
        saveWebSession({
          ...session,
          user: updated,
        });
      }
      setMessage(t.account.profile.saved);
    } catch {
      setError(t.account.profile.saveError);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-gray-600 dark:text-atg-muted">{t.account.loading}</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white/80">
          {t.account.profile.email}
        </label>
        <Input value={user?.email ?? ''} disabled readOnly />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white/80">
          {t.account.profile.firstName}
        </label>
        <Input
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white/80">
          {t.account.profile.lastName}
        </label>
        <Input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white/80">
          {t.account.profile.phone}
        </label>
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white/80">
          {t.account.profile.language}
        </label>
        <select
          value={preferredLanguage}
          onChange={(e) => setPreferredLanguage(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-atg-border dark:bg-atg-elevated dark:text-white"
        >
          <option value="fr">Français</option>
          <option value="en">English</option>
          <option value="es">Español</option>
        </select>
      </div>
      {message && (
        <p className="text-sm text-green-700 dark:text-green-400" role="status">
          {message}
        </p>
      )}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" disabled={saving}>
        {saving ? t.account.profile.saving : t.account.profile.save}
      </Button>
    </form>
  );
}

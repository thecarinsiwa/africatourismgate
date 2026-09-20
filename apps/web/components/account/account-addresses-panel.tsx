'use client';

import { Button, Input, Spinner } from '@africatourismgate/ui';
import type { UserAddress } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { getAccountApiClient } from '../../lib/api/account';

const emptyForm = {
  label: '',
  line1: '',
  line2: '',
  city: '',
  region: '',
  postalCode: '',
  countryCode: 'CD',
  isDefault: false,
};

export function AccountAddressesPanel() {
  const t = useTranslations('account');
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const client = await getAccountApiClient();
      const result = await client.listUserAddresses({ limit: 50 });
      setAddresses(result.data);
    } catch {
      setError(t('addresses.loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const client = await getAccountApiClient();
      await client.createUserAddress({
        label: form.label || undefined,
        line1: form.line1,
        line2: form.line2 || undefined,
        city: form.city,
        region: form.region || undefined,
        postalCode: form.postalCode || undefined,
        countryCode: form.countryCode,
        isDefault: form.isDefault,
      });
      setForm(emptyForm);
      setShowForm(false);
      await load();
    } catch {
      setError(t('addresses.saveError'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm(t('addresses.deleteConfirm'))) return;
    try {
      const client = await getAccountApiClient();
      await client.deleteUserAddress(id);
      await load();
    } catch {
      setError(t('addresses.deleteError'));
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="md" variant="primary" label={t('loading')} showLabel />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {addresses.length === 0 && !showForm && (
        <p className="text-sm text-atg-muted">{t('addresses.empty')}</p>
      )}

      <ul className="space-y-3">
        {addresses.map((addr) => (
          <li
            key={addr.id}
            className="rounded-lg border border-atg-border p-4 dark:border-atg-border"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                {addr.label && (
                  <p className="font-medium text-atg-fg">{addr.label}</p>
                )}
                <p className="text-sm text-atg-muted">
                  {addr.line1}
                  {addr.line2 ? `, ${addr.line2}` : ''}
                </p>
                <p className="text-sm text-atg-muted">
                  {addr.postalCode ? `${addr.postalCode} ` : ''}
                  {addr.city}
                  {addr.region ? `, ${addr.region}` : ''} — {addr.countryCode}
                </p>
                {addr.isDefault === 1 && (
                  <span className="mt-1 inline-block text-xs font-medium text-primary">
                    {t('addresses.defaultBadge')}
                  </span>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void handleDelete(addr.id)}
              >
                {t('addresses.delete')}
              </Button>
            </div>
          </li>
        ))}
      </ul>

      {showForm ? (
        <form onSubmit={handleCreate} className="max-w-lg space-y-3 rounded-lg border border-atg-border p-4 dark:border-atg-border">
          <Input
            placeholder={t('addresses.label')}
            value={form.label}
            onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
          />
          <Input
            placeholder={t('addresses.line1')}
            value={form.line1}
            onChange={(e) => setForm((f) => ({ ...f, line1: e.target.value }))}
            required
          />
          <Input
            placeholder={t('addresses.line2')}
            value={form.line2}
            onChange={(e) => setForm((f) => ({ ...f, line2: e.target.value }))}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              placeholder={t('addresses.city')}
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              required
            />
            <Input
              placeholder={t('addresses.countryCode')}
              value={form.countryCode}
              onChange={(e) => setForm((f) => ({ ...f, countryCode: e.target.value }))}
              required
              maxLength={2}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
            />
            {t('addresses.isDefault')}
          </label>
          <div className="flex gap-2">
            <Button type="submit" loading={saving} loadingText={t('addresses.saving')}>
              {t('addresses.add')}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              {t('addresses.cancel')}
            </Button>
          </div>
        </form>
      ) : (
        <Button type="button" onClick={() => setShowForm(true)}>
          {t('addresses.addNew')}
        </Button>
      )}

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

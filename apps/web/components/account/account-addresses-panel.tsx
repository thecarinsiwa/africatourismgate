'use client';

import { Button, Input, Modal, Spinner } from '@africatourismgate/ui';
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

function addressLabel(addr: UserAddress): string {
  if (addr.label) return addr.label;
  const parts = [addr.line1, addr.city].filter(Boolean);
  return parts.join(', ') || addr.countryCode;
}

export function AccountAddressesPanel() {
  const t = useTranslations('account');
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UserAddress | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setError(null);
    try {
      const client = await getAccountApiClient();
      await client.deleteUserAddress(deleteTarget.id);
      setDeleteTarget(null);
      await load();
    } catch {
      setError(t('addresses.deleteError'));
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
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
      {addresses.length === 0 && !showForm ? (
        <p className="text-sm text-atg-muted">{t('addresses.empty')}</p>
      ) : null}

      <ul className="space-y-3">
        {addresses.map((addr) => (
          <li
            key={addr.id}
            className="rounded-lg border border-atg-border p-4 dark:border-atg-border"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                {addr.label ? (
                  <p className="font-medium text-atg-fg">{addr.label}</p>
                ) : null}
                <p className="text-sm text-atg-muted">
                  {addr.line1}
                  {addr.line2 ? `, ${addr.line2}` : ''}
                </p>
                <p className="text-sm text-atg-muted">
                  {addr.postalCode ? `${addr.postalCode} ` : ''}
                  {addr.city}
                  {addr.region ? `, ${addr.region}` : ''} — {addr.countryCode}
                </p>
                {addr.isDefault === 1 ? (
                  <span className="mt-1 inline-block text-xs font-medium text-primary">
                    {t('addresses.defaultBadge')}
                  </span>
                ) : null}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeleteTarget(addr)}
              >
                {t('addresses.delete')}
              </Button>
            </div>
          </li>
        ))}
      </ul>

      {showForm ? (
        <form
          onSubmit={(event) => void handleCreate(event)}
          className="max-w-lg space-y-3 rounded-lg border border-atg-border p-4 dark:border-atg-border"
        >
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

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      <Modal
        open={deleteTarget != null}
        onOpenChange={(open) => {
          if (!open && !deleting) setDeleteTarget(null);
        }}
        title={t('addresses.deleteTitle')}
        showClose={!deleting}
        closeAriaLabel={t('addresses.cancel')}
        className="max-w-sm"
      >
        <p className="text-sm text-atg-muted">
          {t('addresses.deleteConfirm')}
          {deleteTarget ? (
            <>
              {' '}
              <span className="font-medium text-atg-fg">({addressLabel(deleteTarget)})</span>
            </>
          ) : null}
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={deleting}
            onClick={() => setDeleteTarget(null)}
          >
            {t('addresses.no')}
          </Button>
          <Button
            type="button"
            disabled={deleting}
            loading={deleting}
            loadingText={t('addresses.deleting')}
            onClick={() => void confirmDelete()}
            className="border-red-600 bg-red-600 text-white hover:border-red-700 hover:bg-red-700"
          >
            {t('addresses.yes')}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

'use client';

import { Button, Input } from '@africatourismgate/ui';
import type { UserPaymentMethod, UserPaymentMethodType } from '@africatourismgate/types';
import { useCallback, useEffect, useState } from 'react';
import { getAccountApiClient } from '../../lib/api/account';
import { useTranslations } from '../../lib/i18n/locale-provider';

const emptyForm = {
  type: 'card' as UserPaymentMethodType,
  provider: '',
  lastFour: '',
  isDefault: false,
};

export function AccountPaymentMethodsPanel() {
  const t = useTranslations();
  const [methods, setMethods] = useState<UserPaymentMethod[]>([]);
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
      const result = await client.listUserPaymentMethods({ limit: 50 });
      setMethods(result.data);
    } catch {
      setError(t.account.paymentMethods.loadError);
    } finally {
      setLoading(false);
    }
  }, [t.account.paymentMethods.loadError]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const client = await getAccountApiClient();
      await client.createUserPaymentMethod({
        type: form.type,
        provider: form.provider || undefined,
        lastFour: form.lastFour || undefined,
        isDefault: form.isDefault,
      });
      setForm(emptyForm);
      setShowForm(false);
      await load();
    } catch {
      setError(t.account.paymentMethods.saveError);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm(t.account.paymentMethods.deleteConfirm)) return;
    try {
      const client = await getAccountApiClient();
      await client.deleteUserPaymentMethod(id);
      await load();
    } catch {
      setError(t.account.paymentMethods.deleteError);
    }
  }

  if (loading) {
    return <p className="text-sm text-atg-muted">{t.account.loading}</p>;
  }

  return (
    <div className="space-y-6">
      {methods.length === 0 && !showForm && (
        <p className="text-sm text-atg-muted">
          {t.account.paymentMethods.empty}
        </p>
      )}

      <ul className="space-y-3">
        {methods.map((method) => (
          <li
            key={method.id}
            className="flex items-center justify-between rounded-lg border border-atg-border p-4 dark:border-atg-border"
          >
            <div>
              <p className="font-medium capitalize text-atg-fg">
                {method.type}
                {method.provider ? ` — ${method.provider}` : ''}
              </p>
              {method.lastFour && (
                <p className="text-sm text-atg-muted">
                  •••• {method.lastFour}
                </p>
              )}
              {method.isDefault === 1 && (
                <span className="mt-1 inline-block text-xs font-medium text-primary">
                  {t.account.paymentMethods.defaultBadge}
                </span>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void handleDelete(method.id)}
            >
              {t.account.paymentMethods.delete}
            </Button>
          </li>
        ))}
      </ul>

      {showForm ? (
        <form
          onSubmit={handleCreate}
          className="max-w-lg space-y-3 rounded-lg border border-atg-border p-4 dark:border-atg-border"
        >
          <select
            value={form.type}
            onChange={(e) =>
              setForm((f) => ({ ...f, type: e.target.value as UserPaymentMethodType }))
            }
            className="w-full rounded-lg border border-atg-border bg-atg-elevated px-3 py-2 text-sm dark:border-atg-border dark:bg-atg-elevated dark:text-white"
          >
            <option value="card">{t.account.paymentMethods.typeCard}</option>
            <option value="paypal">{t.account.paymentMethods.typePaypal}</option>
            <option value="other">{t.account.paymentMethods.typeOther}</option>
          </select>
          <Input
            placeholder={t.account.paymentMethods.provider}
            value={form.provider}
            onChange={(e) => setForm((f) => ({ ...f, provider: e.target.value }))}
          />
          <Input
            placeholder={t.account.paymentMethods.lastFour}
            value={form.lastFour}
            onChange={(e) => setForm((f) => ({ ...f, lastFour: e.target.value }))}
            maxLength={4}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
            />
            {t.account.paymentMethods.isDefault}
          </label>
          <div className="flex gap-2">
            <Button type="submit" loading={saving} loadingText={t.account.paymentMethods.saving}>
              {t.account.paymentMethods.add}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              {t.account.paymentMethods.cancel}
            </Button>
          </div>
        </form>
      ) : (
        <Button type="button" onClick={() => setShowForm(true)}>
          {t.account.paymentMethods.addNew}
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

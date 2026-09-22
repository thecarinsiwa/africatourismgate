'use client';

import { Button, Input, Modal, Spinner } from '@africatourismgate/ui';
import type { UserPaymentMethod, UserPaymentMethodType } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { getAccountApiClient } from '../../lib/api/account';

const emptyForm = {
  type: 'card' as UserPaymentMethodType,
  provider: '',
  lastFour: '',
  isDefault: false,
};

function methodLabel(method: UserPaymentMethod): string {
  const parts: string[] = [method.type];
  if (method.provider) parts.push(method.provider);
  if (method.lastFour) parts.push(`•••• ${method.lastFour}`);
  return parts.join(' — ');
}

export function AccountPaymentMethodsPanel() {
  const t = useTranslations('account');
  const [methods, setMethods] = useState<UserPaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UserPaymentMethod | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const client = await getAccountApiClient();
      const result = await client.listUserPaymentMethods({ limit: 50 });
      setMethods(result.data);
    } catch {
      setError(t('paymentMethods.loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  function openModal() {
    setForm(emptyForm);
    setFormError(null);
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;
    setModalOpen(false);
    setFormError(null);
  }

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      const client = await getAccountApiClient();
      await client.createUserPaymentMethod({
        type: form.type,
        provider: form.provider || undefined,
        lastFour: form.lastFour || undefined,
        isDefault: form.isDefault,
      });
      setForm(emptyForm);
      setModalOpen(false);
      await load();
    } catch {
      setFormError(t('paymentMethods.saveError'));
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
      await client.deleteUserPaymentMethod(deleteTarget.id);
      setDeleteTarget(null);
      await load();
    } catch {
      setError(t('paymentMethods.deleteError'));
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
      {methods.length === 0 ? (
        <p className="text-sm text-atg-muted">{t('paymentMethods.empty')}</p>
      ) : null}

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
              {method.lastFour ? (
                <p className="text-sm text-atg-muted">•••• {method.lastFour}</p>
              ) : null}
              {method.isDefault === 1 ? (
                <span className="mt-1 inline-block text-xs font-medium text-primary">
                  {t('paymentMethods.defaultBadge')}
                </span>
              ) : null}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteTarget(method)}
            >
              {t('paymentMethods.delete')}
            </Button>
          </li>
        ))}
      </ul>

      <Button type="button" onClick={openModal}>
        {t('paymentMethods.addNew')}
      </Button>

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      <Modal
        open={modalOpen}
        onOpenChange={(open) => {
          if (!open) closeModal();
          else setModalOpen(true);
        }}
        title={t('paymentMethods.addNew')}
        showClose
        closeAriaLabel={t('paymentMethods.cancel')}
        className="max-w-md"
      >
        <form onSubmit={(event) => void handleCreate(event)} className="space-y-4">
          <div>
            <label
              htmlFor="payment-method-type"
              className="mb-1 block text-sm font-medium text-atg-fg"
            >
              {t('paymentMethods.typeLabel')}
            </label>
            <select
              id="payment-method-type"
              value={form.type}
              onChange={(e) =>
                setForm((f) => ({ ...f, type: e.target.value as UserPaymentMethodType }))
              }
              className="w-full rounded-lg border border-atg-border bg-atg-elevated px-3 py-2 text-sm text-atg-fg dark:border-atg-border dark:bg-atg-elevated dark:text-white"
            >
              <option value="card">{t('paymentMethods.typeCard')}</option>
              <option value="paypal">{t('paymentMethods.typePaypal')}</option>
              <option value="other">{t('paymentMethods.typeOther')}</option>
            </select>
          </div>

          <Input
            id="payment-method-provider"
            label={t('paymentMethods.provider')}
            placeholder={t('paymentMethods.provider')}
            value={form.provider}
            onChange={(e) => setForm((f) => ({ ...f, provider: e.target.value }))}
          />

          <Input
            id="payment-method-last-four"
            label={t('paymentMethods.lastFour')}
            placeholder={t('paymentMethods.lastFour')}
            value={form.lastFour}
            onChange={(e) => setForm((f) => ({ ...f, lastFour: e.target.value }))}
            maxLength={4}
            inputMode="numeric"
          />

          <label className="flex min-h-10 items-center gap-2 text-sm text-atg-fg">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
              className="h-4 w-4 rounded border-atg-border text-primary"
            />
            {t('paymentMethods.isDefault')}
          </label>

          {formError ? (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {formError}
            </p>
          ) : null}

          <div className="flex flex-wrap justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={closeModal}
            >
              {t('paymentMethods.cancel')}
            </Button>
            <Button
              type="submit"
              loading={saving}
              loadingText={t('paymentMethods.saving')}
            >
              {t('paymentMethods.add')}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={deleteTarget != null}
        onOpenChange={(open) => {
          if (!open && !deleting) setDeleteTarget(null);
        }}
        title={t('paymentMethods.deleteTitle')}
        showClose={!deleting}
        closeAriaLabel={t('paymentMethods.cancel')}
        className="max-w-sm"
      >
        <p className="text-sm text-atg-muted">
          {t('paymentMethods.deleteConfirm')}
          {deleteTarget ? (
            <>
              {' '}
              <span className="font-medium capitalize text-atg-fg">
                ({methodLabel(deleteTarget)})
              </span>
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
            {t('paymentMethods.no')}
          </Button>
          <Button
            type="button"
            disabled={deleting}
            loading={deleting}
            loadingText={t('paymentMethods.deleting')}
            onClick={() => void confirmDelete()}
            className="border-red-600 bg-red-600 text-white hover:border-red-700 hover:bg-red-700"
          >
            {t('paymentMethods.yes')}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

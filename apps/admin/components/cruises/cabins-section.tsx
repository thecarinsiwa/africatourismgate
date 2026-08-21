'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  AlertDialog,
  Button,
  Card,
  DataTableActionButton,
  DataTableActions,
  Input,
} from '@africatourismgate/ui';
import type { Cabin } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';

import { getApiClient } from '../../lib/auth/api';

type FormValues = {
  categoryName: string;
  maxGuests: string;
  basePriceCents: string;
  currency: string;
};
const emptyForm: FormValues = {
  categoryName: '',
  maxGuests: '',
  basePriceCents: '',
  currency: 'USD',
};

function formatPrice(cents: number, currency: string): string {
  return `${(cents / 100).toFixed(2)} ${currency}`;
}

type CabinsSectionProps = { shipId: string; embedded?: boolean };

export function CabinsSection({ shipId, embedded = false }: CabinsSectionProps) {
  const { croisieres: getCroisieresErrorMessage } = useAdminErrorMessages();
  const tSection = useTranslations('modules.cruises.sections.cabins');
  const tForm = useTranslations('modules.cruises.form.cabin');
  const tCommon = useTranslations('modules.common');
  const tActions = useTranslations('common.actions');
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; cabins: Cabin[] }
  >({ status: 'loading' });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Cabin | null>(null);
  const [formValues, setFormValues] = useState<FormValues>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<Cabin | null>(null);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listCabins({ shipId, page: 1, limit: 100 });
      setState({ status: 'ready', cabins: result.data });
    } catch (error) {
      setState({ status: 'error', message: getCroisieresErrorMessage(error) });
    }
  }, [shipId, getCroisieresErrorMessage]);

  useEffect(() => {
    void load();
  }, [load]);

  function resetForm() {
    setFormValues(emptyForm);
    setEditing(null);
    setShowForm(false);
    setFormError(null);
  }

  function openEdit(cabin: Cabin) {
    setEditing(cabin);
    setFormValues({
      categoryName: cabin.categoryName,
      maxGuests: String(cabin.maxGuests),
      basePriceCents: String(cabin.basePriceCents),
      currency: cabin.currency,
    });
    setShowForm(true);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    const guests = Number(formValues.maxGuests);
    const cents = Number(formValues.basePriceCents);
    if (!formValues.categoryName.trim() || !Number.isFinite(guests) || guests < 1) {
      setFormError(tForm('validationCategory'));
      return;
    }
    if (!Number.isFinite(cents) || cents < 0) {
      setFormError(tForm('validationPrice'));
      return;
    }
    setSubmitting(true);
    try {
      const body = {
        categoryName: formValues.categoryName.trim(),
        maxGuests: guests,
        basePriceCents: cents,
        currency: formValues.currency.trim().toUpperCase() || 'USD',
      };
      if (editing) {
        await getApiClient().updateCabin(editing.id, body);
      } else {
        await getApiClient().createCabin({ shipId, ...body });
      }
      resetForm();
      await load();
    } catch (error) {
      setFormError(getCroisieresErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  const handleDeleteRequest = useCallback((cabin: Cabin) => {
    setConfirmTarget(cabin);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!confirmTarget) return;
    const cabin = confirmTarget;
    setConfirmTarget(null);
    setDeletingId(cabin.id);
    try {
      await getApiClient().deleteCabin(cabin.id);
      await load();
    } catch (error) {
      setFormError(getCroisieresErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  }, [confirmTarget, getCroisieresErrorMessage, load]);

  const cabins = state.status === 'ready' ? state.cabins : [];

  return (
    <>
      <AlertDialog
        open={!!confirmTarget}
        onOpenChange={(open) => { if (!open) setConfirmTarget(null); }}
        title={tForm('deleteTitle')}
        description={tForm('deleteConfirm')}
        confirmLabel={tForm('deleteConfirmButton')}
        cancelLabel={tForm('cancel')}
        variant="danger"
        loading={!!deletingId}
        onConfirm={() => void handleDeleteConfirm()}
      />
    <section
      className={
        embedded
          ? 'space-y-6'
          : 'mt-12 space-y-6 border-t border-atg-border pt-10'
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {embedded ? null : (
            <h2 className="text-lg font-semibold text-atg-fg">{tSection('title')}</h2>
          )}
          <p className={embedded ? 'text-sm text-atg-muted' : 'mt-1 text-sm text-atg-muted'}>
            {tSection('intro')}
          </p>
        </div>
        {!showForm ? (
          <Button type="button" onClick={() => setShowForm(true)}>
            {tSection('addCabin')}
          </Button>
        ) : null}
      </div>

      {showForm ? (
        <Card variant="dashboard" className="max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-sm font-medium">
              {editing ? tForm('edit') : tForm('new')}
            </h3>
            {formError ? (
              <p role="alert" className="text-sm text-red-600">
                {formError}
              </p>
            ) : null}
            <Input
              label={tForm('category')}
              value={formValues.categoryName}
              onChange={(e) =>
                setFormValues((p) => ({ ...p, categoryName: e.target.value }))
              }
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label={tForm('maxGuests')}
                type="number"
                min={1}
                value={formValues.maxGuests}
                onChange={(e) =>
                  setFormValues((p) => ({ ...p, maxGuests: e.target.value }))
                }
              />
              <Input
                label={tCommon('form.basePriceCents')}
                type="number"
                min={0}
                value={formValues.basePriceCents}
                onChange={(e) =>
                  setFormValues((p) => ({ ...p, basePriceCents: e.target.value }))
                }
              />
            </div>
            <Input
              label={tCommon('form.currency')}
              value={formValues.currency}
              onChange={(e) => setFormValues((p) => ({ ...p, currency: e.target.value }))}
              maxLength={3}
            />
            <div className="flex gap-3">
              <Button type="submit" loading={submitting}>
                {editing ? tActions('save') : tActions('create')}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                {tActions('cancel')}
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      {state.status === 'error' ? (
        <p role="alert" className="text-sm text-red-600">
          {state.message}
        </p>
      ) : state.status === 'loading' ? (
        <p className="text-sm text-atg-muted">{tCommon('loading')}</p>
      ) : cabins.length === 0 ? (
        <Card variant="dashboard" className="py-12 text-center">
          <p className="text-sm text-atg-muted">{tForm('empty')}</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {cabins.map((cabin) => (
            <Card key={cabin.id} variant="dashboard" className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-atg-fg">{cabin.categoryName}</h3>
                  <p className="mt-1 text-lg tabular-nums text-atg-fg">
                    {formatPrice(cabin.basePriceCents, cabin.currency)}
                  </p>
                </div>
                <DataTableActions>
                  <DataTableActionButton action="edit" onClick={() => openEdit(cabin)} />
                  <DataTableActionButton
                    action="delete"
                    onClick={() => handleDeleteRequest(cabin)}
                    disabled={deletingId === cabin.id}
                    loading={deletingId === cabin.id}
                  />
                </DataTableActions>
              </div>
              <div className="mt-auto border-t border-atg-border pt-3">
                <p className="text-sm text-atg-muted">
                  {tCommon('maxGuests', { count: cabin.maxGuests })}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
    </>
  );
}

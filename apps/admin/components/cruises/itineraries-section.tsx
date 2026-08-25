'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  AlertDialog,
  Button,
  Card,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  Input,
  Modal,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { Itinerary } from '@africatourismgate/types';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { withApiClient } from '../../lib/auth/api';

type FormValues = { name: string; durationNights: string };
const emptyForm: FormValues = { name: '', durationNights: '' };

type ItinerariesSectionProps = { shipId: string; embedded?: boolean };

export function ItinerariesSection({ shipId, embedded = false }: ItinerariesSectionProps) {
  const { croisieres: getCroisieresErrorMessage } = useAdminErrorMessages();
  const tSection = useTranslations('modules.cruises.sections.itineraries');
  const tForm = useTranslations('modules.cruises.form.itinerary');
  const tColumns = useTranslations('modules.cruises.columns');
  const tCommonColumns = useTranslations('modules.common.columns');
  const tActions = useTranslations('common.actions');
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; itineraries: Itinerary[] }
  >({ status: 'loading' });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Itinerary | null>(null);
  const [formValues, setFormValues] = useState<FormValues>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<Itinerary | null>(null);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await withApiClient((client) =>
        client.listItineraries({
          shipId,
          page: 1,
          limit: 100,
        }),
      );
      setState({ status: 'ready', itineraries: result.data });
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

  function openCreate() {
    setEditing(null);
    setFormValues(emptyForm);
    setFormError(null);
    setShowForm(true);
  }

  function openEdit(itinerary: Itinerary) {
    setEditing(itinerary);
    setFormValues({
      name: itinerary.name,
      durationNights: String(itinerary.durationNights),
    });
    setFormError(null);
    setShowForm(true);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    const nights = Number(formValues.durationNights);
    if (!formValues.name.trim() || !Number.isFinite(nights) || nights < 1) {
      setFormError(tForm('validation'));
      return;
    }
    setSubmitting(true);
    try {
      const body = { name: formValues.name.trim(), durationNights: nights };
      await withApiClient((client) =>
        editing
          ? client.updateItinerary(editing.id, body)
          : client.createItinerary({ shipId, ...body }),
      );
      resetForm();
      await load();
    } catch (error) {
      setFormError(getCroisieresErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  const handleDeleteRequest = useCallback((itinerary: Itinerary) => {
    setConfirmTarget(itinerary);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!confirmTarget) return;
    const itinerary = confirmTarget;
    setConfirmTarget(null);
    setDeletingId(itinerary.id);
    try {
      await withApiClient((client) => client.deleteItinerary(itinerary.id));
      await load();
    } catch (error) {
      setFormError(getCroisieresErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  }, [confirmTarget, getCroisieresErrorMessage, load]);

  const columns = useMemo<ColumnDef<Itinerary, unknown>[]>(
    () => [
      { accessorKey: 'name', header: tColumns('itinerary') },
      {
        accessorKey: 'durationNights',
        header: tColumns('nights'),
        meta: { align: 'center' },
      },
      {
        id: 'actions',
        header: tCommonColumns('actions'),
        meta: { align: 'right' },
        cell: ({ row }) => (
          <DataTableActions>
            <Link
              href={`/produits/croisieres/navires/${shipId}/itineraires/${row.original.id}`}
              className="inline-flex items-center rounded-md px-2 py-1 text-sm font-medium text-primary hover:underline"
            >
              {tSection('stopsLink')}
            </Link>
            <DataTableActionButton
              action="edit"
              onClick={() => openEdit(row.original)}
            />
            <DataTableActionButton
              action="delete"
              onClick={() => handleDeleteRequest(row.original)}
              disabled={deletingId === row.original.id}
              loading={deletingId === row.original.id}
            />
          </DataTableActions>
        ),
      },
    ],
    [deletingId, handleDeleteRequest, shipId, tColumns, tCommonColumns, tSection],
  );

  const itineraries = state.status === 'ready' ? state.itineraries : [];

  return (
    <>
      <AlertDialog
        open={!!confirmTarget}
        onOpenChange={(open) => {
          if (!open) setConfirmTarget(null);
        }}
        title={tForm('deleteTitle')}
        description={tForm('deleteConfirm')}
        confirmLabel={tForm('deleteConfirmButton')}
        cancelLabel={tForm('cancel')}
        variant="danger"
        loading={!!deletingId}
        onConfirm={() => void handleDeleteConfirm()}
      />

      <Modal
        open={showForm}
        onOpenChange={(open) => {
          if (!open && !submitting) resetForm();
        }}
        title={editing ? tForm('edit') : tForm('new')}
        showClose={!submitting}
        closeAriaLabel={tActions('close')}
        className="max-w-lg"
      >
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          {formError ? (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {formError}
            </p>
          ) : null}
          <Input
            label={tCommonColumns('name')}
            value={formValues.name}
            onChange={(e) => setFormValues((p) => ({ ...p, name: e.target.value }))}
            disabled={submitting}
            required
          />
          <Input
            label={tForm('durationNights')}
            type="number"
            min={1}
            value={formValues.durationNights}
            onChange={(e) =>
              setFormValues((p) => ({ ...p, durationNights: e.target.value }))
            }
            disabled={submitting}
            required
          />
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              disabled={submitting}
            >
              {tActions('cancel')}
            </Button>
            <Button type="submit" loading={submitting}>
              {editing ? tActions('save') : tActions('create')}
            </Button>
          </div>
        </form>
      </Modal>

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
          <Button type="button" onClick={openCreate}>
            {tSection('addItinerary')}
          </Button>
        </div>

        {state.status === 'error' ? (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {state.message}
          </p>
        ) : (
          <Card variant="dashboard" padding="none">
            <DataTable
              columns={columns}
              data={itineraries}
              isLoading={state.status === 'loading'}
              emptyMessage={tForm('empty')}
              getRowId={(r) => r.id}
            />
          </Card>
        )}
      </section>
    </>
  );
}

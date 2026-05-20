'use client';

import {
  Button,
  Card,
  DataTable,
  Input,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { Room } from '@africatourismgate/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { getHebergementsErrorMessage } from '../../lib/hebergements-errors';

type RoomFormValues = {
  name: string;
  roomType: string;
  maxGuests: string;
  bedConfig: string;
  basePriceCents: string;
  currency: string;
};

const emptyForm: RoomFormValues = {
  name: '',
  roomType: '',
  maxGuests: '2',
  bedConfig: '',
  basePriceCents: '',
  currency: 'USD',
};

function formatPrice(cents: number, currency: string): string {
  return `${(cents / 100).toFixed(2)} ${currency}`;
}

type PropertyRoomsSectionProps = {
  propertyId: string;
};

export function PropertyRoomsSection({ propertyId }: PropertyRoomsSectionProps) {
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; rooms: Room[] }
  >({ status: 'loading' });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [formValues, setFormValues] = useState<RoomFormValues>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listRooms({
        propertyId,
        page: 1,
        limit: 100,
      });
      setState({ status: 'ready', rooms: result.data });
    } catch (error) {
      setState({ status: 'error', message: getHebergementsErrorMessage(error) });
    }
  }, [propertyId]);

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
    resetForm();
    setShowForm(true);
  }

  function openEdit(room: Room) {
    setEditing(room);
    setFormValues({
      name: room.name,
      roomType: room.roomType ?? '',
      maxGuests: String(room.maxGuests),
      bedConfig: room.bedConfig ?? '',
      basePriceCents: String(room.basePriceCents),
      currency: room.currency,
    });
    setShowForm(true);
  }

  function validate(): boolean {
    if (!formValues.name.trim()) {
      setFormError('Le nom est obligatoire.');
      return false;
    }
    const guests = Number(formValues.maxGuests);
    if (!Number.isFinite(guests) || guests < 1) {
      setFormError('Capacité invalide.');
      return false;
    }
    const cents = Number(formValues.basePriceCents);
    if (!Number.isFinite(cents) || cents < 0) {
      setFormError('Prix invalide (centimes).');
      return false;
    }
    if (formValues.currency.trim().length !== 3) {
      setFormError('Devise à 3 lettres (ex. USD).');
      return false;
    }
    return true;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      const body = {
        name: formValues.name.trim(),
        maxGuests: Number(formValues.maxGuests),
        basePriceCents: Number(formValues.basePriceCents),
        currency: formValues.currency.trim().toUpperCase(),
        ...(formValues.roomType.trim() ? { roomType: formValues.roomType.trim() } : {}),
        ...(formValues.bedConfig.trim() ? { bedConfig: formValues.bedConfig.trim() } : {}),
      };
      if (editing) {
        await getApiClient().updateRoom(editing.id, body);
      } else {
        await getApiClient().createRoom({ propertyId, ...body });
      }
      resetForm();
      await load();
    } catch (error) {
      setFormError(getHebergementsErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  const handleDelete = useCallback(
    async (room: Room) => {
      if (!window.confirm(`Supprimer la chambre « ${room.name} » ?`)) return;
      setDeletingId(room.id);
      try {
        await getApiClient().deleteRoom(room.id);
        await load();
      } catch (error) {
        setFormError(getHebergementsErrorMessage(error));
      } finally {
        setDeletingId(null);
      }
    },
    [load],
  );

  const columns = useMemo<ColumnDef<Room, unknown>[]>(
    () => [
      { accessorKey: 'name', header: 'Chambre' },
      {
        accessorKey: 'roomType',
        header: 'Type',
        cell: ({ row }) => row.original.roomType ?? '—',
      },
      {
        accessorKey: 'maxGuests',
        header: 'Capacité',
        meta: { align: 'center' },
      },
      {
        id: 'price',
        header: 'Prix de base',
        meta: { align: 'right' },
        cell: ({ row }) => (
          <span className="tabular-nums text-sm">
            {formatPrice(row.original.basePriceCents, row.original.currency)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        meta: { align: 'right' },
        cell: ({ row }) => (
          <div className="flex justify-end gap-1.5">
            <Button type="button" variant="ghost" size="sm" onClick={() => openEdit(row.original)}>
              Modifier
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => void handleDelete(row.original)}
              disabled={deletingId === row.original.id}
              loading={deletingId === row.original.id}
              className="!text-red-600"
            >
              Supprimer
            </Button>
          </div>
        ),
      },
    ],
    [deletingId, handleDelete],
  );

  const rooms = state.status === 'ready' ? state.rooms : [];

  return (
    <section className="mt-12 space-y-6 border-t border-atg-border pt-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-atg-fg">Chambres</h2>
          <p className="mt-1 text-sm text-atg-muted">Types de chambres pour cet hébergement.</p>
        </div>
        {!showForm ? (
          <Button type="button" onClick={openCreate}>
            Ajouter une chambre
          </Button>
        ) : null}
      </div>

      {showForm ? (
        <Card variant="dashboard" className="max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-sm font-medium">
              {editing ? 'Modifier la chambre' : 'Nouvelle chambre'}
            </h3>
            {formError ? (
              <p role="alert" className="text-sm text-red-600">
                {formError}
              </p>
            ) : null}
            <Input
              label="Nom"
              value={formValues.name}
              onChange={(e) => setFormValues((p) => ({ ...p, name: e.target.value }))}
              required
            />
            <Input
              label="Type de chambre"
              value={formValues.roomType}
              onChange={(e) => setFormValues((p) => ({ ...p, roomType: e.target.value }))}
              placeholder="standard, suite…"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Capacité max."
                type="number"
                min={1}
                value={formValues.maxGuests}
                onChange={(e) => setFormValues((p) => ({ ...p, maxGuests: e.target.value }))}
              />
              <Input
                label="Configuration lits"
                value={formValues.bedConfig}
                onChange={(e) => setFormValues((p) => ({ ...p, bedConfig: e.target.value }))}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Prix de base (centimes)"
                type="number"
                min={0}
                value={formValues.basePriceCents}
                onChange={(e) =>
                  setFormValues((p) => ({ ...p, basePriceCents: e.target.value }))
                }
                hint="Ex. 8500 = 85,00"
              />
              <Input
                label="Devise"
                maxLength={3}
                value={formValues.currency}
                onChange={(e) =>
                  setFormValues((p) => ({ ...p, currency: e.target.value.toUpperCase() }))
                }
              />
            </div>
            <div className="flex gap-3">
              <Button type="submit" loading={submitting}>
                {editing ? 'Enregistrer' : 'Ajouter'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Annuler
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      {state.status === 'error' ? (
        <p role="alert" className="text-sm text-red-600">
          {state.message}
        </p>
      ) : (
        <Card variant="dashboard" padding="none" className="overflow-hidden">
          <DataTable
            columns={columns}
            data={rooms}
            isLoading={state.status === 'loading'}
            emptyMessage="Aucune chambre."
            getRowId={(row) => row.id}
          />
        </Card>
      )}
    </section>
  );
}

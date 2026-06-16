'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  Button,
  Card,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  Input,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { Room } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { RoomImagesSection } from './room-images-section';

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
  embedded?: boolean;
};

export function PropertyRoomsSection({ propertyId, embedded }: PropertyRoomsSectionProps) {
  const { hebergements: getHebergementsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.properties.sections.rooms');
  const tColumns = useTranslations('modules.common.columns');
  const tForm = useTranslations('modules.common.form');
  const tValidation = useTranslations('modules.common.validation');
  const tActions = useTranslations('common.actions');
  const tLoading = useTranslations('common.loading');
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
  const [photosRoom, setPhotosRoom] = useState<Room | null>(null);

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
  }, [propertyId, getHebergementsErrorMessage]);

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
    setPhotosRoom(null);
    resetForm();
    setShowForm(true);
  }

  function openEdit(room: Room) {
    setPhotosRoom(null);
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
      setFormError(tValidation('nameRequired'));
      return false;
    }
    const guests = Number(formValues.maxGuests);
    if (!Number.isFinite(guests) || guests < 1) {
      setFormError(tValidation('invalidCapacity'));
      return false;
    }
    const cents = Number(formValues.basePriceCents);
    if (!Number.isFinite(cents) || cents < 0) {
      setFormError(tValidation('invalidPriceCents'));
      return false;
    }
    if (formValues.currency.trim().length !== 3) {
      setFormError(tValidation('currencyThreeLettersExample'));
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
      if (!window.confirm(t('deleteConfirm', { name: room.name }))) return;
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
    [load, t, getHebergementsErrorMessage],
  );

  const columns = useMemo<ColumnDef<Room, unknown>[]>(
    () => [
      { accessorKey: 'name', header: tColumns('name') },
      {
        accessorKey: 'roomType',
        header: tColumns('type'),
        cell: ({ row }) => row.original.roomType ?? '—',
      },
      {
        accessorKey: 'maxGuests',
        header: tColumns('capacity'),
        meta: { align: 'center' },
      },
      {
        id: 'price',
        header: tColumns('basePrice'),
        meta: { align: 'right' },
        cell: ({ row }) => (
          <span className="tabular-nums text-sm">
            {formatPrice(row.original.basePriceCents, row.original.currency)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: tColumns('actions'),
        meta: { align: 'right' },
        cell: ({ row }) => (
          <DataTableActions>
            <DataTableActionButton
              action="view"
              label={t('photosAction')}
              onClick={() => {
                setShowForm(false);
                setPhotosRoom(row.original);
              }}
            />
            <DataTableActionButton
              action="calendar"
              href={`/hebergements/${propertyId}/chambres/${row.original.id}/disponibilites`}
            />
            <DataTableActionButton action="edit" onClick={() => openEdit(row.original)} />
            <DataTableActionButton
              action="delete"
              onClick={() => void handleDelete(row.original)}
              disabled={deletingId === row.original.id}
              loading={deletingId === row.original.id}
            />
          </DataTableActions>
        ),
      },
    ],
    [deletingId, handleDelete, propertyId, t, tColumns],
  );

  const rooms = state.status === 'ready' ? state.rooms : [];

  return (
    <section
      className={
        embedded ? 'space-y-6' : 'mt-12 space-y-6 border-t border-atg-border pt-10'
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-atg-fg">{t('title')}</h2>
          <p className="mt-1 text-sm text-atg-muted">{t('intro')}</p>
        </div>
        {!showForm ? (
          <Button type="button" onClick={openCreate}>
            {t('addRoom')}
          </Button>
        ) : null}
      </div>

      {showForm ? (
        <Card variant="dashboard" className="max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-sm font-medium">
              {editing ? t('editRoom') : t('newRoom')}
            </h3>
            {formError ? (
              <p role="alert" className="text-sm text-red-600">
                {formError}
              </p>
            ) : null}
            <Input
              label={tColumns('name')}
              value={formValues.name}
              onChange={(e) => setFormValues((p) => ({ ...p, name: e.target.value }))}
              required
            />
            <Input
              label={t('roomType')}
              value={formValues.roomType}
              onChange={(e) => setFormValues((p) => ({ ...p, roomType: e.target.value }))}
              placeholder={t('roomTypePlaceholder')}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label={t('maxCapacity')}
                type="number"
                min={1}
                value={formValues.maxGuests}
                onChange={(e) => setFormValues((p) => ({ ...p, maxGuests: e.target.value }))}
              />
              <Input
                label={t('bedConfig')}
                value={formValues.bedConfig}
                onChange={(e) => setFormValues((p) => ({ ...p, bedConfig: e.target.value }))}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label={tForm('basePriceCents')}
                type="number"
                min={0}
                value={formValues.basePriceCents}
                onChange={(e) =>
                  setFormValues((p) => ({ ...p, basePriceCents: e.target.value }))
                }
                hint={tForm('centsHint')}
              />
              <Input
                label={tForm('currency')}
                maxLength={3}
                value={formValues.currency}
                onChange={(e) =>
                  setFormValues((p) => ({ ...p, currency: e.target.value.toUpperCase() }))
                }
              />
            </div>
            <div className="flex gap-3">
              <Button type="submit" loading={submitting} loadingText={tLoading('submit')}>
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
      ) : (
        <Card variant="dashboard" padding="none" className="overflow-hidden">
          <DataTable
            columns={columns}
            data={rooms}
            isLoading={state.status === 'loading'}
            emptyMessage={t('empty')}
            getRowId={(row) => row.id}
          />
        </Card>
      )}

      {photosRoom ? (
        <RoomImagesSection
          roomId={photosRoom.id}
          roomName={photosRoom.name}
          onClose={() => setPhotosRoom(null)}
        />
      ) : null}
    </section>
  );
}

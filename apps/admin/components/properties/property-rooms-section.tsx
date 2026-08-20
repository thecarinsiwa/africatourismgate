'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  AlertDialog,
  Button,
  Card,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  DataTableBadge,
  Input,
  Modal,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { Room } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { formatMoney } from '../../lib/format-money';
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
  const tCommon = useTranslations('modules.common');
  const tActions = useTranslations('common.actions');
  const tLoading = useTranslations('common.loading');
  const emptyDash = tCommon('empty.dash');
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; rooms: Room[] }
  >({ status: 'loading' });
  const [roomSearch, setRoomSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [formValues, setFormValues] = useState<RoomFormValues>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<Room | null>(null);
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
    setFormValues(emptyForm);
    setEditing(null);
    setFormError(null);
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
    setFormError(null);
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

  const handleDeleteRequest = useCallback((room: Room) => {
    setConfirmTarget(room);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!confirmTarget) return;
    const room = confirmTarget;
    setConfirmTarget(null);
    setDeleteError(null);
    setDeletingId(room.id);
    try {
      await getApiClient().deleteRoom(room.id);
      await load();
    } catch (error) {
      setDeleteError(getHebergementsErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  }, [confirmTarget, load, getHebergementsErrorMessage]);

  const columns = useMemo<ColumnDef<Room, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: tColumns('name'),
        cell: ({ row }) => {
          const bedConfig = row.original.bedConfig?.trim();
          return (
            <div className="min-w-0">
              <p className="truncate font-medium text-atg-fg">{row.original.name}</p>
              {bedConfig ? (
                <p className="mt-0.5 truncate text-xs text-atg-muted">{bedConfig}</p>
              ) : null}
            </div>
          );
        },
      },
      {
        id: 'roomType',
        header: t('roomType'),
        meta: { hideOnMobile: true },
        cell: ({ row }) => {
          const roomType = row.original.roomType?.trim();
          if (!roomType) {
            return <span className="text-sm text-atg-muted">{emptyDash}</span>;
          }
          return <DataTableBadge variant="muted">{roomType}</DataTableBadge>;
        },
      },
      {
        id: 'maxGuests',
        header: t('maxCapacity'),
        meta: { align: 'center', hideOnMobile: true },
        cell: ({ row }) => (
          <span className="inline-flex items-center justify-center rounded-md bg-atg-surface px-2 py-0.5 text-xs font-medium tabular-nums text-atg-fg">
            {tCommon('maxGuests', { count: row.original.maxGuests })}
          </span>
        ),
      },
      {
        id: 'price',
        header: tColumns('basePrice'),
        meta: { align: 'right' },
        cell: ({ row }) => (
          <div className="text-right">
            <p className="tabular-nums text-sm font-semibold text-atg-fg">
              {formatMoney(row.original.basePriceCents, row.original.currency)}
            </p>
            <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-atg-muted">
              {row.original.currency}
            </p>
          </div>
        ),
      },
      {
        id: 'actions',
        header: tColumns('actions'),
        meta: { align: 'right' },
        cell: ({ row }) => (
          <DataTableActions className="opacity-90 transition-opacity group-hover:opacity-100">
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
              onClick={() => handleDeleteRequest(row.original)}
              disabled={deletingId === row.original.id}
              loading={deletingId === row.original.id}
            />
          </DataTableActions>
        ),
      },
    ],
    [deletingId, emptyDash, handleDeleteRequest, propertyId, t, tColumns, tCommon],
  );

  const rooms = state.status === 'ready' ? state.rooms : [];
  const hasRoomSearch = roomSearch.trim().length > 0;

  const filteredRooms = useMemo(() => {
    const query = roomSearch.trim().toLowerCase();
    const sorted = [...rooms].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
    );
    if (!query) return sorted;

    return sorted.filter((room) => {
      const haystack = [
        room.name,
        room.roomType,
        room.bedConfig,
        room.currency,
        String(room.maxGuests),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [rooms, roomSearch]);

  return (
    <>
      <AlertDialog
        open={!!confirmTarget}
        onOpenChange={(open) => {
          if (!open) setConfirmTarget(null);
        }}
        title={t('deleteTitle')}
        description={confirmTarget ? t('deleteConfirm', { name: confirmTarget.name }) : ''}
        confirmLabel={t('deleteConfirmButton')}
        cancelLabel={t('cancel')}
        variant="danger"
        loading={!!deletingId}
        error={deleteError}
        onConfirm={() => void handleDeleteConfirm()}
      />

      <Modal
        open={showForm}
        onOpenChange={(open) => {
          if (!open && !submitting) resetForm();
        }}
        title={editing ? t('editRoom') : t('newRoom')}
        showClose={!submitting}
        closeAriaLabel={tActions('close')}
        className="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError ? (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
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
          <div className="grid gap-3 sm:grid-cols-2">
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
          <div className="grid gap-3 sm:grid-cols-2">
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
          <div className="flex gap-3 pt-1">
            <Button type="submit" loading={submitting} loadingText={tLoading('submit')}>
              {editing ? tActions('save') : tActions('create')}
            </Button>
            <Button type="button" variant="outline" onClick={resetForm} disabled={submitting}>
              {tActions('cancel')}
            </Button>
          </div>
        </form>
      </Modal>

      <section
        className={
          embedded ? 'space-y-4' : 'mt-12 space-y-4 border-t border-atg-border pt-10'
        }
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-atg-fg">{t('title')}</h2>
              {state.status === 'ready' ? (
                <DataTableBadge variant="muted">
                  {hasRoomSearch ? `${filteredRooms.length}/${rooms.length}` : rooms.length}
                </DataTableBadge>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-atg-muted">{t('intro')}</p>
          </div>
          <Button type="button" onClick={openCreate} size="sm">
            {t('addRoom')}
          </Button>
        </div>

        {state.status === 'ready' && rooms.length > 0 ? (
          <div className="max-w-md">
            <Input
              type="search"
              placeholder={t('searchPlaceholder')}
              value={roomSearch}
              onChange={(e) => setRoomSearch(e.target.value)}
              aria-label={t('searchPlaceholder')}
            />
          </div>
        ) : null}

        {state.status === 'error' ? (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {state.message}
          </p>
        ) : (
          <Card variant="dashboard" padding="none" className="overflow-hidden">
            <DataTable
              columns={columns}
              data={filteredRooms}
              isLoading={state.status === 'loading'}
              emptyMessage={hasRoomSearch ? t('searchEmpty') : t('empty')}
              emptyVariant={hasRoomSearch ? 'search' : 'default'}
              getRowId={(row) => row.id}
              aria-label={t('title')}
              loadingMessage={tCommon('dataTable.loading')}
              expandRowLabel={tCommon('dataTable.expandRow')}
              collapseRowLabel={tCommon('dataTable.collapseRow')}
              expandRowAriaLabel={tCommon('dataTable.expandRowAria')}
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
    </>
  );
}

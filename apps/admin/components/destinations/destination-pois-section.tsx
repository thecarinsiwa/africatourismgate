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
import type { PointOfInterest } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { parseDestinationCoord } from '../../lib/destination-coords';
import { CoordinatePickerMap } from '../maps/coordinate-picker-map';

type PoiFormValues = {
  name: string;
  latitude: string;
  longitude: string;
};

const emptyPoiForm: PoiFormValues = {
  name: '',
  latitude: '',
  longitude: '',
};

function parseCoord(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const num = Number(trimmed);
  return Number.isFinite(num) ? num : undefined;
}

type DestinationPoisSectionProps = {
  destinationId: string;
  embedded?: boolean;
  /** Center the picker on the destination when POI coords are empty. */
  mapDefaultLatitude?: string | number | null;
  mapDefaultLongitude?: string | number | null;
};

export function DestinationPoisSection({
  destinationId,
  embedded = false,
  mapDefaultLatitude,
  mapDefaultLongitude,
}: DestinationPoisSectionProps) {
  const { destinations: getDestinationsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.destinations.sections.pois');
  const tForm = useTranslations('modules.destinations.form');
  const tCommon = useTranslations('modules.common');
  const tActions = useTranslations('common.actions');
  const tLoading = useTranslations('common.loading');
  const emptyDash = tCommon('empty.dash');
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; pois: PointOfInterest[] }
  >({ status: 'loading' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPoi, setEditingPoi] = useState<PointOfInterest | null>(null);
  const [formValues, setFormValues] = useState<PoiFormValues>(emptyPoiForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof PoiFormValues, string>>>(
    {},
  );
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<PointOfInterest | null>(null);

  const formatCoord = useCallback(
    (value: string | null): string => {
      if (value === null || value === '') return emptyDash;
      const num = Number(value);
      return Number.isFinite(num) ? num.toFixed(5) : value;
    },
    [emptyDash],
  );

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listPointsOfInterest({
        destinationId,
        page: 1,
        limit: 100,
      });
      setState({ status: 'ready', pois: result.data });
      setListError(null);
    } catch (error) {
      setState({ status: 'error', message: getDestinationsErrorMessage(error) });
    }
  }, [destinationId, getDestinationsErrorMessage]);

  useEffect(() => {
    void load();
  }, [load]);

  const resetForm = useCallback(() => {
    setFormValues(emptyPoiForm);
    setFieldErrors({});
    setFormError(null);
    setEditingPoi(null);
    setModalOpen(false);
  }, []);

  const openCreateForm = useCallback(() => {
    setEditingPoi(null);
    setFormValues(emptyPoiForm);
    setFieldErrors({});
    setFormError(null);
    setModalOpen(true);
  }, []);

  const openEditForm = useCallback((poi: PointOfInterest) => {
    setEditingPoi(poi);
    setFormValues({
      name: poi.name,
      latitude: poi.latitude ?? '',
      longitude: poi.longitude ?? '',
    });
    setFieldErrors({});
    setFormError(null);
    setModalOpen(true);
  }, []);

  function validatePoiForm(): boolean {
    const errors: Partial<Record<keyof PoiFormValues, string>> = {};
    if (!formValues.name.trim()) {
      errors.name = tCommon('validation.nameRequired');
    }
    const lat = parseCoord(formValues.latitude);
    const lng = parseCoord(formValues.longitude);
    if (formValues.latitude.trim() && lat === undefined) {
      errors.latitude = tCommon('validation.latitudeInvalid');
    } else if (lat !== undefined && (lat < -90 || lat > 90)) {
      errors.latitude = tCommon('validation.latitudeOutOfRange');
    }
    if (formValues.longitude.trim() && lng === undefined) {
      errors.longitude = tCommon('validation.longitudeInvalid');
    } else if (lng !== undefined && (lng < -180 || lng > 180)) {
      errors.longitude = tCommon('validation.longitudeOutOfRange');
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmitPoi(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (!validatePoiForm()) return;

    setSubmitting(true);
    try {
      const client = getApiClient();
      const latitude = parseCoord(formValues.latitude);
      const longitude = parseCoord(formValues.longitude);
      const body = {
        name: formValues.name.trim(),
        ...(latitude !== undefined ? { latitude } : {}),
        ...(longitude !== undefined ? { longitude } : {}),
      };

      if (editingPoi) {
        await client.updatePointOfInterest(editingPoi.id, body);
      } else {
        await client.createPointOfInterest({
          destinationId,
          ...body,
        });
      }
      resetForm();
      await load();
    } catch (error) {
      setFormError(getDestinationsErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  const handleCoordinatePick = useCallback((latitude: string, longitude: string) => {
    setFormValues((prev) => ({ ...prev, latitude, longitude }));
    setFieldErrors((prev) => ({ ...prev, latitude: undefined, longitude: undefined }));
  }, []);

  const mapDefaultCenter = useMemo(() => {
    const latitude = parseDestinationCoord(mapDefaultLatitude) ?? 0;
    const longitude = parseDestinationCoord(mapDefaultLongitude) ?? 20;
    return { latitude, longitude };
  }, [mapDefaultLatitude, mapDefaultLongitude]);

  const handleDeleteRequest = useCallback((poi: PointOfInterest) => {
    setConfirmTarget(poi);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!confirmTarget) return;
    const poi = confirmTarget;
    setConfirmTarget(null);
    setDeletingId(poi.id);
    try {
      await getApiClient().deletePointOfInterest(poi.id);
      await load();
    } catch (error) {
      setListError(getDestinationsErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  }, [confirmTarget, getDestinationsErrorMessage, load]);

  const columns = useMemo<ColumnDef<PointOfInterest, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: tCommon('columns.name'),
        cell: ({ row }) => (
          <span className="font-medium text-atg-fg">{row.original.name}</span>
        ),
      },
      {
        id: 'latitude',
        header: tCommon('form.latitude'),
        meta: { align: 'right' },
        cell: ({ row }) => (
          <span className="font-mono text-xs tabular-nums text-atg-muted">
            {formatCoord(row.original.latitude)}
          </span>
        ),
      },
      {
        id: 'longitude',
        header: tCommon('form.longitude'),
        meta: { align: 'right' },
        cell: ({ row }) => (
          <span className="font-mono text-xs tabular-nums text-atg-muted">
            {formatCoord(row.original.longitude)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: tCommon('columns.actions'),
        meta: { align: 'right' },
        cell: ({ row }) => {
          const poi = row.original;
          return (
            <DataTableActions>
              <DataTableActionButton action="edit" onClick={() => openEditForm(poi)} />
              <DataTableActionButton
                action="delete"
                onClick={() => handleDeleteRequest(poi)}
                disabled={deletingId === poi.id}
                loading={deletingId === poi.id}
              />
            </DataTableActions>
          );
        },
      },
    ],
    [deletingId, formatCoord, handleDeleteRequest, openEditForm, tCommon],
  );

  const pois = state.status === 'ready' ? state.pois : [];

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
        onConfirm={() => void handleDeleteConfirm()}
      />

      <Modal
        open={modalOpen}
        onOpenChange={(open) => {
          if (!open && !submitting) resetForm();
        }}
        title={editingPoi ? t('edit') : t('new')}
        showClose={!submitting}
        closeAriaLabel={tActions('close')}
        className="max-w-2xl"
      >
        <form onSubmit={(e) => void handleSubmitPoi(e)} className="space-y-4">
          {formError ? (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {formError}
            </p>
          ) : null}
          <Input
            label={tCommon('columns.name')}
            name="poiName"
            value={formValues.name}
            onChange={(e) => {
              setFormValues((prev) => ({ ...prev, name: e.target.value }));
              setFieldErrors((prev) => ({ ...prev, name: undefined }));
            }}
            error={fieldErrors.name}
            required
            disabled={submitting}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={tCommon('form.latitude')}
              name="latitude"
              type="number"
              step="any"
              value={formValues.latitude}
              onChange={(e) => {
                setFormValues((prev) => ({ ...prev, latitude: e.target.value }));
                setFieldErrors((prev) => ({ ...prev, latitude: undefined }));
              }}
              placeholder="-4.3058"
              hint={tForm('latitudeHint')}
              error={fieldErrors.latitude}
              disabled={submitting}
            />
            <Input
              label={tCommon('form.longitude')}
              name="longitude"
              type="number"
              step="any"
              value={formValues.longitude}
              onChange={(e) => {
                setFormValues((prev) => ({ ...prev, longitude: e.target.value }));
                setFieldErrors((prev) => ({ ...prev, longitude: undefined }));
              }}
              placeholder="15.3000"
              hint={tForm('longitudeHint')}
              error={fieldErrors.longitude}
              disabled={submitting}
            />
          </div>
          <CoordinatePickerMap
            latitude={formValues.latitude}
            longitude={formValues.longitude}
            onCoordinateChange={handleCoordinatePick}
            defaultLatitude={mapDefaultCenter.latitude}
            defaultLongitude={mapDefaultCenter.longitude}
            title={t('mapPicker')}
            hint={t('mapPickerHint')}
            ariaLabel={t('mapPickerAria')}
            active={modalOpen}
          />
          <div className="flex flex-wrap gap-3 pt-2">
            <Button type="submit" loading={submitting} loadingText={tLoading('submit')}>
              {editingPoi ? tActions('save') : tActions('create')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              disabled={submitting}
            >
              {tActions('cancel')}
            </Button>
          </div>
        </form>
      </Modal>

      <section
        className={
          embedded ? 'space-y-6' : 'mt-12 space-y-6 border-t border-atg-border pt-10'
        }
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {embedded ? null : (
              <h2 className="text-lg font-semibold text-atg-fg">{t('title')}</h2>
            )}
            <p className={embedded ? 'text-sm text-atg-muted' : 'mt-1 text-sm text-atg-muted'}>
              {t('intro')}
            </p>
          </div>
          <Button type="button" onClick={openCreateForm}>
            {t('addPoi')}
          </Button>
        </div>

        {listError ? (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {listError}
          </p>
        ) : null}

        {state.status === 'error' ? (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {state.message}
          </p>
        ) : (
          <Card variant="dashboard" padding="none" className="overflow-hidden">
            <DataTable
              columns={columns}
              data={pois}
              isLoading={state.status === 'loading'}
              emptyMessage={t('empty')}
              getRowId={(row) => row.id}
              aria-label={t('ariaLabel')}
            />
          </Card>
        )}
      </section>
    </>
  );
}

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
  useToast,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { PointOfInterest } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import {
  hasValidDestinationCoords,
  parseDestinationCoord,
} from '../../lib/destination-coords';
import { CoordinatePickerMap } from '../maps/coordinate-picker-map';
import { DestinationStaticMap } from './destination-static-map';

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
  countryCode?: string | null;
  destinationName?: string;
  /** Center the picker on the destination when POI coords are empty. */
  mapDefaultLatitude?: string | number | null;
  mapDefaultLongitude?: string | number | null;
};

export function DestinationPoisSection({
  destinationId,
  embedded = false,
  countryCode,
  destinationName,
  mapDefaultLatitude,
  mapDefaultLongitude,
}: DestinationPoisSectionProps) {
  const { destinations: getDestinationsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.destinations.sections.pois');
  const tForm = useTranslations('modules.destinations.form');
  const tCommon = useTranslations('modules.common');
  const tActions = useTranslations('common.actions');
  const tLoading = useTranslations('common.loading');
  const { toast } = useToast();
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
  const [highlightedPoiId, setHighlightedPoiId] = useState<string | null>(null);

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
    if (hasValidDestinationCoords(poi.latitude, poi.longitude)) {
      setHighlightedPoiId(poi.id);
    }
  }, []);

  function validatePoiForm(): boolean {
    const errors: Partial<Record<keyof PoiFormValues, string>> = {};
    if (!formValues.name.trim()) {
      errors.name = tCommon('validation.nameRequired');
    }
    const hasLat = formValues.latitude.trim().length > 0;
    const hasLng = formValues.longitude.trim().length > 0;
    const lat = parseCoord(formValues.latitude);
    const lng = parseCoord(formValues.longitude);

    if (hasLat !== hasLng) {
      errors.latitude = tCommon('validation.coordsBothRequired');
      errors.longitude = tCommon('validation.coordsBothRequired');
    } else if (hasLat && lat === undefined) {
      errors.latitude = tCommon('validation.latitudeInvalid');
    } else if (lat !== undefined && (lat < -90 || lat > 90)) {
      errors.latitude = tCommon('validation.latitudeOutOfRange');
    }
    if (hasLng && lng === undefined) {
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
      const name = formValues.name.trim();

      if (editingPoi) {
        await client.updatePointOfInterest(editingPoi.id, {
          name,
          latitude: latitude ?? null,
          longitude: longitude ?? null,
        });
        toast({
          title: t('toastUpdatedTitle'),
          message: name,
          variant: 'success',
        });
      } else {
        await client.createPointOfInterest({
          destinationId,
          name,
          ...(latitude !== undefined ? { latitude } : {}),
          ...(longitude !== undefined ? { longitude } : {}),
        });
        toast({
          title: t('toastCreatedTitle'),
          message: name,
          variant: 'success',
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
      if (highlightedPoiId === poi.id) {
        setHighlightedPoiId(null);
      }
      toast({
        title: t('toastDeletedTitle'),
        message: poi.name,
        variant: 'success',
      });
      await load();
    } catch (error) {
      setListError(getDestinationsErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  }, [confirmTarget, getDestinationsErrorMessage, highlightedPoiId, load, t, toast]);

  const focusPoiOnMap = useCallback((poi: PointOfInterest) => {
    if (!hasValidDestinationCoords(poi.latitude, poi.longitude)) {
      toast({
        title: t('toastNoCoordsTitle'),
        message: t('toastNoCoordsMessage', { name: poi.name }),
        variant: 'info',
      });
      return;
    }
    setHighlightedPoiId(poi.id);
  }, [t, toast]);

  const columns = useMemo<ColumnDef<PointOfInterest, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: tCommon('columns.name'),
        cell: ({ row }) => {
          const poi = row.original;
          const isActive = highlightedPoiId === poi.id;
          return (
            <button
              type="button"
              onClick={() => focusPoiOnMap(poi)}
              className={
                isActive
                  ? 'text-left font-semibold text-primary'
                  : 'text-left font-medium text-atg-fg hover:text-primary'
              }
            >
              {poi.name}
            </button>
          );
        },
      },
      {
        id: 'location',
        header: t('columnLocation'),
        cell: ({ row }) => {
          const poi = row.original;
          const onMap = hasValidDestinationCoords(poi.latitude, poi.longitude);
          return onMap ? (
            <DataTableBadge variant="success">{t('statusOnMap')}</DataTableBadge>
          ) : (
            <DataTableBadge variant="muted">{t('statusNoCoords')}</DataTableBadge>
          );
        },
      },
      {
        id: 'latitude',
        header: tCommon('form.latitude'),
        meta: { align: 'right', hideOnMobile: true },
        cell: ({ row }) => (
          <span className="font-mono text-xs tabular-nums text-atg-muted">
            {formatCoord(row.original.latitude)}
          </span>
        ),
      },
      {
        id: 'longitude',
        header: tCommon('form.longitude'),
        meta: { align: 'right', hideOnMobile: true },
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
              <DataTableActionButton
                action="view"
                label={t('locateOnMap')}
                onClick={() => focusPoiOnMap(poi)}
                disabled={!hasValidDestinationCoords(poi.latitude, poi.longitude)}
              />
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
    [
      deletingId,
      focusPoiOnMap,
      formatCoord,
      handleDeleteRequest,
      highlightedPoiId,
      openEditForm,
      t,
      tCommon,
    ],
  );

  const pois = state.status === 'ready' ? state.pois : [];
  const poisOnMap = useMemo(
    () => pois.filter((poi) => hasValidDestinationCoords(poi.latitude, poi.longitude)),
    [pois],
  );
  const showOverviewMap =
    Boolean(countryCode) ||
    hasValidDestinationCoords(mapDefaultLatitude, mapDefaultLongitude) ||
    poisOnMap.length > 0;

  const contextPois = useMemo(
    () =>
      pois
        .filter((poi) => poi.id !== editingPoi?.id)
        .map((poi) => ({
          id: poi.id,
          name: poi.name,
          latitude: poi.latitude,
          longitude: poi.longitude,
        })),
    [pois, editingPoi?.id],
  );

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
        className="max-w-3xl"
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
            countryCode={countryCode}
            contextPois={contextPois}
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              {embedded ? null : (
                <h2 className="text-lg font-semibold text-atg-fg">{t('title')}</h2>
              )}
              {state.status === 'ready' ? (
                <DataTableBadge variant="muted">{pois.length}</DataTableBadge>
              ) : null}
            </div>
            <p className="text-sm text-atg-muted">{t('intro')}</p>
            {state.status === 'ready' && poisOnMap.length > 0 ? (
              <p className="text-xs text-atg-muted">
                {t('mapOverviewHint', { count: poisOnMap.length })}
              </p>
            ) : null}
          </div>
          <Button type="button" onClick={openCreateForm} className="w-full shrink-0 sm:w-auto">
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
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-start">
            {showOverviewMap ? (
              <DestinationStaticMap
                countryCode={countryCode}
                latitude={mapDefaultLatitude}
                longitude={mapDefaultLongitude}
                destinationName={destinationName}
                pointsOfInterest={pois}
                highlightedPoiId={highlightedPoiId}
                onPoiSelect={setHighlightedPoiId}
                title={t('mapOverviewTitle')}
                hideExternalLink
              />
            ) : (
              <Card variant="dashboard" className="flex min-h-[12rem] items-center justify-center p-6">
                <p className="text-center text-sm text-atg-muted">{t('mapOverviewEmpty')}</p>
              </Card>
            )}

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
          </div>
        )}
      </section>
    </>
  );
}

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
import type { ActivityItineraryStop } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { CoordinatePickerMap } from '../maps/coordinate-picker-map';
import { formatDurationMinutes } from '../../lib/flight-datetime';
import { ActivityItineraryStopsTimeline } from './activity-itinerary-stops-timeline';

type FormValues = {
  name: string;
  stopOrder: string;
  latitude: string;
  longitude: string;
  description: string;
  durationMinutes: string;
};

const emptyForm: FormValues = {
  name: '',
  stopOrder: '',
  latitude: '',
  longitude: '',
  description: '',
  durationMinutes: '',
};

function parseCoord(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const num = Number(trimmed);
  return Number.isFinite(num) ? num : undefined;
}

type ActivityItineraryStopsSectionProps = {
  activityId: string;
  activityDurationMinutes?: number | null;
  embedded?: boolean;
};

export function ActivityItineraryStopsSection({
  activityId,
  activityDurationMinutes = null,
  embedded = false,
}: ActivityItineraryStopsSectionProps) {
  const { activities: getActivitiesErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.activities.sections.itineraryStops');
  const tColumns = useTranslations('modules.common.columns');
  const tCommon = useTranslations('modules.common');
  const tActions = useTranslations('common.actions');
  const emptyDash = tCommon('empty.dash');
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; rows: ActivityItineraryStop[] }
  >({ status: 'loading' });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ActivityItineraryStop | null>(null);
  const [formValues, setFormValues] = useState<FormValues>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<ActivityItineraryStop | null>(null);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listActivityItineraryStops({
        activityId,
        page: 1,
        limit: 100,
      });
      setState({ status: 'ready', rows: result.data });
    } catch (error) {
      setState({ status: 'error', message: getActivitiesErrorMessage(error) });
    }
  }, [activityId, getActivitiesErrorMessage]);

  useEffect(() => {
    void load();
  }, [load]);

  const rows = useMemo(() => (state.status === 'ready' ? state.rows : []), [state]);

  const totalStopDurationMinutes = useMemo(
    () =>
      rows.reduce((total, row) => {
        if (row.durationMinutes == null || row.durationMinutes <= 0) {
          return total;
        }
        return total + row.durationMinutes;
      }, 0),
    [rows],
  );

  const activityDurationLabel =
    activityDurationMinutes != null && activityDurationMinutes > 0
      ? formatDurationMinutes(activityDurationMinutes)
      : null;
  const totalStopDurationLabel =
    totalStopDurationMinutes > 0 ? formatDurationMinutes(totalStopDurationMinutes) : null;

  const nextStopOrder = useMemo(() => {
    if (!rows.length) return 1;
    return Math.max(...rows.map((row) => row.stopOrder)) + 1;
  }, [rows]);

  const mapDefaultCenter = useMemo(() => {
    const lastStop = rows[rows.length - 1];
    if (lastStop) {
      const lat = Number(lastStop.latitude);
      const lng = Number(lastStop.longitude);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        return { latitude: lat, longitude: lng };
      }
    }
    return { latitude: -4.3058, longitude: 15.3 };
  }, [rows]);

  function handleCoordinatePick(latitude: string, longitude: string) {
    setFormValues((prev) => ({ ...prev, latitude, longitude }));
    setFieldErrors((prev) => ({ ...prev, latitude: undefined, longitude: undefined }));
  }

  function resetForm() {
    setFormValues(emptyForm);
    setFieldErrors({});
    setFormError(null);
    setEditing(null);
    setShowForm(false);
  }

  function openCreateForm() {
    setEditing(null);
    setFieldErrors({});
    setFormError(null);
    setFormValues({ ...emptyForm, stopOrder: String(nextStopOrder) });
    setShowForm(true);
  }

  function openEditForm(stop: ActivityItineraryStop) {
    setEditing(stop);
    setFormValues({
      name: stop.name,
      stopOrder: String(stop.stopOrder),
      latitude: stop.latitude ?? '',
      longitude: stop.longitude ?? '',
      description: stop.description ?? '',
      durationMinutes: stop.durationMinutes != null ? String(stop.durationMinutes) : '',
    });
    setFieldErrors({});
    setFormError(null);
    setShowForm(true);
  }

  function validateForm(): boolean {
    const errors: Partial<Record<keyof FormValues, string>> = {};
    if (!formValues.name.trim()) {
      errors.name = tCommon('validation.nameRequired');
    }

    const stopOrder = Number(formValues.stopOrder);
    if (!Number.isFinite(stopOrder) || stopOrder < 1) {
      errors.stopOrder = t('validation.stopOrder');
    }

    const latitude = parseCoord(formValues.latitude);
    const longitude = parseCoord(formValues.longitude);
    if (latitude === undefined) {
      errors.latitude = tCommon('validation.latitudeInvalid');
    } else if (latitude < -90 || latitude > 90) {
      errors.latitude = tCommon('validation.latitudeOutOfRange');
    }
    if (longitude === undefined) {
      errors.longitude = tCommon('validation.longitudeInvalid');
    } else if (longitude < -180 || longitude > 180) {
      errors.longitude = tCommon('validation.longitudeOutOfRange');
    }

    if (formValues.durationMinutes.trim()) {
      const durationMinutes = Number(formValues.durationMinutes);
      if (!Number.isFinite(durationMinutes) || durationMinutes < 1) {
        errors.durationMinutes = t('validation.durationMinutes');
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (!validateForm()) return;

    const stopOrder = Number(formValues.stopOrder);
    const latitude = parseCoord(formValues.latitude)!;
    const longitude = parseCoord(formValues.longitude)!;
    const description = formValues.description.trim() || null;
    const durationTrimmed = formValues.durationMinutes.trim();
    const durationMinutes = durationTrimmed ? Number(durationTrimmed) : null;

    setSubmitting(true);
    try {
      const body = {
        name: formValues.name.trim(),
        stopOrder,
        latitude,
        longitude,
        description,
        durationMinutes,
      };

      if (editing) {
        await getApiClient().updateActivityItineraryStop(editing.id, body);
      } else {
        await getApiClient().createActivityItineraryStop({
          activityId,
          ...body,
        });
      }
      resetForm();
      await load();
    } catch (error) {
      setFormError(getActivitiesErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  const formatCoord = useCallback(
    (value: string | null): string => {
      if (value === null || value === '') return emptyDash;
      const num = Number(value);
      return Number.isFinite(num) ? num.toFixed(5) : value;
    },
    [emptyDash],
  );

  const formatDuration = useCallback(
    (value: number | null): string => {
      if (value == null || value <= 0) return emptyDash;
      return formatDurationMinutes(value);
    },
    [emptyDash],
  );

  const handleDeleteRequest = useCallback((stop: ActivityItineraryStop) => {
    setConfirmTarget(stop);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!confirmTarget) return;
    const stop = confirmTarget;
    setConfirmTarget(null);
    setDeleteError(null);
    setDeletingId(stop.id);
    try {
      await getApiClient().deleteActivityItineraryStop(stop.id);
      await load();
    } catch (error) {
      setDeleteError(getActivitiesErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  }, [confirmTarget, getActivitiesErrorMessage, load]);

  const columns = useMemo<ColumnDef<ActivityItineraryStop, unknown>[]>(
    () => [
      {
        accessorKey: 'stopOrder',
        header: t('order'),
        meta: { align: 'center' },
      },
      {
        accessorKey: 'name',
        header: tCommon('columns.name'),
      },
      {
        id: 'latitude',
        header: tCommon('form.latitude'),
        cell: ({ row }) => formatCoord(row.original.latitude),
      },
      {
        id: 'longitude',
        header: tCommon('form.longitude'),
        cell: ({ row }) => formatCoord(row.original.longitude),
      },
      {
        id: 'durationMinutes',
        header: tCommon('columns.duration'),
        cell: ({ row }) => formatDuration(row.original.durationMinutes),
      },
      {
        id: 'actions',
        header: tColumns('actions'),
        meta: { align: 'right' },
        cell: ({ row }) => (
          <DataTableActions>
            <DataTableActionButton
              action="edit"
              onClick={() => openEditForm(row.original)}
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
    [deletingId, formatCoord, formatDuration, handleDeleteRequest, t, tColumns, tCommon],
  );

  return (
    <>
      <AlertDialog
        open={!!confirmTarget}
        onOpenChange={(open) => {
          if (!open) setConfirmTarget(null);
        }}
        title={t('deleteTitle')}
        description={t('deleteConfirm')}
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
        title={editing ? t('edit') : t('new')}
        showClose={!submitting}
        closeAriaLabel={tActions('close')}
        className="max-w-2xl"
      >
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          {formError ? (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {formError}
            </p>
          ) : null}
          <Input
            label={tCommon('columns.name')}
            value={formValues.name}
            onChange={(e) => setFormValues((prev) => ({ ...prev, name: e.target.value }))}
            error={fieldErrors.name}
            disabled={submitting}
            required
          />
          <Input
            label={t('order')}
            type="number"
            min={1}
            value={formValues.stopOrder}
            onChange={(e) => setFormValues((prev) => ({ ...prev, stopOrder: e.target.value }))}
            error={fieldErrors.stopOrder}
            disabled={submitting}
            required
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={tCommon('form.latitude')}
              value={formValues.latitude}
              onChange={(e) => setFormValues((prev) => ({ ...prev, latitude: e.target.value }))}
              error={fieldErrors.latitude}
              placeholder="-4.30580"
              disabled={submitting}
              required
            />
            <Input
              label={tCommon('form.longitude')}
              value={formValues.longitude}
              onChange={(e) => setFormValues((prev) => ({ ...prev, longitude: e.target.value }))}
              error={fieldErrors.longitude}
              placeholder="15.30000"
              disabled={submitting}
              required
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
          />
          <Input
            label={t('description')}
            value={formValues.description}
            onChange={(e) => setFormValues((prev) => ({ ...prev, description: e.target.value }))}
            disabled={submitting}
          />
          <Input
            label={tCommon('form.durationMinutesOptional')}
            type="number"
            min={1}
            value={formValues.durationMinutes}
            onChange={(e) =>
              setFormValues((prev) => ({ ...prev, durationMinutes: e.target.value }))
            }
            error={fieldErrors.durationMinutes}
            hint={t('durationFieldHint')}
            disabled={submitting}
          />
          <div className="flex flex-wrap gap-3 pt-2">
            <Button type="submit" loading={submitting}>
              {editing ? tActions('save') : tActions('create')}
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

      <div className="space-y-6">
        {!embedded ? <h3 className="text-base font-semibold text-atg-fg">{t('title')}</h3> : null}

        {activityDurationLabel || totalStopDurationLabel ? (
          <p className="text-sm text-atg-muted">
            {activityDurationLabel
              ? t('durationSummaryActivity', { duration: activityDurationLabel })
              : null}
            {activityDurationLabel && totalStopDurationLabel ? ' · ' : null}
            {totalStopDurationLabel
              ? t('durationSummaryStops', { duration: totalStopDurationLabel })
              : null}
            {activityDurationMinutes != null &&
            totalStopDurationMinutes > activityDurationMinutes ? (
              <span className="mt-1 block text-atg-warning">
                {t('durationExceedsActivity')}
              </span>
            ) : null}
          </p>
        ) : (
          <p className="text-sm text-atg-muted">{t('durationHint')}</p>
        )}

        {state.status === 'ready' && rows.length > 0 ? (
          <ActivityItineraryStopsTimeline stops={rows} />
        ) : null}

        <div className="flex justify-end">
          <Button type="button" onClick={openCreateForm}>
            {t('add')}
          </Button>
        </div>

        {state.status === 'error' ? (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {state.message}
          </p>
        ) : state.status === 'loading' ? (
          <p className="text-sm text-atg-muted">{tCommon('loading')}</p>
        ) : rows.length === 0 ? (
          <Card variant="dashboard" className="py-12 text-center">
            <p className="text-sm text-atg-muted">{t('empty')}</p>
          </Card>
        ) : (
          <Card variant="dashboard" padding="none">
            <DataTable
              columns={columns}
              data={rows}
              isLoading={false}
              emptyMessage={t('empty')}
              getRowId={(row) => row.id}
            />
          </Card>
        )}
      </div>
    </>
  );
}

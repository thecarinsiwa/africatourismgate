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
import type { ActivityItineraryStop } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { CoordinatePickerMap } from '../maps/coordinate-picker-map';
import { ActivityItineraryStopsTimeline } from './activity-itinerary-stops-timeline';

type FormValues = {
  name: string;
  stopOrder: string;
  latitude: string;
  longitude: string;
  description: string;
};

const emptyForm: FormValues = {
  name: '',
  stopOrder: '',
  latitude: '',
  longitude: '',
  description: '',
};

function parseCoord(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const num = Number(trimmed);
  return Number.isFinite(num) ? num : undefined;
}

type ActivityItineraryStopsSectionProps = {
  activityId: string;
  embedded?: boolean;
};

export function ActivityItineraryStopsSection({
  activityId,
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
    resetForm();
    setFormValues((prev) => ({ ...prev, stopOrder: String(nextStopOrder) }));
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

    setSubmitting(true);
    try {
      const body = {
        name: formValues.name.trim(),
        stopOrder,
        latitude,
        longitude,
        description,
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
        id: 'actions',
        header: tColumns('actions'),
        meta: { align: 'right' },
        cell: ({ row }) => (
          <DataTableActions>
            <DataTableActionButton
              action="edit"
              onClick={() => {
                setEditing(row.original);
                setFormValues({
                  name: row.original.name,
                  stopOrder: String(row.original.stopOrder),
                  latitude: row.original.latitude ?? '',
                  longitude: row.original.longitude ?? '',
                  description: row.original.description ?? '',
                });
                setFieldErrors({});
                setFormError(null);
                setShowForm(true);
              }}
            />
            <DataTableActionButton
              action="delete"
              onClick={async () => {
                if (!window.confirm(t('deleteConfirm'))) return;
                setDeletingId(row.original.id);
                try {
                  await getApiClient().deleteActivityItineraryStop(row.original.id);
                  await load();
                } catch (error) {
                  setFormError(getActivitiesErrorMessage(error));
                } finally {
                  setDeletingId(null);
                }
              }}
              disabled={deletingId === row.original.id}
              loading={deletingId === row.original.id}
            />
          </DataTableActions>
        ),
      },
    ],
    [deletingId, emptyDash, formatCoord, getActivitiesErrorMessage, load, t, tColumns, tCommon],
  );

  return (
    <div className="space-y-6">
      {!embedded ? <h3 className="text-base font-semibold text-atg-fg">{t('title')}</h3> : null}

      {state.status === 'ready' && rows.length > 0 ? (
        <ActivityItineraryStopsTimeline stops={rows} />
      ) : null}

      <div className="flex justify-end">
        {!showForm ? (
          <Button type="button" onClick={openCreateForm}>
            {t('add')}
          </Button>
        ) : null}
      </div>

      {showForm ? (
        <Card variant="dashboard" className="max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h4 className="text-sm font-medium">{editing ? t('edit') : t('new')}</h4>
            {formError ? (
              <p role="alert" className="text-sm text-red-600">
                {formError}
              </p>
            ) : null}
            <Input
              label={tCommon('columns.name')}
              value={formValues.name}
              onChange={(e) => setFormValues((prev) => ({ ...prev, name: e.target.value }))}
              error={fieldErrors.name}
              required
            />
            <Input
              label={t('order')}
              type="number"
              min={1}
              value={formValues.stopOrder}
              onChange={(e) => setFormValues((prev) => ({ ...prev, stopOrder: e.target.value }))}
              error={fieldErrors.stopOrder}
              required
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label={tCommon('form.latitude')}
                value={formValues.latitude}
                onChange={(e) => setFormValues((prev) => ({ ...prev, latitude: e.target.value }))}
                error={fieldErrors.latitude}
                placeholder="-4.30580"
                required
              />
              <Input
                label={tCommon('form.longitude')}
                value={formValues.longitude}
                onChange={(e) => setFormValues((prev) => ({ ...prev, longitude: e.target.value }))}
                error={fieldErrors.longitude}
                placeholder="15.30000"
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
  );
}

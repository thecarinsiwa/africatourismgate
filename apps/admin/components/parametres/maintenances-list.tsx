'use client';

import {
  AlertDialog,
  Button,
  Card,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  DataTableBadge,
  DataTablePagination,
  type ColumnDef,
} from '@africatourismgate/ui';
import {
  isSiteMaintenanceActive,
  type OrganizationListItem,
  type OrganizationMaintenance,
  type SiteMaintenanceLocale,
} from '@africatourismgate/types';
import { SITE_MAINTENANCE_LOCALES } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { useSetAdminPageMeta } from '../admin-page-meta-context';
import { getApiClient } from '../../lib/auth/api';
import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';
import { OrganizationOrgSelector } from '../organizations/organization-org-selector';
import { AdminListPageHeader } from '../pages/admin-list-page-header';
import { ParametresPageLayout } from './parametres-subnav';
import { resolveInitialOrganizationId } from './organization-settings-form';

const PAGE_SIZE = 20;

function formatWindowDate(iso: string | null, locale: string): string {
  if (!iso) return '—';
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return '—';
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(ms));
}

export function MaintenancesList() {
  const { organizationSettings: getErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.settings.maintenances.list');
  const tLocale = useTranslations('modules.about.locale');
  const tCommon = useTranslations('modules.common');
  const router = useRouter();
  const searchParams = useSearchParams();
  const localeFilterId = useId();

  const [accessError, setAccessError] = useState<string | null>(null);
  const [canWrite, setCanWrite] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<OrganizationListItem[]>([]);
  const [page, setPage] = useState(1);
  const [localeFilter, setLocaleFilter] = useState<'' | SiteMaintenanceLocale>('');
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | {
        status: 'ready';
        rows: OrganizationMaintenance[];
        total: number;
        totalPages: number;
      }
  >({ status: 'loading' });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<OrganizationMaintenance | null>(
    null,
  );

  useSetAdminPageMeta({ title: t('pageTitle') });

  const load = useCallback(
    async (
      orgId: string,
      superAdmin: boolean,
      pageNum: number,
      locale?: '' | SiteMaintenanceLocale,
    ) => {
      setState({ status: 'loading' });
      try {
        const result = await getApiClient().listOrganizationMaintenances({
          ...(superAdmin ? { organizationId: orgId } : {}),
          page: pageNum,
          limit: PAGE_SIZE,
          ...(locale ? { locale } : {}),
        });
        setState({
          status: 'ready',
          rows: result.data,
          total: result.meta.total,
          totalPages: result.meta.totalPages,
        });
      } catch (error) {
        setState({ status: 'error', message: getErrorMessage(error) });
      }
    },
    [getErrorMessage],
  );

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const client = getApiClient();
        const me = await client.getAuthMe();
        const canRead =
          me.isSuperAdmin || me.permissions.includes('organization_settings.read');
        setCanWrite(
          me.isSuperAdmin || me.permissions.includes('organization_settings.write'),
        );
        if (!canRead) {
          if (!cancelled) setAccessError(t('denied'));
          return;
        }

        const orgId = resolveInitialOrganizationId(
          me.isSuperAdmin,
          me.user.organizationId,
          searchParams.get('organizationId'),
        );

        if (!cancelled) {
          setIsSuperAdmin(me.isSuperAdmin);
          setOrganizationId(orgId);
        }

        if (me.isSuperAdmin) {
          const orgs = await client.listOrganizations({ page: 1, limit: 100 });
          if (!cancelled) setOrganizations(orgs.data);
        }
      } catch (error) {
        if (!cancelled) setAccessError(getErrorMessage(error));
      }
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, [searchParams, t, getErrorMessage]);

  useEffect(() => {
    if (!organizationId || accessError) return;
    void load(organizationId, isSuperAdmin, page, localeFilter);
  }, [page, organizationId, isSuperAdmin, accessError, load, localeFilter]);

  const handleOrganizationChange = useCallback(
    (id: string) => {
      setOrganizationId(id);
      setPage(1);
      const params = new URLSearchParams(searchParams.toString());
      params.set('organizationId', id);
      router.replace(`/parametres/maintenance?${params.toString()}`);
    },
    [router, searchParams],
  );

  const handleDeleteRequest = useCallback((item: OrganizationMaintenance) => {
    setConfirmTarget(item);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!confirmTarget || !organizationId) return;
    const item = confirmTarget;
    setConfirmTarget(null);
    setDeleteError(null);
    setDeletingId(item.id);
    try {
      await getApiClient().deleteOrganizationMaintenance(
        item.id,
        isSuperAdmin ? organizationId : undefined,
      );
      setState((prev) => {
        if (prev.status !== 'ready') return prev;
        return {
          ...prev,
          rows: prev.rows.filter((row) => row.id !== item.id),
          total: Math.max(0, prev.total - 1),
        };
      });
    } catch (error) {
      setDeleteError(getErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  }, [confirmTarget, getErrorMessage, isSuperAdmin, organizationId]);

  const dateLocale =
    typeof navigator !== 'undefined' ? navigator.language : 'fr-FR';

  const columns = useMemo<ColumnDef<OrganizationMaintenance>[]>(
    () => [
      {
        id: 'title',
        header: t('columns.title'),
        meta: { cellClassName: 'min-w-0' },
        cell: ({ row }) => (
          <div className="min-w-0 max-w-md space-y-1">
            <p className="truncate font-medium text-atg-fg">
              {row.original.title?.trim() || t('untitled')}
            </p>
            {row.original.message ? (
              <p className="line-clamp-2 text-xs text-atg-muted">{row.original.message}</p>
            ) : null}
          </div>
        ),
      },
      {
        id: 'locale',
        header: t('columns.locale'),
        meta: { align: 'center', hideOnMobile: true, cellClassName: 'whitespace-nowrap' },
        cell: ({ row }) => (
          <span className="text-sm text-atg-muted">
            {tLocale(row.original.locale)}
          </span>
        ),
      },
      {
        id: 'window',
        header: t('columns.window'),
        meta: { hideOnMobile: true, cellClassName: 'whitespace-nowrap' },
        cell: ({ row }) => (
          <span className="text-sm text-atg-muted">
            {formatWindowDate(row.original.startsAt, dateLocale)}
            {' → '}
            {formatWindowDate(row.original.endsAt, dateLocale)}
          </span>
        ),
      },
      {
        id: 'enabled',
        header: t('columns.enabled'),
        meta: { align: 'center', hideOnMobile: true, cellClassName: 'whitespace-nowrap' },
        cell: ({ row }) =>
          row.original.enabled ? (
            <DataTableBadge variant="success">{t('enabledYes')}</DataTableBadge>
          ) : (
            <DataTableBadge variant="muted">{t('enabledNo')}</DataTableBadge>
          ),
      },
      {
        id: 'status',
        header: t('columns.status'),
        meta: { align: 'center', cellClassName: 'whitespace-nowrap' },
        cell: ({ row }) => {
          const active = isSiteMaintenanceActive({
            enabled: row.original.enabled,
            startsAt: row.original.startsAt,
            endsAt: row.original.endsAt,
          });
          return (
            <DataTableBadge variant={active ? 'warning' : 'muted'}>
              {active ? t('statusActive') : t('statusInactive')}
            </DataTableBadge>
          );
        },
      },
      {
        id: 'actions',
        header: tCommon('columns.actions'),
        meta: {
          align: 'right',
          headerClassName: 'w-[5.5rem]',
          cellClassName: 'w-[5.5rem] whitespace-nowrap',
        },
        cell: ({ row }) => {
          const editHref = organizationId
            ? `/parametres/maintenance/${row.original.id}?organizationId=${organizationId}`
            : `/parametres/maintenance/${row.original.id}`;
          return (
            <DataTableActions>
              <DataTableActionButton action="edit" href={editHref} />
              {canWrite ? (
                <DataTableActionButton
                  action="delete"
                  onClick={() => handleDeleteRequest(row.original)}
                  disabled={deletingId === row.original.id}
                  loading={deletingId === row.original.id}
                />
              ) : null}
            </DataTableActions>
          );
        },
      },
    ],
    [
      canWrite,
      dateLocale,
      deletingId,
      handleDeleteRequest,
      organizationId,
      t,
      tCommon,
      tLocale,
    ],
  );

  const rows = state.status === 'ready' ? state.rows : [];
  const createHref = organizationId
    ? `/parametres/maintenance/nouveau?organizationId=${organizationId}`
    : '/parametres/maintenance/nouveau';

  if (accessError) {
    return (
      <ParametresPageLayout>
        <Card className="p-6">
          <p className="text-sm text-destructive">{accessError}</p>
        </Card>
      </ParametresPageLayout>
    );
  }

  return (
    <>
      <AlertDialog
        open={!!confirmTarget}
        onOpenChange={(open) => {
          if (!open) setConfirmTarget(null);
        }}
        title={t('deleteTitle')}
        description={
          confirmTarget
            ? t('deleteConfirm', {
                title: confirmTarget.title?.trim() || t('untitled'),
              })
            : ''
        }
        confirmLabel={t('deleteConfirmButton')}
        cancelLabel={t('cancel')}
        variant="danger"
        loading={!!deletingId}
        error={deleteError}
        onConfirm={() => void handleDeleteConfirm()}
      />
      <ParametresPageLayout>
        <div className="min-w-0 space-y-6">
          <AdminListPageHeader
            routePath="parametres/maintenance"
            actions={
              canWrite ? (
                <Button href={createHref}>{t('createButton')}</Button>
              ) : undefined
            }
          />

          {isSuperAdmin && organizationId ? (
            <OrganizationOrgSelector
              organizations={organizations}
              value={organizationId}
              onChange={handleOrganizationChange}
            />
          ) : null}

          <div className="max-w-xs">
            <label
              htmlFor={localeFilterId}
              className="mb-1 block text-xs font-medium text-muted-foreground"
            >
              {t('localeFilter')}
            </label>
            <select
              id={localeFilterId}
              value={localeFilter}
              onChange={(e) => {
                setLocaleFilter(e.target.value as '' | SiteMaintenanceLocale);
                setPage(1);
              }}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">{t('allLocales')}</option>
              {SITE_MAINTENANCE_LOCALES.map((code) => (
                <option key={code} value={code}>
                  {tLocale(code)}
                </option>
              ))}
            </select>
          </div>

          {state.status === 'error' ? (
            <p className="text-sm text-destructive" role="alert">
              {state.message}
            </p>
          ) : (
            <>
              <Card variant="dashboard" padding="none" className="min-w-0 overflow-hidden">
                <DataTable
                  columns={columns}
                  data={rows}
                  isLoading={state.status === 'loading'}
                  emptyMessage={t('empty')}
                  getRowId={(row) => row.id}
                  aria-label={t('tableAria')}
                />
              </Card>
              {state.status === 'ready' ? (
                <DataTablePagination
                  page={page}
                  pageSize={PAGE_SIZE}
                  totalPages={state.totalPages}
                  totalItems={state.total}
                  onPageChange={setPage}
                />
              ) : null}
            </>
          )}
        </div>
      </ParametresPageLayout>
    </>
  );
}

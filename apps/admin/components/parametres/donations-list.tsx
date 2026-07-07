'use client';

import {
  Button,
  Card,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  DataTableBadge,
  DataTablePagination,
  Input,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { Donation, DonationStatus } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { useSetAdminPageMeta } from '../admin-page-meta-context';
import { getApiClient } from '../../lib/auth/api';
import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';
import { ParametresPageLayout } from './parametres-subnav';

const PAGE_SIZE = 20;

export function DonationsList() {
  const { organizationSettings: getErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.settings.donations.list');
  const tForm = useTranslations('modules.settings.donations.form');
  const tStatus = useTranslations('modules.about.status');
  const tLocale = useTranslations('modules.about.locale');
  const tCommon = useTranslations('modules.common');
  const statusFilterId = useId();
  const localeFilterId = useId();

  const [accessError, setAccessError] = useState<string | null>(null);
  const [canWrite, setCanWrite] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'' | DonationStatus>('');
  const [localeFilter, setLocaleFilter] = useState('');
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; donations: Donation[]; total: number; totalPages: number }
  >({ status: 'loading' });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useSetAdminPageMeta({ title: t('pageTitle') });

  useEffect(() => {
    let cancelled = false;
    void getApiClient()
      .getAuthMe()
      .then((me) => {
        if (cancelled) return;
        const canRead =
          me.isSuperAdmin || me.permissions.includes('organization_settings.read');
        setCanWrite(
          me.isSuperAdmin || me.permissions.includes('organization_settings.write'),
        );
        if (!canRead) setAccessError(t('denied'));
      })
      .catch(() => {
        if (!cancelled) setAccessError(t('denied'));
      });
    return () => {
      cancelled = true;
    };
  }, [t]);

  const handleDelete = useCallback(
    async (item: Donation) => {
      if (!window.confirm(t('deleteConfirm', { title: item.title }))) return;
      setDeletingId(item.id);
      try {
        await getApiClient().deleteDonation(item.id);
        setState((prev) => {
          if (prev.status !== 'ready') return prev;
          return {
            ...prev,
            donations: prev.donations.filter((row) => row.id !== item.id),
            total: Math.max(0, prev.total - 1),
          };
        });
      } catch (error) {
        window.alert(getErrorMessage(error));
      } finally {
        setDeletingId(null);
      }
    },
    [getErrorMessage, t],
  );

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listDonations({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        status: statusFilter || undefined,
        locale: localeFilter || undefined,
      });
      setState({
        status: 'ready',
        donations: result.data,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      setState({ status: 'error', message: getErrorMessage(error) });
    }
  }, [page, search, statusFilter, localeFilter, getErrorMessage]);

  useEffect(() => {
    if (accessError) return;
    void load();
  }, [accessError, load]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch((prev) => {
        const next = searchInput.trim();
        if (prev !== next) setPage(1);
        return next;
      });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const columns = useMemo<ColumnDef<Donation>[]>(
    () => [
      {
        id: 'title',
        header: t('columns.title'),
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.title}</p>
            {row.original.contextNote ? (
              <p className="text-xs text-muted-foreground">{row.original.contextNote}</p>
            ) : null}
          </div>
        ),
      },
      {
        id: 'locale',
        header: t('columns.locale'),
        cell: ({ row }) => tLocale(row.original.locale as 'fr' | 'en' | 'es'),
      },
      {
        id: 'surfaces',
        header: t('columns.surfaces'),
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.showOnWeb ? (
              <DataTableBadge variant="muted">{tForm('surfaces.web')}</DataTableBadge>
            ) : null}
            {row.original.showOnGap ? (
              <DataTableBadge variant="muted">{tForm('surfaces.gap')}</DataTableBadge>
            ) : null}
          </div>
        ),
      },
      {
        id: 'featured',
        header: t('columns.featured'),
        cell: ({ row }) =>
          row.original.isNavbarFeatured ? (
            <DataTableBadge variant="success">{t('featuredYes')}</DataTableBadge>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        id: 'status',
        header: tCommon('columns.status'),
        cell: ({ row }) => (
          <DataTableBadge variant={row.original.status === 'published' ? 'success' : 'warning'}>
            {tStatus(row.original.status)}
          </DataTableBadge>
        ),
      },
      {
        id: 'actions',
        header: tCommon('columns.actions'),
        meta: { align: 'right' },
        cell: ({ row }) => (
          <DataTableActions>
            <DataTableActionButton
              action="edit"
              href={`/parametres/dons/${row.original.id}`}
            />
            {canWrite ? (
              <DataTableActionButton
                action="delete"
                onClick={() => void handleDelete(row.original)}
                disabled={deletingId === row.original.id}
                loading={deletingId === row.original.id}
              />
            ) : null}
          </DataTableActions>
        ),
      },
    ],
    [canWrite, deletingId, handleDelete, t, tCommon, tForm, tLocale, tStatus],
  );

  const donations = state.status === 'ready' ? state.donations : [];

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
    <ParametresPageLayout>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">{t('pageTitle')}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t('intro')}</p>
          </div>
          {canWrite ? (
            <Button href="/parametres/dons/nouveau">{t('createButton')}</Button>
          ) : null}
        </div>

        <Card className="p-4">
          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t('searchPlaceholder')}
            />
            <div>
              <label htmlFor={localeFilterId} className="mb-1 block text-xs font-medium text-muted-foreground">
                {t('localeFilter')}
              </label>
              <select
                id={localeFilterId}
                value={localeFilter}
                onChange={(e) => {
                  setLocaleFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">{t('allLocales')}</option>
                <option value="fr">{tLocale('fr')}</option>
                <option value="en">{tLocale('en')}</option>
                <option value="es">{tLocale('es')}</option>
              </select>
            </div>
            <div>
              <label htmlFor={statusFilterId} className="mb-1 block text-xs font-medium text-muted-foreground">
                {tCommon('columns.status')}
              </label>
              <select
                id={statusFilterId}
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as '' | DonationStatus);
                  setPage(1);
                }}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">{t('allStatuses')}</option>
                <option value="draft">{tStatus('draft')}</option>
                <option value="published">{tStatus('published')}</option>
              </select>
            </div>
          </div>

          {state.status === 'loading' ? (
            <p className="text-sm text-muted-foreground">{tCommon('form.loading')}</p>
          ) : state.status === 'error' ? (
            <p className="text-sm text-destructive">{state.message}</p>
          ) : (
            <>
              <DataTable columns={columns} data={donations} emptyMessage={t('empty')} />
              <DataTablePagination
                page={page}
                pageSize={PAGE_SIZE}
                totalPages={state.totalPages}
                totalItems={state.total}
                onPageChange={setPage}
              />
            </>
          )}
        </Card>
      </div>
    </ParametresPageLayout>
  );
}

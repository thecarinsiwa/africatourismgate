'use client';

import {
  Button,
  Card,
  Checkbox,
  DataTable,
  DataTableBadge,
  DataTablePagination,
  FilterBar,
  Input,
  Modal,
  Select,
  useToast,
  type ColumnDef,
} from '@africatourismgate/ui';
import type {
  OrganizationListItem,
  TreasuryExternalCollaborator,
  TreasuryExternalScope,
} from '@africatourismgate/types';
import { TREASURY_EXTERNAL_SCOPES } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { resolveUnknownApiError } from '../../lib/common-api-errors';
import { useDataTablePaginationLabels } from '../../lib/i18n/use-pagination-labels';
import { PermissionGate } from '../permission-gate';

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

export function ExternalCollaboratorsList() {
  const t = useTranslations('modules.treasury.externals.list');
  const tColumns = useTranslations('modules.treasury.externals.list.columns');
  const tForm = useTranslations('modules.treasury.externals.form');
  const tFields = useTranslations('modules.treasury.externals.form.fields');
  const tScopes = useTranslations('modules.treasury.externals.scopes');
  const tCommon = useTranslations('modules.common');
  const tDataTable = useTranslations('modules.common.dataTable');
  const tErrors = useTranslations('modules.treasury.errors');
  const tCommonErrors = useTranslations('common.errors');
  const paginationLabels = useDataTablePaginationLabels();
  const { toast } = useToast();
  const emptyDash = tCommon('empty.dash');

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'' | 'true' | 'false'>('');
  const [canRead, setCanRead] = useState(true);
  const [canManage, setCanManage] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [organizations, setOrganizations] = useState<OrganizationListItem[]>([]);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteDisplayName, setInviteDisplayName] = useState('');
  const [inviteOrgId, setInviteOrgId] = useState('');
  const [inviteScopes, setInviteScopes] = useState<TreasuryExternalScope[]>([
    'expense_requests.create',
  ]);
  const [inviteTtl, setInviteTtl] = useState('72');
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | {
        status: 'ready';
        items: TreasuryExternalCollaborator[];
        total: number;
        totalPages: number;
      }
  >({ status: 'loading' });

  const commonErrorMessages = useMemo(
    () => ({
      network: tCommonErrors('network'),
      forbidden: tErrors('forbidden'),
      generic: tErrors('loadFailed'),
      apiStatus: (code: number) => tCommonErrors('apiStatus', { status: code }),
      accessDenied: t('accessDenied'),
    }),
    [t, tCommonErrors, tErrors],
  );

  useEffect(() => {
    let cancelled = false;
    void getApiClient()
      .getAuthMe()
      .then((me) => {
        if (cancelled) return;
        setCanRead(
          me.isSuperAdmin ||
            me.permissions.includes('treasury.read') ||
            me.permissions.includes('treasury.externals.manage'),
        );
        setCanManage(
          me.isSuperAdmin ||
            me.permissions.includes('treasury.externals.manage'),
        );
        setIsSuperAdmin(me.isSuperAdmin);
        if (me.user.organizationId) {
          setInviteOrgId((prev) => prev || me.user.organizationId || '');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCanRead(false);
          setCanManage(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isSuperAdmin) return;
    let cancelled = false;
    void getApiClient()
      .listOrganizations({ page: 1, limit: 100 })
      .then((result) => {
        if (!cancelled) setOrganizations(result.data);
      })
      .catch(() => {
        if (!cancelled) setOrganizations([]);
      });
    return () => {
      cancelled = true;
    };
  }, [isSuperAdmin]);

  useEffect(() => {
    const query = searchInput.trim();
    const timer = window.setTimeout(() => {
      setSearch((prev) => {
        if (prev !== query) setPage(1);
        return query;
      });
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const load = useCallback(async () => {
    if (!canRead) {
      setState({ status: 'error', message: t('accessDenied') });
      return;
    }
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listTreasuryExternalCollaborators({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        isActive:
          activeFilter === ''
            ? undefined
            : activeFilter === 'true',
      });
      setState({
        status: 'ready',
        items: result.data,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      setState({
        status: 'error',
        message: resolveUnknownApiError(error, commonErrorMessages, {
          useParseApiMessage: true,
          forbidden: t('accessDenied'),
        }),
      });
    }
  }, [activeFilter, canRead, commonErrorMessages, page, search, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const activeFilterCount = [search !== '', activeFilter !== ''].filter(
    Boolean,
  ).length;
  const hasFilters = activeFilterCount > 0;

  const handleClearFilters = useCallback(() => {
    setSearchInput('');
    setSearch('');
    setActiveFilter('');
    setPage(1);
  }, []);

  const activeFilterOptions = useMemo(
    () => [
      { value: '', label: t('filterActiveAll') },
      { value: 'true', label: t('filterActiveYes') },
      { value: 'false', label: t('filterActiveNo') },
    ],
    [t],
  );

  const organizationOptions = useMemo(
    () => [
      { value: '', label: '—' },
      ...organizations.map((org) => ({ value: org.id, label: org.name })),
    ],
    [organizations],
  );

  const resolveError = useCallback(
    (error: unknown) =>
      resolveUnknownApiError(
        error,
        {
          network: tCommonErrors('network'),
          forbidden: tErrors('forbidden'),
          generic: tErrors('saveFailed'),
          apiStatus: (status: number) =>
            tCommonErrors('apiStatus', { status }),
        },
        { useParseApiMessage: true, forbidden: tForm('accessDenied') },
      ),
    [tCommonErrors, tErrors, tForm],
  );

  async function handleInvite(event: React.FormEvent) {
    event.preventDefault();
    setInviteError(null);
    setInviteUrl(null);
    if (!canManage) {
      setInviteError(tForm('accessDenied'));
      return;
    }
    const email = inviteEmail.trim();
    if (!email) {
      setInviteError(tForm('validation.emailRequired'));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setInviteError(tForm('validation.emailInvalid'));
      return;
    }
    if (inviteScopes.length === 0) {
      setInviteError(tForm('validation.scopesRequired'));
      return;
    }
    if (isSuperAdmin && !inviteOrgId.trim()) {
      setInviteError(tForm('validation.organizationRequired'));
      return;
    }
    if (!inviteOrgId.trim()) {
      setInviteError(tForm('validation.organizationRequired'));
      return;
    }

    const ttl = Number.parseInt(inviteTtl, 10);
    setSubmitting(true);
    try {
      const result = await getApiClient().inviteTreasuryExternalCollaborator({
        organizationId: inviteOrgId,
        email,
        displayName: inviteDisplayName.trim() || null,
        scopes: inviteScopes,
        tokenTtlHours: Number.isFinite(ttl) && ttl > 0 ? ttl : undefined,
      });
      if (result.inviteUrl) {
        setInviteUrl(result.inviteUrl);
      } else {
        setInviteOpen(false);
        resetInviteForm();
      }
      toast({
        variant: 'success',
        title: tForm('toast.invitedTitle'),
        message: tForm('toast.invitedMessage'),
      });
      await load();
    } catch (error) {
      const message = resolveError(error);
      setInviteError(message);
      toast({
        variant: 'error',
        title: tForm('toast.errorTitle'),
        message,
      });
    } finally {
      setSubmitting(false);
    }
  }

  function resetInviteForm() {
    setInviteEmail('');
    setInviteDisplayName('');
    setInviteScopes(['expense_requests.create']);
    setInviteTtl('72');
    setInviteError(null);
    setInviteUrl(null);
  }

  const handleToggleActive = useCallback(
    async (item: TreasuryExternalCollaborator) => {
      if (!canManage) return;
      setActionId(item.id);
      try {
        if (item.isActive) {
          await getApiClient().deactivateTreasuryExternalCollaborator(item.id);
          toast({
            variant: 'success',
            title: tForm('toast.deactivatedTitle'),
            message: tForm('toast.deactivatedMessage'),
          });
        } else {
          await getApiClient().activateTreasuryExternalCollaborator(item.id);
          toast({
            variant: 'success',
            title: tForm('toast.activatedTitle'),
            message: tForm('toast.activatedMessage'),
          });
        }
        await load();
      } catch (error) {
        toast({
          variant: 'error',
          title: tForm('toast.errorTitle'),
          message: resolveError(error),
        });
      } finally {
        setActionId(null);
      }
    },
    [canManage, load, resolveError, tForm, toast],
  );

  const handleRegenerate = useCallback(
    async (item: TreasuryExternalCollaborator) => {
      if (!canManage) return;
      setActionId(item.id);
      try {
        const result = await getApiClient().inviteTreasuryExternalCollaborator({
          organizationId: item.organizationId,
          email: item.email,
          displayName: item.displayName,
          scopes: item.scopes as TreasuryExternalScope[],
        });
        if (result.inviteUrl) {
          setInviteUrl(result.inviteUrl);
          setInviteOpen(true);
        }
        toast({
          variant: 'success',
          title: tForm('toast.regeneratedTitle'),
          message: tForm('toast.regeneratedMessage'),
        });
        await load();
      } catch (error) {
        toast({
          variant: 'error',
          title: tForm('toast.errorTitle'),
          message: resolveError(error),
        });
      } finally {
        setActionId(null);
      }
    },
    [canManage, load, resolveError, tForm, toast],
  );

  async function copyInviteUrl() {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      toast({
        variant: 'success',
        title: tForm('inviteUrlCopied'),
        message: inviteUrl,
      });
    } catch {
      /* ignore */
    }
  }

  const columns = useMemo<ColumnDef<TreasuryExternalCollaborator, unknown>[]>(
    () => [
      {
        accessorKey: 'email',
        header: tColumns('email'),
        cell: ({ row }) => (
          <span className="font-medium text-atg-fg">{row.original.email}</span>
        ),
      },
      {
        accessorKey: 'displayName',
        header: tColumns('displayName'),
        cell: ({ row }) => row.original.displayName?.trim() || emptyDash,
      },
      {
        accessorKey: 'isActive',
        header: tColumns('active'),
        cell: ({ row }) => (
          <DataTableBadge
            variant={row.original.isActive ? 'success' : 'muted'}
          >
            {row.original.isActive ? tCommon('yes') : tCommon('no')}
          </DataTableBadge>
        ),
      },
      {
        accessorKey: 'scopes',
        header: tColumns('scopes'),
        meta: { hideOnMobile: true },
        cell: ({ row }) =>
          (row.original.scopes ?? [])
            .map((scope) => {
              try {
                return tScopes(scope as TreasuryExternalScope);
              } catch {
                return scope;
              }
            })
            .join(', ') || emptyDash,
      },
      {
        id: 'actions',
        header: tCommon('columns.actions'),
        enableSorting: false,
        meta: { isActions: true },
        cell: ({ row }) => {
          const item = row.original;
          const busy = actionId === item.id;
          if (!canManage) return null;
          return (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={busy || submitting}
                onClick={() => void handleToggleActive(item)}
              >
                {item.isActive
                  ? tForm('actions.deactivate')
                  : tForm('actions.activate')}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={busy || submitting}
                onClick={() => void handleRegenerate(item)}
              >
                {tForm('actions.regenerateLink')}
              </Button>
            </div>
          );
        },
      },
    ],
    [
      actionId,
      canManage,
      emptyDash,
      handleRegenerate,
      handleToggleActive,
      submitting,
      tColumns,
      tCommon,
      tForm,
      tScopes,
    ],
  );

  const isLoading = state.status === 'loading';
  const isError = state.status === 'error';
  const items = state.status === 'ready' ? state.items : [];
  const emptyMessage = hasFilters ? t('emptyFiltered') : t('emptyDefault');

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <PermissionGate permission="treasury.externals.manage">
          <Button
            type="button"
            variant="primary"
            onClick={() => {
              resetInviteForm();
              setInviteOpen(true);
            }}
          >
            {t('inviteButton')}
          </Button>
        </PermissionGate>
      </div>

      <FilterBar
        mobileVariant="drawer"
        activeCount={activeFilterCount}
        onClear={handleClearFilters}
        clearLabel={tCommon('filters.clearAll')}
        applyLabel={tCommon('filters.apply')}
        toggleLabel={tCommon('filters.toggle')}
        filters={
          <>
            <div className="min-w-[200px] flex-1 sm:max-w-md">
              <Input
                name="search"
                type="search"
                placeholder={t('searchPlaceholder')}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                aria-label={t('searchAria')}
              />
            </div>
            <div className="w-full sm:w-44">
              <Select
                label={t('filterActive')}
                value={activeFilter}
                options={activeFilterOptions}
                onChange={(e) => {
                  setActiveFilter(e.target.value as '' | 'true' | 'false');
                  setPage(1);
                }}
              />
            </div>
          </>
        }
      />

      {isError ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {state.message}
        </p>
      ) : (
        <>
          <Card variant="dashboard" padding="none" className="overflow-hidden">
            <DataTable
              columns={columns}
              data={items}
              isLoading={isLoading}
              loadingMessage={tDataTable('loading')}
              emptyMessage={emptyMessage}
              emptyVariant={hasFilters ? 'search' : 'default'}
              expandRowLabel={tDataTable('expandRow')}
              collapseRowLabel={tDataTable('collapseRow')}
              expandRowAriaLabel={tDataTable('expandRowAria')}
              getRowId={(row) => row.id}
              aria-label={t('ariaLabel')}
            />
          </Card>
          {state.status === 'ready' ? (
            <DataTablePagination
              page={page}
              pageSize={PAGE_SIZE}
              totalPages={state.totalPages}
              totalItems={state.total}
              itemLabel={tCommon('pagination.externalCollaborator')}
              labels={paginationLabels}
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}

      <Modal
        open={inviteOpen}
        onOpenChange={(open) => {
          setInviteOpen(open);
          if (!open) resetInviteForm();
        }}
        title={tForm('inviteTitle')}
        showClose
        closeAriaLabel={tForm('cancelInvite')}
      >
        <form onSubmit={handleInvite} className="space-y-4">
          {inviteError ? (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400"
            >
              {inviteError}
            </p>
          ) : null}

          {isSuperAdmin ? (
            <Select
              label={tForm('organization')}
              value={inviteOrgId}
              options={organizationOptions}
              onChange={(e) => setInviteOrgId(e.target.value)}
              required
              disabled={submitting}
            />
          ) : null}

          <Input
            label={tFields('email')}
            name="email"
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
            disabled={submitting}
          />
          <Input
            label={tFields('displayName')}
            name="displayName"
            value={inviteDisplayName}
            onChange={(e) => setInviteDisplayName(e.target.value)}
            disabled={submitting}
          />
          <Input
            label={tFields('tokenTtlHours')}
            name="tokenTtlHours"
            type="number"
            inputMode="numeric"
            value={inviteTtl}
            onChange={(e) => setInviteTtl(e.target.value)}
            disabled={submitting}
          />

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-atg-fg">
              {tFields('scopes')}
            </legend>
            {TREASURY_EXTERNAL_SCOPES.map((scope) => (
              <Checkbox
                key={scope}
                name={`scope-${scope}`}
                checked={inviteScopes.includes(scope)}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setInviteScopes((prev) =>
                    checked
                      ? [...prev, scope]
                      : prev.filter((s) => s !== scope),
                  );
                }}
                disabled={submitting}
                label={tScopes(scope)}
              />
            ))}
          </fieldset>

          {inviteUrl ? (
            <div className="space-y-2 rounded-lg border border-atg-border p-3">
              <p className="text-xs font-medium text-atg-muted">
                {tForm('inviteUrlLabel')}
              </p>
              <p className="break-all font-mono text-xs text-atg-fg">
                {inviteUrl}
              </p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => void copyInviteUrl()}
              >
                {tForm('copyInviteUrl')}
              </Button>
            </div>
          ) : null}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={() => setInviteOpen(false)}
            >
              {tForm('cancelInvite')}
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {tForm('submitInvite')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

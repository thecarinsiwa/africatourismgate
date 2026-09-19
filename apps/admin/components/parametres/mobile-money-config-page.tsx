'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';
import {
  AlertDialog,
  Button,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  DataTableBadge,
  Input,
  Modal,
  type ColumnDef,
} from '@africatourismgate/ui';
import type {
  MobileMoneyCountry,
  MobileMoneyOperator,
  MobileMoneyPaymentNumber,
  OrganizationListItem,
} from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSetAdminPageMeta } from '../admin-page-meta-context';
import { AdminListPageHeader } from '../pages/admin-list-page-header';
import { getApiClient } from '../../lib/auth/api';
import { resolveMediaUrl } from '../../lib/resolve-media-url';
import { OrganizationOrgSelector } from '../organizations/organization-org-selector';
import { ParametresPageLayout } from './parametres-subnav';
import { resolveInitialOrganizationId } from './organization-settings-form';

const LOGO_MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED_LOGO_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const E164_RE = /^\+[1-9]\d{6,14}$/;

type CountryForm = {
  code: string;
  name: string;
  isActive: boolean;
  sortOrder: string;
};

type OperatorForm = {
  name: string;
  isActive: boolean;
  sortOrder: string;
};

type NumberForm = {
  phoneE164: string;
  label: string;
  isActive: boolean;
  sortOrder: string;
};

const emptyCountryForm: CountryForm = {
  code: '',
  name: '',
  isActive: true,
  sortOrder: '0',
};

const emptyOperatorForm: OperatorForm = {
  name: '',
  isActive: true,
  sortOrder: '0',
};

const emptyNumberForm: NumberForm = {
  phoneE164: '',
  label: '',
  isActive: true,
  sortOrder: '0',
};

export function MobileMoneyConfigPage() {
  const { organizationSettings: getErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.settings');
  const tMm = useTranslations('modules.settings.mobileMoney');
  const tCommon = useTranslations('modules.common');
  const router = useRouter();
  const searchParams = useSearchParams();
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [accessError, setAccessError] = useState<string | null>(null);
  const [canWrite, setCanWrite] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<OrganizationListItem[]>([]);

  const [countries, setCountries] = useState<MobileMoneyCountry[]>([]);
  const [operators, setOperators] = useState<MobileMoneyOperator[]>([]);
  const [numbers, setNumbers] = useState<MobileMoneyPaymentNumber[]>([]);
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null);
  const [selectedOperatorId, setSelectedOperatorId] = useState<string | null>(null);

  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingOperators, setLoadingOperators] = useState(false);
  const [loadingNumbers, setLoadingNumbers] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const [countryModal, setCountryModal] = useState<'create' | 'edit' | null>(null);
  const [editingCountry, setEditingCountry] = useState<MobileMoneyCountry | null>(null);
  const [countryForm, setCountryForm] = useState<CountryForm>(emptyCountryForm);
  const [countryError, setCountryError] = useState<string | null>(null);
  const [countrySaving, setCountrySaving] = useState(false);

  const [operatorModal, setOperatorModal] = useState<'create' | 'edit' | null>(null);
  const [editingOperator, setEditingOperator] = useState<MobileMoneyOperator | null>(null);
  const [operatorForm, setOperatorForm] = useState<OperatorForm>(emptyOperatorForm);
  const [operatorError, setOperatorError] = useState<string | null>(null);
  const [operatorSaving, setOperatorSaving] = useState(false);
  const [pendingLogo, setPendingLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [numberModal, setNumberModal] = useState<'create' | 'edit' | null>(null);
  const [editingNumber, setEditingNumber] = useState<MobileMoneyPaymentNumber | null>(null);
  const [numberForm, setNumberForm] = useState<NumberForm>(emptyNumberForm);
  const [numberError, setNumberError] = useState<string | null>(null);
  const [numberSaving, setNumberSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<
    | { kind: 'country'; row: MobileMoneyCountry }
    | { kind: 'operator'; row: MobileMoneyOperator }
    | { kind: 'number'; row: MobileMoneyPaymentNumber }
    | null
  >(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useSetAdminPageMeta({ title: tMm('page.title') });

  const orgQuery = isSuperAdmin && organizationId ? organizationId : undefined;

  const loadCountries = useCallback(
    async (orgId: string, superAdmin = false) => {
      setLoadingCountries(true);
      setListError(null);
      try {
        const result = await getApiClient().listMobileMoneyCountries({
          ...(superAdmin ? { organizationId: orgId } : {}),
          page: 1,
          limit: 100,
        });
        setCountries(result.data);
        setSelectedCountryId((prev) => {
          if (prev && result.data.some((c) => c.id === prev)) return prev;
          return result.data[0]?.id ?? null;
        });
      } catch (error) {
        setListError(getErrorMessage(error));
      } finally {
        setLoadingCountries(false);
      }
    },
    [getErrorMessage],
  );

  const loadOperators = useCallback(
    async (countryId: string) => {
      setLoadingOperators(true);
      try {
        const result = await getApiClient().listMobileMoneyOperators({
          countryId,
          ...(orgQuery ? { organizationId: orgQuery } : {}),
          page: 1,
          limit: 100,
        });
        setOperators(result.data);
        setSelectedOperatorId((prev) => {
          if (prev && result.data.some((o) => o.id === prev)) return prev;
          return result.data[0]?.id ?? null;
        });
      } catch (error) {
        setListError(getErrorMessage(error));
        setOperators([]);
        setSelectedOperatorId(null);
      } finally {
        setLoadingOperators(false);
      }
    },
    [getErrorMessage, orgQuery],
  );

  const loadNumbers = useCallback(
    async (operatorId: string) => {
      setLoadingNumbers(true);
      try {
        const result = await getApiClient().listMobileMoneyPaymentNumbers({
          operatorId,
          ...(orgQuery ? { organizationId: orgQuery } : {}),
          page: 1,
          limit: 100,
        });
        setNumbers(result.data);
      } catch (error) {
        setListError(getErrorMessage(error));
        setNumbers([]);
      } finally {
        setLoadingNumbers(false);
      }
    },
    [getErrorMessage, orgQuery],
  );

  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        const client = getApiClient();
        const me = await client.getAuthMe();
        const canRead =
          me.isSuperAdmin || me.permissions.includes('mobile_money.read');
        if (!canRead) {
          if (!cancelled) setAccessError(tMm('page.denied'));
          return;
        }
        const orgId = resolveInitialOrganizationId(
          me.isSuperAdmin,
          me.user.organizationId,
          searchParams.get('organizationId'),
        );
        if (!cancelled) {
          setIsSuperAdmin(me.isSuperAdmin);
          setCanWrite(
            me.isSuperAdmin || me.permissions.includes('mobile_money.write'),
          );
          setOrganizationId(orgId);
        }
        if (me.isSuperAdmin) {
          const orgs = await client.listOrganizations({ page: 1, limit: 100 });
          if (!cancelled) setOrganizations(orgs.data);
        }
        if (!cancelled) await loadCountries(orgId, me.isSuperAdmin);
      } catch (error) {
        if (!cancelled) setAccessError(getErrorMessage(error));
      }
    }
    void init();
    return () => {
      cancelled = true;
    };
  }, [searchParams, loadCountries, tMm, getErrorMessage]);

  useEffect(() => {
    if (!selectedCountryId) {
      setOperators([]);
      setSelectedOperatorId(null);
      return;
    }
    void loadOperators(selectedCountryId);
  }, [selectedCountryId, loadOperators]);

  useEffect(() => {
    if (!selectedOperatorId) {
      setNumbers([]);
      return;
    }
    void loadNumbers(selectedOperatorId);
  }, [selectedOperatorId, loadNumbers]);

  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  const handleOrganizationChange = useCallback(
    (nextOrgId: string) => {
      setOrganizationId(nextOrgId);
      const params = new URLSearchParams(searchParams.toString());
      params.set('organizationId', nextOrgId);
      router.replace(`/parametres/mobile-money?${params.toString()}`);
      setSelectedCountryId(null);
      setSelectedOperatorId(null);
      void loadCountries(nextOrgId, true);
    },
    [loadCountries, router, searchParams],
  );

  function clearLogoPreview() {
    setLogoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setPendingLogo(null);
    if (logoInputRef.current) logoInputRef.current.value = '';
  }

  function openCountryModal(mode: 'create' | 'edit', row?: MobileMoneyCountry) {
    setCountryError(null);
    if (mode === 'edit' && row) {
      setEditingCountry(row);
      setCountryForm({
        code: row.code,
        name: row.name,
        isActive: row.isActive,
        sortOrder: String(row.sortOrder),
      });
    } else {
      setEditingCountry(null);
      setCountryForm(emptyCountryForm);
    }
    setCountryModal(mode);
  }

  function openOperatorModal(mode: 'create' | 'edit', row?: MobileMoneyOperator) {
    setOperatorError(null);
    clearLogoPreview();
    if (mode === 'edit' && row) {
      setEditingOperator(row);
      setOperatorForm({
        name: row.name,
        isActive: row.isActive,
        sortOrder: String(row.sortOrder),
      });
    } else {
      setEditingOperator(null);
      setOperatorForm(emptyOperatorForm);
    }
    setOperatorModal(mode);
  }

  function openNumberModal(mode: 'create' | 'edit', row?: MobileMoneyPaymentNumber) {
    setNumberError(null);
    if (mode === 'edit' && row) {
      setEditingNumber(row);
      setNumberForm({
        phoneE164: row.phoneE164,
        label: row.label ?? '',
        isActive: row.isActive,
        sortOrder: String(row.sortOrder),
      });
    } else {
      setEditingNumber(null);
      setNumberForm(emptyNumberForm);
    }
    setNumberModal(mode);
  }

  async function saveCountry() {
    if (!organizationId) return;
    const code = countryForm.code.trim().toUpperCase();
    const name = countryForm.name.trim();
    if (!/^[A-Z]{2}$/.test(code)) {
      setCountryError(tMm('form.codeInvalid'));
      return;
    }
    if (!name) {
      setCountryError(tMm('form.nameRequired'));
      return;
    }
    setCountrySaving(true);
    setCountryError(null);
    try {
      const body = {
        code,
        name,
        isActive: countryForm.isActive,
        sortOrder: Number(countryForm.sortOrder) || 0,
        ...(isSuperAdmin ? { organizationId } : {}),
      };
      if (countryModal === 'edit' && editingCountry) {
        await getApiClient().updateMobileMoneyCountry(
          editingCountry.id,
          body,
          orgQuery,
        );
      } else {
        await getApiClient().createMobileMoneyCountry(body);
      }
      setCountryModal(null);
      await loadCountries(organizationId, isSuperAdmin);
    } catch (error) {
      setCountryError(getErrorMessage(error));
    } finally {
      setCountrySaving(false);
    }
  }

  async function saveOperator() {
    if (!selectedCountryId) return;
    const name = operatorForm.name.trim();
    if (!name) {
      setOperatorError(tMm('form.operatorNameRequired'));
      return;
    }
    setOperatorSaving(true);
    setOperatorError(null);
    try {
      const client = getApiClient();
      let operatorId = editingOperator?.id;
      if (operatorModal === 'edit' && editingOperator) {
        await client.updateMobileMoneyOperator(
          editingOperator.id,
          {
            name,
            isActive: operatorForm.isActive,
            sortOrder: Number(operatorForm.sortOrder) || 0,
          },
          orgQuery,
        );
      } else {
        const created = await client.createMobileMoneyOperator(
          {
            countryId: selectedCountryId,
            name,
            isActive: operatorForm.isActive,
            sortOrder: Number(operatorForm.sortOrder) || 0,
          },
          orgQuery,
        );
        operatorId = created.id;
      }
      if (pendingLogo && operatorId) {
        const formData = new FormData();
        formData.append('file', pendingLogo);
        await client.uploadMobileMoneyOperatorLogo(operatorId, formData, orgQuery);
      }
      setOperatorModal(null);
      clearLogoPreview();
      await loadOperators(selectedCountryId);
    } catch (error) {
      setOperatorError(getErrorMessage(error));
    } finally {
      setOperatorSaving(false);
    }
  }

  async function saveNumber() {
    if (!selectedOperatorId) return;
    const phone = numberForm.phoneE164.trim();
    if (!E164_RE.test(phone)) {
      setNumberError(tMm('form.phoneInvalid'));
      return;
    }
    setNumberSaving(true);
    setNumberError(null);
    try {
      const body = {
        phoneE164: phone,
        label: numberForm.label.trim() || null,
        isActive: numberForm.isActive,
        sortOrder: Number(numberForm.sortOrder) || 0,
      };
      if (numberModal === 'edit' && editingNumber) {
        await getApiClient().updateMobileMoneyPaymentNumber(
          editingNumber.id,
          body,
          orgQuery,
        );
      } else {
        await getApiClient().createMobileMoneyPaymentNumber(
          { ...body, operatorId: selectedOperatorId },
          orgQuery,
        );
      }
      setNumberModal(null);
      await loadNumbers(selectedOperatorId);
    } catch (error) {
      setNumberError(getErrorMessage(error));
    } finally {
      setNumberSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget || !organizationId) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const client = getApiClient();
      if (deleteTarget.kind === 'country') {
        await client.deleteMobileMoneyCountry(deleteTarget.row.id, orgQuery);
        if (selectedCountryId === deleteTarget.row.id) {
          setSelectedCountryId(null);
          setSelectedOperatorId(null);
        }
        await loadCountries(organizationId, isSuperAdmin);
      } else if (deleteTarget.kind === 'operator') {
        await client.deleteMobileMoneyOperator(deleteTarget.row.id, orgQuery);
        if (selectedOperatorId === deleteTarget.row.id) {
          setSelectedOperatorId(null);
        }
        if (selectedCountryId) await loadOperators(selectedCountryId);
      } else {
        await client.deleteMobileMoneyPaymentNumber(deleteTarget.row.id, orgQuery);
        if (selectedOperatorId) await loadNumbers(selectedOperatorId);
      }
      setDeleteTarget(null);
    } catch (error) {
      setDeleteError(getErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  }

  function handleLogoPick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_LOGO_TYPES.has(file.type)) {
      setOperatorError(tMm('form.logoInvalid'));
      event.target.value = '';
      return;
    }
    if (file.size > LOGO_MAX_BYTES) {
      setOperatorError(tMm('form.logoTooLarge'));
      event.target.value = '';
      return;
    }
    setOperatorError(null);
    setLogoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setPendingLogo(file);
  }

  const countryColumns = useMemo<ColumnDef<MobileMoneyCountry, unknown>[]>(
    () => [
      {
        accessorKey: 'code',
        header: tMm('columns.code'),
        cell: ({ row }) => (
          <button
            type="button"
            className={`font-mono text-sm ${
              selectedCountryId === row.original.id
                ? 'font-semibold text-primary'
                : 'text-atg-fg hover:text-primary'
            }`}
            onClick={() => setSelectedCountryId(row.original.id)}
          >
            {row.original.code}
          </button>
        ),
      },
      {
        accessorKey: 'name',
        header: tMm('columns.country'),
        cell: ({ row }) => (
          <button
            type="button"
            className={`text-left text-sm ${
              selectedCountryId === row.original.id
                ? 'font-semibold text-primary'
                : 'text-atg-fg hover:text-primary'
            }`}
            onClick={() => setSelectedCountryId(row.original.id)}
          >
            {row.original.name}
          </button>
        ),
      },
      {
        id: 'active',
        header: tMm('columns.active'),
        cell: ({ row }) =>
          row.original.isActive ? (
            <DataTableBadge variant="success">{tCommon('boolean.yes')}</DataTableBadge>
          ) : (
            <DataTableBadge variant="muted">{tCommon('boolean.no')}</DataTableBadge>
          ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) =>
          canWrite ? (
            <DataTableActions>
              <DataTableActionButton
                action="edit"
                onClick={() => openCountryModal('edit', row.original)}
              />
              <DataTableActionButton
                action="delete"
                onClick={() => setDeleteTarget({ kind: 'country', row: row.original })}
              />
            </DataTableActions>
          ) : null,
      },
    ],
    [canWrite, selectedCountryId, tCommon, tMm],
  );

  const operatorColumns = useMemo<ColumnDef<MobileMoneyOperator, unknown>[]>(
    () => [
      {
        id: 'logo',
        header: tMm('columns.logo'),
        cell: ({ row }) => {
          const url = row.original.logoUrl
            ? resolveMediaUrl(row.original.logoUrl)
            : null;
          return url ? (
            <img
              src={url}
              alt=""
              className="h-8 w-8 rounded object-contain"
            />
          ) : (
            <span className="text-atg-muted">{tCommon('empty.dash')}</span>
          );
        },
      },
      {
        accessorKey: 'name',
        header: tMm('columns.operator'),
        cell: ({ row }) => (
          <button
            type="button"
            className={`text-left text-sm ${
              selectedOperatorId === row.original.id
                ? 'font-semibold text-primary'
                : 'text-atg-fg hover:text-primary'
            }`}
            onClick={() => setSelectedOperatorId(row.original.id)}
          >
            {row.original.name}
          </button>
        ),
      },
      {
        id: 'active',
        header: tMm('columns.active'),
        cell: ({ row }) =>
          row.original.isActive ? (
            <DataTableBadge variant="success">{tCommon('boolean.yes')}</DataTableBadge>
          ) : (
            <DataTableBadge variant="muted">{tCommon('boolean.no')}</DataTableBadge>
          ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) =>
          canWrite ? (
            <DataTableActions>
              <DataTableActionButton
                action="edit"
                onClick={() => openOperatorModal('edit', row.original)}
              />
              <DataTableActionButton
                action="delete"
                onClick={() => setDeleteTarget({ kind: 'operator', row: row.original })}
              />
            </DataTableActions>
          ) : null,
      },
    ],
    [canWrite, selectedOperatorId, tCommon, tMm],
  );

  const numberColumns = useMemo<ColumnDef<MobileMoneyPaymentNumber, unknown>[]>(
    () => [
      {
        accessorKey: 'phoneE164',
        header: tMm('columns.phone'),
        cell: ({ row }) => (
          <span className="font-mono text-sm">{row.original.phoneE164}</span>
        ),
      },
      {
        accessorKey: 'label',
        header: tMm('columns.label'),
        cell: ({ row }) => row.original.label || tCommon('empty.dash'),
      },
      {
        id: 'active',
        header: tMm('columns.active'),
        cell: ({ row }) =>
          row.original.isActive ? (
            <DataTableBadge variant="success">{tCommon('boolean.yes')}</DataTableBadge>
          ) : (
            <DataTableBadge variant="muted">{tCommon('boolean.no')}</DataTableBadge>
          ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) =>
          canWrite ? (
            <DataTableActions>
              <DataTableActionButton
                action="edit"
                onClick={() => openNumberModal('edit', row.original)}
              />
              <DataTableActionButton
                action="delete"
                onClick={() => setDeleteTarget({ kind: 'number', row: row.original })}
              />
            </DataTableActions>
          ) : null,
      },
    ],
    [canWrite, tCommon, tMm],
  );

  const selectedOperator = operators.find((o) => o.id === selectedOperatorId);
  const operatorLogoSrc =
    logoPreview ||
    (selectedOperator?.logoUrl && operatorModal === 'edit'
      ? resolveMediaUrl(editingOperator?.logoUrl ?? selectedOperator.logoUrl)
      : editingOperator?.logoUrl
        ? resolveMediaUrl(editingOperator.logoUrl)
        : null);

  if (accessError) {
    return (
      <ParametresPageLayout>
        <div className="min-w-0">
          <AdminListPageHeader routePath="parametres/mobile-money" />
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {accessError}
          </p>
        </div>
      </ParametresPageLayout>
    );
  }

  if (!organizationId) {
    return (
      <ParametresPageLayout>
        <div className="min-w-0">
          <AdminListPageHeader routePath="parametres/mobile-money" />
          <p className="text-sm text-atg-muted">{t('form.loading')}</p>
        </div>
      </ParametresPageLayout>
    );
  }

  return (
    <>
      <ParametresPageLayout>
        <div className="min-w-0 space-y-8">
          <AdminListPageHeader routePath="parametres/mobile-money" />

          {isSuperAdmin && organizations.length > 0 ? (
            <OrganizationOrgSelector
              organizations={organizations}
              value={organizationId}
              onChange={handleOrganizationChange}
              label={tMm('list.orgSelectAria')}
              className="max-w-md"
            />
          ) : null}

          {listError ? (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {listError}
            </p>
          ) : null}

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-atg-fg">
                {tMm('sections.countries')}
              </h2>
              {canWrite ? (
                <Button onClick={() => openCountryModal('create')}>
                  {tMm('list.newCountry')}
                </Button>
              ) : null}
            </div>
            {!loadingCountries ? (
              <DataTable
                columns={countryColumns}
                data={countries}
                emptyMessage={tMm('list.emptyCountries')}
              />
            ) : (
              <p className="text-sm text-atg-muted">{t('form.loading')}</p>
            )}
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-atg-fg">
                {tMm('sections.operators')}
              </h2>
              {canWrite && selectedCountryId ? (
                <Button onClick={() => openOperatorModal('create')}>
                  {tMm('list.newOperator')}
                </Button>
              ) : null}
            </div>
            {!selectedCountryId ? (
              <p className="text-sm text-atg-muted">{tMm('list.selectCountry')}</p>
            ) : loadingOperators ? (
              <p className="text-sm text-atg-muted">{t('form.loading')}</p>
            ) : (
              <DataTable
                columns={operatorColumns}
                data={operators}
                emptyMessage={tMm('list.emptyOperators')}
              />
            )}
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-atg-fg">
                {tMm('sections.numbers')}
              </h2>
              {canWrite && selectedOperatorId ? (
                <Button onClick={() => openNumberModal('create')}>
                  {tMm('list.newNumber')}
                </Button>
              ) : null}
            </div>
            {!selectedOperatorId ? (
              <p className="text-sm text-atg-muted">{tMm('list.selectOperator')}</p>
            ) : loadingNumbers ? (
              <p className="text-sm text-atg-muted">{t('form.loading')}</p>
            ) : (
              <DataTable
                columns={numberColumns}
                data={numbers}
                emptyMessage={tMm('list.emptyNumbers')}
              />
            )}
          </section>
        </div>
      </ParametresPageLayout>

      <Modal
        open={countryModal !== null}
        onOpenChange={(open) => {
          if (!open) setCountryModal(null);
        }}
        title={
          countryModal === 'edit'
            ? tMm('form.editCountry')
            : tMm('form.createCountry')
        }
      >
        <div className="space-y-4">
          <label className="block space-y-1">
            <span className="text-sm font-medium text-atg-fg">{tMm('form.code')}</span>
            <Input
              value={countryForm.code}
              maxLength={2}
              onChange={(e) =>
                setCountryForm((prev) => ({
                  ...prev,
                  code: e.target.value.toUpperCase(),
                }))
              }
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-atg-fg">{tMm('form.name')}</span>
            <Input
              value={countryForm.name}
              onChange={(e) =>
                setCountryForm((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-atg-fg">
              {tMm('form.sortOrder')}
            </span>
            <Input
              type="number"
              min={0}
              value={countryForm.sortOrder}
              onChange={(e) =>
                setCountryForm((prev) => ({ ...prev, sortOrder: e.target.value }))
              }
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-atg-fg">
            <input
              type="checkbox"
              checked={countryForm.isActive}
              onChange={(e) =>
                setCountryForm((prev) => ({ ...prev, isActive: e.target.checked }))
              }
            />
            {tMm('form.isActive')}
          </label>
          {countryError ? (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {countryError}
            </p>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setCountryModal(null)}>
              {tMm('form.cancel')}
            </Button>
            <Button onClick={() => void saveCountry()} disabled={countrySaving}>
              {countrySaving ? tMm('form.saving') : tMm('form.save')}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={operatorModal !== null}
        onOpenChange={(open) => {
          if (!open) {
            setOperatorModal(null);
            clearLogoPreview();
          }
        }}
        title={
          operatorModal === 'edit'
            ? tMm('form.editOperator')
            : tMm('form.createOperator')
        }
      >
        <div className="space-y-4">
          <label className="block space-y-1">
            <span className="text-sm font-medium text-atg-fg">{tMm('form.name')}</span>
            <Input
              value={operatorForm.name}
              onChange={(e) =>
                setOperatorForm((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </label>
          <div className="space-y-2">
            <span className="text-sm font-medium text-atg-fg">{tMm('form.logo')}</span>
            {operatorLogoSrc ? (
              <img
                src={operatorLogoSrc}
                alt=""
                className="h-12 w-12 rounded object-contain"
              />
            ) : null}
            <input
              ref={logoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleLogoPick}
              className="block w-full text-sm text-atg-muted file:mr-3 file:rounded-md file:border-0 file:bg-atg-elevated file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-atg-fg"
            />
            <p className="text-xs text-atg-muted">{tMm('form.logoHint')}</p>
          </div>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-atg-fg">
              {tMm('form.sortOrder')}
            </span>
            <Input
              type="number"
              min={0}
              value={operatorForm.sortOrder}
              onChange={(e) =>
                setOperatorForm((prev) => ({ ...prev, sortOrder: e.target.value }))
              }
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-atg-fg">
            <input
              type="checkbox"
              checked={operatorForm.isActive}
              onChange={(e) =>
                setOperatorForm((prev) => ({ ...prev, isActive: e.target.checked }))
              }
            />
            {tMm('form.isActive')}
          </label>
          {operatorError ? (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {operatorError}
            </p>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setOperatorModal(null);
                clearLogoPreview();
              }}
            >
              {tMm('form.cancel')}
            </Button>
            <Button onClick={() => void saveOperator()} disabled={operatorSaving}>
              {operatorSaving ? tMm('form.saving') : tMm('form.save')}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={numberModal !== null}
        onOpenChange={(open) => {
          if (!open) setNumberModal(null);
        }}
        title={
          numberModal === 'edit'
            ? tMm('form.editNumber')
            : tMm('form.createNumber')
        }
      >
        <div className="space-y-4">
          <label className="block space-y-1">
            <span className="text-sm font-medium text-atg-fg">{tMm('form.phone')}</span>
            <Input
              value={numberForm.phoneE164}
              placeholder="+243970000000"
              onChange={(e) =>
                setNumberForm((prev) => ({ ...prev, phoneE164: e.target.value }))
              }
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-atg-fg">{tMm('form.label')}</span>
            <Input
              value={numberForm.label}
              onChange={(e) =>
                setNumberForm((prev) => ({ ...prev, label: e.target.value }))
              }
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-atg-fg">
              {tMm('form.sortOrder')}
            </span>
            <Input
              type="number"
              min={0}
              value={numberForm.sortOrder}
              onChange={(e) =>
                setNumberForm((prev) => ({ ...prev, sortOrder: e.target.value }))
              }
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-atg-fg">
            <input
              type="checkbox"
              checked={numberForm.isActive}
              onChange={(e) =>
                setNumberForm((prev) => ({ ...prev, isActive: e.target.checked }))
              }
            />
            {tMm('form.isActive')}
          </label>
          {numberError ? (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {numberError}
            </p>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setNumberModal(null)}>
              {tMm('form.cancel')}
            </Button>
            <Button onClick={() => void saveNumber()} disabled={numberSaving}>
              {numberSaving ? tMm('form.saving') : tMm('form.save')}
            </Button>
          </div>
        </div>
      </Modal>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
            setDeleteError(null);
          }
        }}
        title={tMm('list.deleteTitle')}
        description={tMm('list.deleteConfirm')}
        confirmLabel={tMm('list.deleteConfirmButton')}
        cancelLabel={tMm('list.cancel')}
        variant="danger"
        loading={deleting}
        error={deleteError}
        onConfirm={() => void confirmDelete()}
      />
    </>
  );
}

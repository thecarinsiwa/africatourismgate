'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';
import {
  AlertDialog,
  Button,
  Card,
  DataTableActionButton,
  DataTableActions,
  DataTableBadge,
  Input,
  Modal,
  StatCard,
} from '@africatourismgate/ui';
import type {
  MobileMoneyCountry,
  MobileMoneyOperator,
  MobileMoneyPaymentNumber,
  OrganizationListItem,
} from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSetAdminPageMeta } from '../admin-page-meta-context';
import { AdminListPageHeader } from '../pages/admin-list-page-header';
import { getApiClient } from '../../lib/auth/api';
import { resolveMediaUrl } from '../../lib/resolve-media-url';
import { OrganizationOrgSelector } from '../organizations/organization-org-selector';
import { ParametresPageLayout } from './parametres-subnav';
import { resolveInitialOrganizationId } from './organization-settings-form';

function selectableRowClass(selected: boolean): string {
  return [
    'group flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors',
    selected
      ? 'border-primary/40 bg-primary/5 ring-1 ring-primary/20'
      : 'border-transparent hover:border-atg-border hover:bg-atg-surface',
  ].join(' ');
}

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

  const selectedCountry = countries.find((c) => c.id === selectedCountryId) ?? null;
  const selectedOperator = operators.find((o) => o.id === selectedOperatorId) ?? null;

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
        <div className="min-w-0 space-y-6">
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              label={tMm('stats.countries')}
              value={String(countries.length)}
              status={loadingCountries ? 'loading' : 'ready'}
              subtitle={tMm('stats.countriesHint')}
              iconClassName="bg-atg-info-light text-atg-info"
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.75}
                    d="M12 21a9 9 0 100-18 9 9 0 000 18zM3.6 9h16.8M3.6 15h16.8M12 3a15 15 0 010 18M12 3a15 15 0 000 18"
                  />
                </svg>
              }
            />
            <StatCard
              label={tMm('stats.operators')}
              value={selectedCountryId ? String(operators.length) : '-'}
              status={
                !selectedCountryId
                  ? 'ready'
                  : loadingOperators
                    ? 'loading'
                    : 'ready'
              }
              subtitle={
                selectedCountry
                  ? tMm('stats.operatorsHint', { name: selectedCountry.name })
                  : tMm('list.selectCountry')
              }
              iconClassName="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.75}
                    d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
                  />
                </svg>
              }
            />
            <StatCard
              label={tMm('stats.numbers')}
              value={selectedOperatorId ? String(numbers.length) : '-'}
              status={
                !selectedOperatorId
                  ? 'ready'
                  : loadingNumbers
                    ? 'loading'
                    : 'ready'
              }
              subtitle={
                selectedOperator
                  ? tMm('stats.numbersHint', { name: selectedOperator.name })
                  : tMm('list.selectOperator')
              }
              iconClassName="bg-atg-success-light text-atg-success"
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.75}
                    d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                  />
                </svg>
              }
            />
          </div>

          {(selectedCountry || selectedOperator) && (
            <p className="text-sm text-atg-muted">
              <span className="font-medium text-atg-fg">{tMm('sections.countries')}</span>
              {selectedCountry ? (
                <>
                  <span className="mx-1.5 text-atg-border" aria-hidden>
                    /
                  </span>
                  <span className="font-medium text-atg-fg">
                    {selectedCountry.name}
                  </span>
                  <span className="ml-1.5 font-mono text-xs uppercase text-atg-muted">
                    ({selectedCountry.code})
                  </span>
                </>
              ) : null}
              {selectedOperator ? (
                <>
                  <span className="mx-1.5 text-atg-border" aria-hidden>
                    /
                  </span>
                  <span className="font-medium text-atg-fg">
                    {selectedOperator.name}
                  </span>
                </>
              ) : null}
            </p>
          )}

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3 xl:items-start">
            <Card variant="dashboard" padding="sm" className="min-w-0">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-semibold text-atg-fg">
                    {tMm('sections.countries')}
                  </h2>
                  <p className="text-xs text-atg-muted">{tMm('panels.countriesHint')}</p>
                </div>
                {canWrite ? (
                  <Button size="sm" onClick={() => openCountryModal('create')}>
                    {tMm('list.newCountry')}
                  </Button>
                ) : null}
              </div>
              {loadingCountries ? (
                <p className="text-sm text-atg-muted">{t('form.loading')}</p>
              ) : countries.length === 0 ? (
                <p className="rounded-lg border border-dashed border-atg-border px-3 py-6 text-center text-sm text-atg-muted">
                  {tMm('list.emptyCountries')}
                </p>
              ) : (
                <ul className="max-h-[28rem] space-y-1 overflow-y-auto">
                  {countries.map((country) => {
                    const selected = country.id === selectedCountryId;
                    return (
                      <li key={country.id}>
                        <div className={selectableRowClass(selected)}>
                          <button
                            type="button"
                            className="min-w-0 flex-1 text-left"
                            onClick={() => {
                              setSelectedCountryId(country.id);
                              setSelectedOperatorId(null);
                              setNumbers([]);
                            }}
                            aria-pressed={selected}
                          >
                            <div className="flex items-center gap-2">
                              <span className="rounded bg-atg-surface px-1.5 py-0.5 font-mono text-xs font-semibold uppercase text-atg-fg">
                                {country.code}
                              </span>
                              <span
                                className={`truncate text-sm ${
                                  selected ? 'font-semibold text-atg-fg' : 'text-atg-fg'
                                }`}
                              >
                                {country.name}
                              </span>
                            </div>
                            <div className="mt-1">
                              {country.isActive ? (
                                <DataTableBadge variant="success">
                                  {tCommon('boolean.yes')}
                                </DataTableBadge>
                              ) : (
                                <DataTableBadge variant="muted">
                                  {tCommon('boolean.no')}
                                </DataTableBadge>
                              )}
                            </div>
                          </button>
                          {canWrite ? (
                            <div
                              className="shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => e.stopPropagation()}
                            >
                              <DataTableActions>
                                <DataTableActionButton
                                  action="edit"
                                  onClick={() => openCountryModal('edit', country)}
                                />
                                <DataTableActionButton
                                  action="delete"
                                  onClick={() =>
                                    setDeleteTarget({ kind: 'country', row: country })
                                  }
                                />
                              </DataTableActions>
                            </div>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>

            <Card variant="dashboard" padding="sm" className="min-w-0">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold text-atg-fg">
                    {tMm('sections.operators')}
                  </h2>
                  <p className="truncate text-xs text-atg-muted">
                    {selectedCountry
                      ? tMm('panels.operatorsFor', { name: selectedCountry.name })
                      : tMm('list.selectCountry')}
                  </p>
                </div>
                {canWrite && selectedCountryId ? (
                  <Button size="sm" onClick={() => openOperatorModal('create')}>
                    {tMm('list.newOperator')}
                  </Button>
                ) : null}
              </div>
              {!selectedCountryId ? (
                <p className="rounded-lg border border-dashed border-atg-border px-3 py-6 text-center text-sm text-atg-muted">
                  {tMm('list.selectCountry')}
                </p>
              ) : loadingOperators ? (
                <p className="text-sm text-atg-muted">{t('form.loading')}</p>
              ) : operators.length === 0 ? (
                <p className="rounded-lg border border-dashed border-atg-border px-3 py-6 text-center text-sm text-atg-muted">
                  {tMm('list.emptyOperators')}
                </p>
              ) : (
                <ul className="max-h-[28rem] space-y-1 overflow-y-auto">
                  {operators.map((operator) => {
                    const selected = operator.id === selectedOperatorId;
                    const logoUrl = operator.logoUrl
                      ? resolveMediaUrl(operator.logoUrl)
                      : null;
                    return (
                      <li key={operator.id}>
                        <div className={selectableRowClass(selected)}>
                          <button
                            type="button"
                            className="flex min-w-0 flex-1 items-center gap-3 text-left"
                            onClick={() => setSelectedOperatorId(operator.id)}
                            aria-pressed={selected}
                          >
                            {logoUrl ? (
                              <img
                                src={logoUrl}
                                alt=""
                                className="h-9 w-9 shrink-0 rounded-md border border-atg-border bg-atg-surface object-contain p-0.5"
                              />
                            ) : (
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-dashed border-atg-border text-xs text-atg-muted">
                                {tCommon('empty.dash')}
                              </span>
                            )}
                            <span className="min-w-0 flex-1">
                              <span
                                className={`block truncate text-sm ${
                                  selected ? 'font-semibold text-atg-fg' : 'text-atg-fg'
                                }`}
                              >
                                {operator.name}
                              </span>
                              <span className="mt-1 block">
                                {operator.isActive ? (
                                  <DataTableBadge variant="success">
                                    {tCommon('boolean.yes')}
                                  </DataTableBadge>
                                ) : (
                                  <DataTableBadge variant="muted">
                                    {tCommon('boolean.no')}
                                  </DataTableBadge>
                                )}
                              </span>
                            </span>
                          </button>
                          {canWrite ? (
                            <div className="shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                              <DataTableActions>
                                <DataTableActionButton
                                  action="edit"
                                  onClick={() => openOperatorModal('edit', operator)}
                                />
                                <DataTableActionButton
                                  action="delete"
                                  onClick={() =>
                                    setDeleteTarget({ kind: 'operator', row: operator })
                                  }
                                />
                              </DataTableActions>
                            </div>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>

            <Card variant="dashboard" padding="sm" className="min-w-0">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold text-atg-fg">
                    {tMm('sections.numbers')}
                  </h2>
                  <p className="truncate text-xs text-atg-muted">
                    {selectedOperator
                      ? tMm('panels.numbersFor', { name: selectedOperator.name })
                      : tMm('list.selectOperator')}
                  </p>
                </div>
                {canWrite && selectedOperatorId ? (
                  <Button size="sm" onClick={() => openNumberModal('create')}>
                    {tMm('list.newNumber')}
                  </Button>
                ) : null}
              </div>
              {!selectedOperatorId ? (
                <p className="rounded-lg border border-dashed border-atg-border px-3 py-6 text-center text-sm text-atg-muted">
                  {tMm('list.selectOperator')}
                </p>
              ) : loadingNumbers ? (
                <p className="text-sm text-atg-muted">{t('form.loading')}</p>
              ) : numbers.length === 0 ? (
                <p className="rounded-lg border border-dashed border-atg-border px-3 py-6 text-center text-sm text-atg-muted">
                  {tMm('list.emptyNumbers')}
                </p>
              ) : (
                <ul className="max-h-[28rem] space-y-1 overflow-y-auto">
                  {numbers.map((number) => (
                    <li key={number.id}>
                      <div className="flex items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 hover:border-atg-border hover:bg-atg-surface">
                        <div className="min-w-0 flex-1">
                          <p className="font-mono text-sm text-atg-fg">
                            {number.phoneE164}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-atg-muted">
                            {number.label || tCommon('empty.dash')}
                          </p>
                          <div className="mt-1">
                            {number.isActive ? (
                              <DataTableBadge variant="success">
                                {tCommon('boolean.yes')}
                              </DataTableBadge>
                            ) : (
                              <DataTableBadge variant="muted">
                                {tCommon('boolean.no')}
                              </DataTableBadge>
                            )}
                          </div>
                        </div>
                        {canWrite ? (
                          <div className="shrink-0">
                            <DataTableActions>
                              <DataTableActionButton
                                action="edit"
                                onClick={() => openNumberModal('edit', number)}
                              />
                              <DataTableActionButton
                                action="delete"
                                onClick={() =>
                                  setDeleteTarget({ kind: 'number', row: number })
                                }
                              />
                            </DataTableActions>
                          </div>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
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

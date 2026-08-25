'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import type { Organization } from '@africatourismgate/types';
import {
  Button,
  Card,
  DataTableBadge,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TextLink,
} from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { EmployeesList } from '../employees/employees-list';
import { AdminPageBackLink } from '../admin-page-back-link';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { getApiClient } from '../../lib/auth/api';
import {
  useAccountStatusLabels,
  useFormatDateTime,
  useOrganizationLegalFormOptions,
} from '../../lib/i18n/use-module-labels';
import {
  formatOrganizationLegalForm,
  organizationStatusVariants,
} from '../../lib/organization-display';
import { OrganizationLogoField } from './organization-logo-field';

const ORGANISATIONS_HUB_HREF = '/organisations';

type OrganizationViewPageProps = {
  organizationId: string;
};

const TAB_VALUES = ['infos', 'users'] as const;
type TabValue = (typeof TAB_VALUES)[number];

function isTabValue(value: string | null): value is TabValue {
  return value !== null && (TAB_VALUES as readonly string[]).includes(value);
}

function MetaItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium uppercase tracking-wide text-atg-muted">{label}</dt>
      <dd className="mt-1 break-words text-sm font-medium text-atg-fg">{value}</dd>
    </div>
  );
}

function ProfileField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid gap-1 py-3 first:pt-0 last:pb-0 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:gap-4">
      <dt className="text-xs font-medium uppercase tracking-wide text-atg-muted sm:pt-0.5">
        {label}
      </dt>
      <dd className="min-w-0 break-words text-sm font-medium text-atg-fg">{value}</dd>
    </div>
  );
}

function ProfileSection({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card variant="dashboard" padding="md" className={className}>
      <h3 className="text-sm font-semibold tracking-tight text-atg-fg">{title}</h3>
      <dl className="mt-3 divide-y divide-atg-border/70">{children}</dl>
    </Card>
  );
}

export function OrganizationViewPage({ organizationId }: OrganizationViewPageProps) {
  const { organizations: getOrganizationsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.organizations.detail');
  const tForm = useTranslations('modules.organizations.form');
  const tPages = useTranslations('pages.organisations.id.voir');
  const tCommon = useTranslations('modules.common');
  const accountStatusLabels = useAccountStatusLabels();
  const legalFormOptions = useOrganizationLegalFormOptions();
  const formatDateTime = useFormatDateTime();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab: TabValue = isTabValue(tabParam) ? tabParam : 'infos';

  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; organization: Organization }
  >({ status: 'loading' });

  useAdminEditPageMeta({
    ready: state.status === 'ready',
    title: t('viewTitle'),
    entityLabel: state.status === 'ready' ? state.organization.name : undefined,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadOrganization() {
      try {
        const organization = await getApiClient().getOrganization(organizationId);
        if (!cancelled) {
          setState({ status: 'ready', organization });
        }
      } catch (error) {
        if (!cancelled) {
          setState({ status: 'error', message: getOrganizationsErrorMessage(error) });
        }
      }
    }

    void loadOrganization();
    return () => {
      cancelled = true;
    };
  }, [organizationId, getOrganizationsErrorMessage]);

  const handleTabChange = useCallback(
    (tab: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (tab === 'infos') {
        params.delete('tab');
      } else {
        params.set('tab', tab);
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  if (state.status === 'loading') {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-44 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-72 w-full" />
        <p className="sr-only">{tCommon('loading')}</p>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-4">
        <AdminPageBackLink
          href={ORGANISATIONS_HUB_HREF}
          label={tPages('backLabel')}
          className="block"
        />
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
      </div>
    );
  }

  const { organization } = state;
  const legalFormLabel = formatOrganizationLegalForm(
    organization.legalForm,
    legalFormOptions,
    tCommon('empty.dash'),
  );
  const emptyDash = tCommon('empty.dash');
  const websiteHref = organization.website?.trim();
  const displayOrDash = (value: string | null | undefined) => {
    const trimmed = value?.trim();
    return trimmed || emptyDash;
  };
  const description = organization.description?.trim() || '';

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <AdminPageBackLink
        href={ORGANISATIONS_HUB_HREF}
        label={tPages('backLabel')}
        className="block"
      />

      <section className="overflow-hidden rounded-2xl border border-atg-border bg-atg-elevated shadow-sm">
        <div className="border-b border-atg-border bg-gradient-to-br from-atg-surface via-atg-elevated to-atg-surface px-5 py-5 sm:px-6 sm:py-6">
          <div className="flex items-start gap-4 sm:gap-5">
            <OrganizationLogoField
              organizationId={organizationId}
              name={organization.name}
              organizationLogoUrl={organization.logoUrl}
              canWrite={false}
              isSuperAdmin={false}
              className="shrink-0"
            />

            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-semibold tracking-tight text-atg-fg sm:text-2xl">
                      {organization.name}
                    </h2>
                    <DataTableBadge variant={organizationStatusVariants[organization.status]}>
                      {accountStatusLabels[organization.status]}
                    </DataTableBadge>
                    {organization.legalForm ? (
                      <DataTableBadge variant="muted">{legalFormLabel}</DataTableBadge>
                    ) : null}
                  </div>
                  <p className="font-mono text-sm text-atg-muted">{organization.slug}</p>
                  {description ? (
                    <p className="line-clamp-2 max-w-2xl pt-1 text-sm leading-relaxed text-atg-muted">
                      {description}
                    </p>
                  ) : null}
                </div>

                <Button
                  href={`/organisations/${organizationId}`}
                  variant="primary"
                  className="shrink-0 self-stretch sm:self-start"
                >
                  {t('editButton')}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <dl className="grid gap-4 border-t border-atg-border/80 bg-atg-surface/40 px-5 py-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          <MetaItem label={t('meta.currency')} value={organization.currency} />
          <MetaItem
            label={t('meta.contact')}
            value={
              <>
                <span className="block">{displayOrDash(organization.contactEmail)}</span>
                {organization.contactPhone?.trim() ? (
                  <span className="mt-0.5 block font-normal text-atg-muted">
                    {organization.contactPhone.trim()}
                  </span>
                ) : null}
              </>
            }
          />
          <MetaItem
            label={t('meta.website')}
            value={
              websiteHref ? (
                <TextLink
                  href={websiteHref}
                  variant="primary"
                  className="break-all font-medium"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {websiteHref.replace(/^https?:\/\//i, '')}
                </TextLink>
              ) : (
                emptyDash
              )
            }
          />
          <MetaItem
            label={t('meta.createdAt')}
            value={
              <span className="tabular-nums">{formatDateTime(organization.createdAt)}</span>
            }
          />
        </dl>
      </section>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <div className="overflow-x-auto rounded-xl border border-atg-border bg-atg-elevated p-1.5">
          <TabsList aria-label={t('tabsAria')} className="w-full justify-start">
            <TabsTrigger value="infos">{t('tabs.infos')}</TabsTrigger>
            <TabsTrigger value="users">{t('tabs.users')}</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="infos" className="outline-none">
          <div className="grid gap-4 lg:grid-cols-2">
            <ProfileSection title={tForm('sections.identity')}>
              <ProfileField label={tForm('name')} value={organization.name} />
              <ProfileField
                label={tForm('slug')}
                value={<span className="font-mono text-sm">{organization.slug}</span>}
              />
              <ProfileField
                label={tForm('description')}
                value={
                  description ? (
                    <span className="whitespace-pre-wrap font-normal leading-relaxed">
                      {description}
                    </span>
                  ) : (
                    emptyDash
                  )
                }
              />
            </ProfileSection>

            <ProfileSection title={tForm('sections.contact')}>
              <ProfileField
                label={tForm('website')}
                value={
                  websiteHref ? (
                    <TextLink
                      href={websiteHref}
                      variant="primary"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {websiteHref}
                    </TextLink>
                  ) : (
                    emptyDash
                  )
                }
              />
              <ProfileField
                label={tForm('contactEmail')}
                value={displayOrDash(organization.contactEmail)}
              />
              <ProfileField
                label={tForm('contactPhone')}
                value={displayOrDash(organization.contactPhone)}
              />
            </ProfileSection>

            <ProfileSection title={tForm('sections.legal')}>
              <ProfileField label={tForm('legalForm')} value={legalFormLabel} />
              <ProfileField label={tForm('rccm')} value={displayOrDash(organization.rccm)} />
              <ProfileField label={tForm('idNat')} value={displayOrDash(organization.idNat)} />
              <ProfileField label={tForm('nif')} value={displayOrDash(organization.nif)} />
              <ProfileField label={tForm('cnss')} value={displayOrDash(organization.cnss)} />
            </ProfileSection>

            <ProfileSection title={tForm('sections.configuration')}>
              <ProfileField label={tForm('currency')} value={organization.currency} />
              <ProfileField
                label={tForm('status')}
                value={
                  <DataTableBadge variant={organizationStatusVariants[organization.status]}>
                    {accountStatusLabels[organization.status]}
                  </DataTableBadge>
                }
              />
            </ProfileSection>
          </div>
        </TabsContent>

        <TabsContent value="users" className="outline-none">
          <EmployeesList lockedOrganizationId={organizationId} embedded />
        </TabsContent>
      </Tabs>
    </div>
  );
}

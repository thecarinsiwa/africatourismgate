'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';
import { useEmployeeStatusLabels } from '../../lib/i18n/use-module-labels';

import type { Employee, EmployeeStatus, Organization } from '@africatourismgate/types';
import {
  Avatar,
  Button,
  Card,
  DataTableBadge,
  Skeleton,
} from '@africatourismgate/ui';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { AdminPageBackLink } from '../admin-page-back-link';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { getApiClient } from '../../lib/auth/api';

type EmployeeViewPageProps = {
  employeeId: string;
};

const statusVariants: Record<EmployeeStatus, 'success' | 'muted' | 'danger'> = {
  active: 'success',
  on_leave: 'muted',
  terminated: 'danger',
};

function ProfileField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid gap-1 py-3.5 first:pt-0 last:pb-0 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-4">
      <dt className="text-xs font-medium uppercase tracking-wide text-atg-muted sm:pt-0.5">
        {label}
      </dt>
      <dd className="min-w-0 text-sm font-medium text-atg-fg break-words">{value}</dd>
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-medium uppercase tracking-wide text-atg-muted">{label}</p>
      <p className="mt-0.5 truncate text-sm font-medium text-atg-fg">{value}</p>
    </div>
  );
}

export function EmployeeViewPage({ employeeId }: EmployeeViewPageProps) {
  const { employees: getEmployeesErrorMessage } = useAdminErrorMessages();
  const tDetail = useTranslations('modules.employees.detail');
  const tPages = useTranslations('pages.utilisateurs.employes');
  const tActions = useTranslations('common.actions');
  const tEmpty = useTranslations('modules.common.empty');
  const statusLabels = useEmployeeStatusLabels();
  const locale = useLocale();
  const emptyDash = tEmpty('dash');

  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; employee: Employee; organization: Organization | null }
  >({ status: 'loading' });

  const employeeLabel =
    state.status === 'ready'
      ? state.employee.user != null
        ? `${state.employee.user.firstName} ${state.employee.user.lastName}`
        : (state.employee.employeeCode ?? tDetail('fallbackLabel'))
      : undefined;

  useAdminEditPageMeta({
    ready: state.status === 'ready',
    title: tDetail('viewTitle'),
    entityLabel: employeeLabel,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const client = getApiClient();
        const employee = await client.getEmployee(employeeId);
        const organization = employee.organizationId
          ? await client.getOrganization(employee.organizationId).catch(() => null)
          : null;
        if (!cancelled) {
          setState({ status: 'ready', employee, organization });
        }
      } catch (error) {
        if (!cancelled) {
          setState({ status: 'error', message: getEmployeesErrorMessage(error) });
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [employeeId, getEmployeesErrorMessage]);

  const formatDate = useCallback(
    (iso: string | null | undefined) => {
      if (!iso) return emptyDash;
      const date = new Date(iso);
      if (Number.isNaN(date.getTime())) return iso;
      return date.toLocaleDateString(locale, { dateStyle: 'medium' });
    },
    [emptyDash, locale],
  );

  const formatDateTime = useCallback(
    (iso: string | null | undefined) => {
      if (!iso) return emptyDash;
      const date = new Date(iso);
      if (Number.isNaN(date.getTime())) return iso;
      return date.toLocaleString(locale, {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    },
    [emptyDash, locale],
  );

  if (state.status === 'loading') {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-4">
        <AdminPageBackLink
          href="/utilisateurs/employes"
          label={tPages('nouveau.backLabel')}
        />
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
        <Link
          href="/utilisateurs/employes"
          className="text-sm font-medium text-primary hover:text-primary-hover"
        >
          ← {tActions('back')}
        </Link>
      </div>
    );
  }

  const { employee, organization } = state;
  const fullName = employee.user
    ? `${employee.user.firstName} ${employee.user.lastName}`.trim()
    : null;
  const email = employee.user?.email;
  const organizationLabel =
    organization?.name ??
    (employee.organizationId ? employee.organizationId.slice(0, 8) : emptyDash);
  const salaryLabel =
    employee.salary != null && employee.salary !== ''
      ? `${employee.salary}${employee.currency ? ` ${employee.currency}` : ''}`
      : emptyDash;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <AdminPageBackLink
        href="/utilisateurs/employes"
        label={tPages('nouveau.backLabel')}
        className="block"
      />

      <section className="overflow-hidden rounded-2xl border border-atg-border bg-atg-elevated shadow-sm">
        <div className="border-b border-atg-border bg-gradient-to-br from-atg-surface via-atg-elevated to-atg-surface px-5 py-5 sm:px-6 sm:py-6">
          <div className="flex items-start gap-4 sm:gap-5">
            <Avatar
              email={email ?? employee.userId}
              firstName={employee.user?.firstName}
              lastName={employee.user?.lastName}
              size="lg"
              className="shrink-0 ring-2 ring-atg-border/60 ring-offset-2 ring-offset-atg-elevated"
            />

            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-semibold tracking-tight text-atg-fg sm:text-2xl">
                      {fullName || employee.employeeCode || tDetail('fallbackLabel')}
                    </h2>
                    <DataTableBadge variant={statusVariants[employee.status]}>
                      {statusLabels[employee.status]}
                    </DataTableBadge>
                  </div>
                  {email ? (
                    <p className="truncate text-sm text-atg-muted">{email}</p>
                  ) : null}
                  {employee.jobTitle ? (
                    <p className="text-sm text-atg-fg">{employee.jobTitle}</p>
                  ) : null}
                </div>

                <Button
                  href={`/utilisateurs/employes/${employeeId}`}
                  className="shrink-0 self-stretch sm:self-start"
                >
                  {tDetail('editButton')}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 border-t border-atg-border/80 bg-atg-surface/40 px-5 py-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          <MetaItem label={tDetail('fields.employeeCode')} value={employee.employeeCode || emptyDash} />
          <MetaItem label={tDetail('fields.organization')} value={organizationLabel} />
          <MetaItem label={tDetail('fields.department')} value={employee.department || emptyDash} />
          <MetaItem label={tDetail('fields.hireDate')} value={formatDate(employee.hireDate)} />
        </div>
      </section>

      <Card variant="dashboard" padding="lg" className="border border-atg-border/80">
        <h3 className="mb-1 text-base font-semibold text-atg-fg">{tDetail('sections.info')}</h3>
        <p className="mb-4 text-sm text-atg-muted">{tDetail('profileIntro')}</p>
        <dl className="divide-y divide-atg-border">
          <ProfileField
            label={tDetail('fields.linkedUser')}
            value={
              employee.user ? (
                <Link
                  href={`/utilisateurs/${employee.userId}/voir`}
                  className="font-medium text-primary hover:underline"
                >
                  {fullName}
                  {email ? (
                    <span className="mt-0.5 block font-normal text-atg-muted">{email}</span>
                  ) : null}
                </Link>
              ) : (
                employee.userId
              )
            }
          />
          <ProfileField
            label={tDetail('fields.status')}
            value={
              <DataTableBadge variant={statusVariants[employee.status]}>
                {statusLabels[employee.status]}
              </DataTableBadge>
            }
          />
          <ProfileField
            label={tDetail('fields.organization')}
            value={
              organization ? (
                <Link
                  href={`/organisations/${organization.id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {organization.name}
                </Link>
              ) : (
                organizationLabel
              )
            }
          />
          <ProfileField
            label={tDetail('fields.employeeCode')}
            value={employee.employeeCode || emptyDash}
          />
          <ProfileField
            label={tDetail('fields.jobTitle')}
            value={employee.jobTitle || emptyDash}
          />
          <ProfileField
            label={tDetail('fields.department')}
            value={employee.department || emptyDash}
          />
          <ProfileField
            label={tDetail('fields.hireDate')}
            value={formatDate(employee.hireDate)}
          />
          <ProfileField
            label={tDetail('fields.terminationDate')}
            value={formatDate(employee.terminationDate)}
          />
          <ProfileField label={tDetail('fields.salary')} value={salaryLabel} />
          <ProfileField
            label={tDetail('fields.createdAt')}
            value={formatDateTime(employee.createdAt)}
          />
          <ProfileField
            label={tDetail('fields.updatedAt')}
            value={formatDateTime(employee.updatedAt)}
          />
        </dl>
      </Card>
    </div>
  );
}

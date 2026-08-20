'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import type { Employee } from '@africatourismgate/types';
import { Button } from '@africatourismgate/ui';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { AdminPageBackLink } from '../admin-page-back-link';
import { useEffect, useState } from 'react';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { getApiClient } from '../../lib/auth/api';
import { EmployeeForm } from './employee-form';

type EmployeeEditPageProps = {
  employeeId: string;
};

export function EmployeeEditPage({ employeeId }: EmployeeEditPageProps) {
  const { employees: getEmployeesErrorMessage } = useAdminErrorMessages();
  const tDetail = useTranslations('modules.employees.detail');
  const tPages = useTranslations('pages.utilisateurs.employes');
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; employee: Employee }
  >({ status: 'loading' });

  const employeeLabel =
    state.status === 'ready'
      ? state.employee.user != null
        ? `${state.employee.user.firstName} ${state.employee.user.lastName}`
        : (state.employee.employeeCode ?? tDetail('fallbackLabel'))
      : undefined;

  useAdminEditPageMeta({
    ready: state.status === 'ready',
    title: tPages('id.metaTitle'),
    entityLabel: employeeLabel,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const employee = await getApiClient().getEmployee(employeeId);
        if (!cancelled) {
          setState({ status: 'ready', employee });
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

  if (state.status === 'loading') {
    return <p className="text-sm text-atg-muted">Chargement…</p>;
  }

  if (state.status === 'error') {
    return (
      <div className="space-y-4">
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
        <Link
          href="/utilisateurs/employes"
          className="text-sm font-medium text-primary hover:text-primary-hover"
        >
          ← {tPages('nouveau.backLabel')}
        </Link>
      </div>
    );
  }

  const { employee } = state;

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <AdminPageBackLink
          href="/utilisateurs/employes"
          label={tPages('nouveau.backLabel')}
        />
        <Button href={`/utilisateurs/employes/${employeeId}/voir`} variant="outline">
          {tDetail('viewButton')}
        </Button>
      </div>
      <EmployeeForm mode="edit" employeeId={employeeId} initialEmployee={employee} />
    </div>
  );
}

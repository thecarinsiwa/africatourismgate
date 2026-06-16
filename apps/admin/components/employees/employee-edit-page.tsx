'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import type { Employee } from '@africatourismgate/types';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { getApiClient } from '../../lib/auth/api';
import { EmployeeForm } from './employee-form';

type EmployeeEditPageProps = {
  employeeId: string;
};

export function EmployeeEditPage({ employeeId }: EmployeeEditPageProps) {
  const { employees: getEmployeesErrorMessage } = useAdminErrorMessages();
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; employee: Employee }
  >({ status: 'loading' });

  const employeeLabel =
    state.status === 'ready'
      ? state.employee.user != null
        ? `${state.employee.user.firstName} ${state.employee.user.lastName}`
        : (state.employee.employeeCode ?? 'Employé')
      : undefined;

  useAdminEditPageMeta({
    ready: state.status === 'ready',
    title: "Modifier l'employé",
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
  }, [employeeId]);

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
          ← Retour à la liste
        </Link>
      </div>
    );
  }

  const { employee } = state;

  return (
    <div>
      <EmployeeForm mode="edit" employeeId={employeeId} initialEmployee={employee} />
    </div>
  );
}

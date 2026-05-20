'use client';

import type { Employee } from '@africatourismgate/types';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { getEmployeesErrorMessage } from '../../lib/employees-errors';
import { EmployeeForm } from './employee-form';

type EmployeeEditPageProps = {
  employeeId: string;
};

export function EmployeeEditPage({ employeeId }: EmployeeEditPageProps) {
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; employee: Employee }
  >({ status: 'loading' });

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
  const title =
    employee.user != null
      ? `${employee.user.firstName} ${employee.user.lastName}`
      : employee.employeeCode ?? 'Employé';

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atg-fg">Modifier l’employé</h1>
        <p className="mt-2 text-sm text-atg-muted">{title}</p>
      </div>
      <EmployeeForm mode="edit" employeeId={employeeId} initialEmployee={employee} />
    </div>
  );
}

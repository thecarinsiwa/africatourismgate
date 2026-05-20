'use client';

import { Button, Input } from '@africatourismgate/ui';
import type {
  CreateEmployeeRequest,
  Employee,
  EmployeeStatus,
  Organization,
  UpdateEmployeeRequest,
  User,
} from '@africatourismgate/types';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { getEmployeesErrorMessage } from '../../lib/employees-errors';

export type EmployeeFormValues = {
  userId: string;
  organizationId: string;
  employeeCode: string;
  jobTitle: string;
  department: string;
  hireDate: string;
  terminationDate: string;
  salary: string;
  currency: string;
  managerId: string;
  status: EmployeeStatus;
};

const defaultValues: EmployeeFormValues = {
  userId: '',
  organizationId: '',
  employeeCode: '',
  jobTitle: '',
  department: '',
  hireDate: '',
  terminationDate: '',
  salary: '',
  currency: 'USD',
  managerId: '',
  status: 'active',
};

function employeeToFormValues(employee: Employee): EmployeeFormValues {
  return {
    userId: employee.userId,
    organizationId: employee.organizationId ?? '',
    employeeCode: employee.employeeCode ?? '',
    jobTitle: employee.jobTitle ?? '',
    department: employee.department ?? '',
    hireDate: employee.hireDate ?? '',
    terminationDate: employee.terminationDate ?? '',
    salary: employee.salary ?? '',
    currency: employee.currency ?? 'USD',
    managerId: employee.managerId ?? '',
    status: employee.status,
  };
}

function toCreatePayload(values: EmployeeFormValues): CreateEmployeeRequest {
  const salary = values.salary.trim() ? Number.parseFloat(values.salary) : undefined;
  return {
    userId: values.userId,
    status: values.status,
    ...(values.organizationId ? { organizationId: values.organizationId } : {}),
    ...(values.employeeCode.trim() ? { employeeCode: values.employeeCode.trim() } : {}),
    ...(values.jobTitle.trim() ? { jobTitle: values.jobTitle.trim() } : {}),
    ...(values.department.trim() ? { department: values.department.trim() } : {}),
    ...(values.hireDate ? { hireDate: values.hireDate } : {}),
    ...(values.terminationDate ? { terminationDate: values.terminationDate } : {}),
    ...(salary !== undefined && !Number.isNaN(salary) ? { salary } : {}),
    ...(values.currency.trim() ? { currency: values.currency.trim() } : {}),
    ...(values.managerId ? { managerId: values.managerId } : {}),
  };
}

function toUpdatePayload(values: EmployeeFormValues): UpdateEmployeeRequest {
  const salaryRaw = values.salary.trim();
  const salary =
    salaryRaw === ''
      ? null
      : Number.isNaN(Number.parseFloat(salaryRaw))
        ? undefined
        : Number.parseFloat(salaryRaw);

  return {
    userId: values.userId,
    status: values.status,
    organizationId: values.organizationId ? values.organizationId : null,
    employeeCode: values.employeeCode.trim() ? values.employeeCode.trim() : null,
    jobTitle: values.jobTitle.trim() ? values.jobTitle.trim() : null,
    department: values.department.trim() ? values.department.trim() : null,
    hireDate: values.hireDate || null,
    terminationDate: values.terminationDate || null,
    ...(salary !== undefined ? { salary } : {}),
    currency: values.currency.trim() ? values.currency.trim() : null,
    managerId: values.managerId ? values.managerId : null,
  };
}

type EmployeeFormProps = {
  mode: 'create' | 'edit';
  employeeId?: string;
  initialEmployee?: Employee;
};

export function EmployeeForm({ mode, employeeId, initialEmployee }: EmployeeFormProps) {
  const router = useRouter();
  const userId = useId();
  const orgId = useId();
  const managerId = useId();
  const statusId = useId();
  const [values, setValues] = useState<EmployeeFormValues>(() =>
    initialEmployee ? employeeToFormValues(initialEmployee) : defaultValues,
  );
  const [users, setUsers] = useState<User[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [managers, setManagers] = useState<Employee[]>([]);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof EmployeeFormValues, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadLookups() {
      try {
        const client = getApiClient();
        const [usersResult, orgsResult, employeesResult] = await Promise.all([
          client.listUsers({ page: 1, limit: 100, status: 'active' }),
          client.listOrganizations({ page: 1, limit: 100 }),
          client.listEmployees({ page: 1, limit: 100 }),
        ]);
        if (!cancelled) {
          setUsers(usersResult.data);
          setOrganizations(orgsResult.data);
          setManagers(
            employeesResult.data.filter((e) => e.id !== employeeId && e.status !== 'terminated'),
          );
        }
      } catch {
        if (!cancelled) {
          setUsers([]);
          setOrganizations([]);
          setManagers([]);
        }
      }
    }
    void loadLookups();
    return () => {
      cancelled = true;
    };
  }, [employeeId]);

  const userOptions = useMemo(() => {
    if (mode === 'edit' && initialEmployee?.user) {
      const hasCurrent = users.some((u) => u.id === initialEmployee.userId);
      if (!hasCurrent) {
        return [
          {
            id: initialEmployee.userId,
            email: initialEmployee.user.email,
            firstName: initialEmployee.user.firstName,
            lastName: initialEmployee.user.lastName,
          } as User,
          ...users,
        ];
      }
    }
    return users;
  }, [mode, initialEmployee, users]);

  const updateField = useCallback(
    <K extends keyof EmployeeFormValues>(key: K, value: EmployeeFormValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    [],
  );

  function validate(): boolean {
    const errors: Partial<Record<keyof EmployeeFormValues, string>> = {};
    if (!values.userId) {
      errors.userId = 'L’utilisateur lié est obligatoire.';
    }
    if (values.salary.trim()) {
      const n = Number.parseFloat(values.salary);
      if (Number.isNaN(n) || n < 0) {
        errors.salary = 'Le salaire doit être un nombre positif.';
      }
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const client = getApiClient();
      if (mode === 'create') {
        const created = await client.createEmployee(toCreatePayload(values));
        router.push(`/utilisateurs/employes/${created.id}`);
        router.refresh();
      } else if (employeeId) {
        await client.updateEmployee(employeeId, toUpdatePayload(values));
        router.push('/utilisateurs/employes');
        router.refresh();
      }
    } catch (error) {
      setFormError(getEmployeesErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
      {formError ? (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400"
        >
          {formError}
        </p>
      ) : null}

      <div>
        <label htmlFor={userId} className="mb-2 block text-sm font-medium text-atg-fg">
          Utilisateur lié
        </label>
        <select
          id={userId}
          name="userId"
          value={values.userId}
          onChange={(e) => updateField('userId', e.target.value)}
          disabled={mode === 'edit'}
          className="w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-60"
        >
          <option value="">Sélectionner un utilisateur</option>
          {userOptions.map((user) => (
            <option key={user.id} value={user.id}>
              {user.firstName} {user.lastName} — {user.email}
            </option>
          ))}
        </select>
        {fieldErrors.userId ? (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.userId}</p>
        ) : null}
        {mode === 'edit' ? (
          <p className="mt-1 text-xs text-atg-muted">
            L’utilisateur lié ne peut pas être modifié après création.
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor={orgId} className="mb-2 block text-sm font-medium text-atg-fg">
          Organisation
        </label>
        <select
          id={orgId}
          name="organizationId"
          value={values.organizationId}
          onChange={(e) => updateField('organizationId', e.target.value)}
          className="w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
        >
          <option value="">Aucune</option>
          {organizations.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Code employé"
          name="employeeCode"
          value={values.employeeCode}
          onChange={(e) => updateField('employeeCode', e.target.value)}
          maxLength={50}
        />
        <Input
          label="Poste"
          name="jobTitle"
          value={values.jobTitle}
          onChange={(e) => updateField('jobTitle', e.target.value)}
          maxLength={100}
        />
      </div>

      <Input
        label="Département"
        name="department"
        value={values.department}
        onChange={(e) => updateField('department', e.target.value)}
        maxLength={100}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Date d’embauche"
          name="hireDate"
          type="date"
          value={values.hireDate}
          onChange={(e) => updateField('hireDate', e.target.value)}
        />
        <Input
          label="Date de fin"
          name="terminationDate"
          type="date"
          value={values.terminationDate}
          onChange={(e) => updateField('terminationDate', e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Salaire"
          name="salary"
          type="number"
          min={0}
          step="0.01"
          value={values.salary}
          onChange={(e) => updateField('salary', e.target.value)}
          error={fieldErrors.salary}
        />
        <Input
          label="Devise"
          name="currency"
          value={values.currency}
          onChange={(e) => updateField('currency', e.target.value)}
          maxLength={3}
          hint="Code ISO à 3 lettres (ex. USD, EUR)."
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={managerId} className="mb-2 block text-sm font-medium text-atg-fg">
            Manager
          </label>
          <select
            id={managerId}
            name="managerId"
            value={values.managerId}
            onChange={(e) => updateField('managerId', e.target.value)}
            className="w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="">Aucun</option>
            {managers.map((mgr) => (
              <option key={mgr.id} value={mgr.id}>
                {mgr.user
                  ? `${mgr.user.firstName} ${mgr.user.lastName}`
                  : mgr.employeeCode ?? mgr.id.slice(0, 8)}
                {mgr.jobTitle ? ` — ${mgr.jobTitle}` : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={statusId} className="mb-2 block text-sm font-medium text-atg-fg">
            Statut
          </label>
          <select
            id={statusId}
            name="status"
            value={values.status}
            onChange={(e) =>
              updateField('status', e.target.value as EmployeeFormValues['status'])
            }
            className="w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="active">Actif</option>
            <option value="on_leave">En congé</option>
            <option value="terminated">Terminé</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <Button type="submit" loading={submitting} loadingText="Enregistrement…">
          {mode === 'create' ? 'Créer l’employé' : 'Enregistrer'}
        </Button>
        <Button type="button" variant="outline" href="/utilisateurs/employes">
          Annuler
        </Button>
      </div>
    </form>
  );
}

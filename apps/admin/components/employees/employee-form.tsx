'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';
import { useEmployeeStatusLabels } from '../../lib/i18n/use-module-labels';

import { Button, Input } from '@africatourismgate/ui';
import type {
  CreateEmployeeRequest,
  Employee,
  EmployeeStatus,
  OrganizationListItem,
  UpdateEmployeeRequest,
  User,
} from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { suggestNextEmployeeCode } from '../../lib/employee-code';
import {
  dayAfter,
  dayBefore,
  employmentDateFieldErrors,
} from '../../lib/employee-dates';

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
  const { employees: getEmployeesErrorMessage } = useAdminErrorMessages();
  const tForm = useTranslations('modules.employees.form');
  const tStatus = useEmployeeStatusLabels();
  const tActions = useTranslations('common.actions');
  const tLoading = useTranslations('common.loading');
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultOrganizationId = searchParams.get('organizationId') ?? '';
  const userId = useId();
  const orgId = useId();
  const managerId = useId();
  const statusId = useId();
  const departmentId = useId();
  const [values, setValues] = useState<EmployeeFormValues>(() => {
    if (initialEmployee) {
      return employeeToFormValues(initialEmployee);
    }
    return {
      ...defaultValues,
      ...(defaultOrganizationId ? { organizationId: defaultOrganizationId } : {}),
    };
  });
  const [users, setUsers] = useState<User[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationListItem[]>([]);
  const [existingEmployees, setExistingEmployees] = useState<Employee[]>([]);
  const [managers, setManagers] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof EmployeeFormValues, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
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
          setExistingEmployees(employeesResult.data);
          setManagers(
            employeesResult.data.filter((e) => e.id !== employeeId && e.status !== 'terminated'),
          );
        }
      } catch {
        if (!cancelled) {
          setUsers([]);
          setOrganizations([]);
          setExistingEmployees([]);
          setManagers([]);
        }
      }
    }
    void loadLookups();
    return () => {
      cancelled = true;
    };
  }, [employeeId]);

  useEffect(() => {
    let cancelled = false;
    async function loadDepartments() {
      const organizationId = values.organizationId.trim();
      if (!organizationId) {
        if (!cancelled) {
          setDepartments([]);
          setDepartmentsLoading(false);
        }
        return;
      }
      setDepartmentsLoading(true);
      try {
        const result = await getApiClient().listDepartments({
          page: 1,
          limit: 100,
          organizationId,
        });
        if (!cancelled) {
          setDepartments(result.data.map((department) => department.name));
        }
      } catch {
        if (!cancelled) {
          setDepartments([]);
        }
      } finally {
        if (!cancelled) {
          setDepartmentsLoading(false);
        }
      }
    }
    void loadDepartments();
    return () => {
      cancelled = true;
    };
  }, [values.organizationId]);

  const departmentOptions = useMemo(() => {
    const current = values.department.trim();
    if (!current || departments.includes(current)) {
      return departments;
    }
    return [...departments, current].sort((a, b) => a.localeCompare(b));
  }, [departments, values.department]);

  const suggestedEmployeeCode = useMemo(() => {
    if (mode !== 'create') return null;
    return suggestNextEmployeeCode(
      values.organizationId,
      organizations,
      existingEmployees,
    );
  }, [mode, values.organizationId, organizations, existingEmployees]);

  const linkedUserIds = useMemo(
    () => new Set(existingEmployees.map((employee) => employee.userId)),
    [existingEmployees],
  );

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

    if (mode === 'create') {
      return users.filter((user) => !linkedUserIds.has(user.id));
    }

    return users;
  }, [mode, initialEmployee, linkedUserIds, users]);

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
      errors.userId = tForm('validation.userRequired');
    } else if (mode === 'create' && linkedUserIds.has(values.userId)) {
      errors.userId = tForm('validation.userAlreadyLinked');
    }
    if (values.salary.trim()) {
      const n = Number.parseFloat(values.salary);
      if (Number.isNaN(n) || n < 0) {
        errors.salary = tForm('validation.salaryPositive');
      }
    }
    Object.assign(
      errors,
      employmentDateFieldErrors(
        values.hireDate,
        values.terminationDate,
        tForm('validation.hireBeforeTermination'),
      ),
    );
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const client = getApiClient();
      if (mode === 'create') {
        const created = await client.createEmployee(toCreatePayload(values));
        router.push(`/utilisateurs/employes/${created.id}`);
      } else if (employeeId) {
        await client.updateEmployee(employeeId, toUpdatePayload(values));
        setSuccessMessage(tForm('successSaved'));
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
      {successMessage ? (
        <p
          role="status"
          className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700 dark:border-green-900/50 dark:bg-green-950/40 dark:text-green-400"
        >
          {successMessage}
        </p>
      ) : null}
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
          {tForm('linkedUser')}
        </label>
        <select
          id={userId}
          name="userId"
          value={values.userId}
          onChange={(e) => updateField('userId', e.target.value)}
          disabled={mode === 'edit'}
          className="w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-60"
        >
          <option value="">{tForm('selectUser')}</option>
          {userOptions.map((user) => (
            <option key={user.id} value={user.id}>
              {user.firstName} {user.lastName} — {user.email}
            </option>
          ))}
        </select>
        {fieldErrors.userId ? (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.userId}</p>
        ) : null}
        {mode === 'create' ? (
          <p className="mt-1 text-xs text-atg-muted">
            {tForm('linkedUserHintCreate')}
            {userOptions.length === 0 ? ` ${tForm('noUsersAvailable')}` : null}
          </p>
        ) : null}
        {mode === 'edit' ? (
          <p className="mt-1 text-xs text-atg-muted">{tForm('linkedUserHintEdit')}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor={orgId} className="mb-2 block text-sm font-medium text-atg-fg">
          {tForm('organization')}
        </label>
        <select
          id={orgId}
          name="organizationId"
          value={values.organizationId}
          onChange={(e) => {
            const organizationId = e.target.value;
            setValues((prev) => ({
              ...prev,
              organizationId,
              department: organizationId === prev.organizationId ? prev.department : '',
            }));
            setFieldErrors((prev) => {
              const next = { ...prev };
              delete next.organizationId;
              delete next.department;
              return next;
            });
          }}
          className="w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
        >
          <option value="">{tForm('organizationNone')}</option>
          {organizations.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label={tForm('employeeCode')}
          name="employeeCode"
          value={
            mode === 'create'
              ? (suggestedEmployeeCode ?? '')
              : values.employeeCode
          }
          readOnly
          disabled={mode === 'create'}
          hint={
            mode === 'create'
              ? tForm('employeeCodeHintCreate')
              : tForm('employeeCodeHintEdit')
          }
        />
        <Input
          label={tForm('jobTitle')}
          name="jobTitle"
          value={values.jobTitle}
          onChange={(e) => updateField('jobTitle', e.target.value)}
          maxLength={100}
        />
      </div>

      <div>
        <label htmlFor={departmentId} className="mb-2 block text-sm font-medium text-atg-fg">
          {tForm('department')}
        </label>
        <select
          id={departmentId}
          name="department"
          value={values.department}
          onChange={(e) => updateField('department', e.target.value)}
          disabled={!values.organizationId || departmentsLoading}
          className="w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="">
            {!values.organizationId
              ? tForm('departmentNeedsOrganization')
              : departmentsLoading
                ? tLoading('default')
                : tForm('departmentNone')}
          </option>
          {departmentOptions.map((department) => (
            <option key={department} value={department}>
              {department}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-atg-muted">
          {values.organizationId
            ? tForm('departmentHint')
            : tForm('departmentNeedsOrganization')}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label={tForm('hireDate')}
          name="hireDate"
          type="date"
          value={values.hireDate}
          onChange={(e) => updateField('hireDate', e.target.value)}
          max={
            values.terminationDate ? dayBefore(values.terminationDate) : undefined
          }
          error={fieldErrors.hireDate}
        />
        <Input
          label={tForm('terminationDate')}
          name="terminationDate"
          type="date"
          value={values.terminationDate}
          onChange={(e) => updateField('terminationDate', e.target.value)}
          min={values.hireDate ? dayAfter(values.hireDate) : undefined}
          error={fieldErrors.terminationDate}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label={tForm('salary')}
          name="salary"
          type="number"
          min={0}
          step="0.01"
          value={values.salary}
          onChange={(e) => updateField('salary', e.target.value)}
          error={fieldErrors.salary}
        />
        <Input
          label={tForm('currency')}
          name="currency"
          value={values.currency}
          onChange={(e) => updateField('currency', e.target.value)}
          maxLength={3}
          hint={tForm('currencyHint')}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={managerId} className="mb-2 block text-sm font-medium text-atg-fg">
            {tForm('manager')}
          </label>
          <select
            id={managerId}
            name="managerId"
            value={values.managerId}
            onChange={(e) => updateField('managerId', e.target.value)}
            className="w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="">{tForm('managerNone')}</option>
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
            {tForm('status')}
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
            <option value="active">{tStatus.active}</option>
            <option value="on_leave">{tStatus.on_leave}</option>
            <option value="terminated">{tStatus.terminated}</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <Button type="submit" loading={submitting} loadingText={tLoading('submit')}>
          {mode === 'create' ? tForm('submitCreate') : tForm('submitEdit')}
        </Button>
        <Button type="button" variant="outline" href="/utilisateurs/employes">
          {tActions('cancel')}
        </Button>
      </div>
    </form>
  );
}

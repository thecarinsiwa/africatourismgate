import type { Metadata } from 'next';
import { EmployeesList } from '../../../../components/employees/employees-list';

export const metadata: Metadata = {
  title: 'Employés — Africa Tourism Gate Admin',
};

export default function EmployesPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atg-fg">Employés</h1>
        <p className="mt-2 text-sm text-atg-muted">
          Profils employés liés aux utilisateurs et organisations.
        </p>
      </div>
      <EmployeesList />
    </div>
  );
}

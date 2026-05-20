import type { Metadata } from 'next';
import { EmployeeForm } from '../../../../../components/employees/employee-form';

export const metadata: Metadata = {
  title: 'Nouvel employé — Africa Tourism Gate Admin',
};

export default function NouvelEmployePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atg-fg">Nouvel employé</h1>
        <p className="mt-2 text-sm text-atg-muted">
          Lier un utilisateur existant à une organisation.
        </p>
      </div>
      <EmployeeForm mode="create" />
    </div>
  );
}

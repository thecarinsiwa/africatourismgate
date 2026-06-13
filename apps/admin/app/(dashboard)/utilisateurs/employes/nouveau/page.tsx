import type { Metadata } from 'next';
import { AdminPageIntro } from '../../../../../components/admin-page-intro';
import { EmployeeForm } from '../../../../../components/employees/employee-form';

export const metadata: Metadata = {
  title: 'Nouvel employé — Africa Tourism Gate Admin',
};

export default function NouvelEmployePage() {
  return (
    <div>
      <AdminPageIntro description={"Lier un utilisateur existant à une organisation."} />
      <EmployeeForm mode="create" />
    </div>
  );
}

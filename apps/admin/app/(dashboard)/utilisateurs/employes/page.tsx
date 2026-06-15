import type { Metadata } from 'next';
import { AdminPageIntro } from '../../../../components/admin-page-intro';
import { EmployeesList } from '../../../../components/employees/employees-list';

export const metadata: Metadata = {
  title: 'Employés — Africa Tourism Gate Admin',
};

export default function EmployesPage() {
  return (
    <div>
      <AdminPageIntro description={"Profils employés liés aux utilisateurs et organisations."} />
      <EmployeesList />
    </div>
  );
}

import type { Metadata } from 'next';
import { EmployeeEditPage } from '../../../../../components/employees/employee-edit-page';

type PageProps = {
  params: { id: string };
};

export const metadata: Metadata = {
  title: 'Modifier l’employé — Africa Tourism Gate Admin',
};

export default function EditEmployePage({ params }: PageProps) {
  return <EmployeeEditPage employeeId={params.id} />;
}

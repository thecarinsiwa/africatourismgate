import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';
import { EmployeeEditPage } from '../../../../../components/employees/employee-edit-page';

type PageProps = {
  params: { id: string };
};

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('utilisateurs/employes/id');
}

export default function EditEmployePage({ params }: PageProps) {
  return <EmployeeEditPage employeeId={params.id} />;
}

import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../../../lib/i18n/admin-page-i18n';
import { EmployeeViewPage } from '../../../../../../components/employees/employee-view-page';

type PageProps = {
  params: { id: string };
};

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('utilisateurs/employes/id/voir');
}

export default function ViewEmployePage({ params }: PageProps) {
  return <EmployeeViewPage employeeId={params.id} />;
}

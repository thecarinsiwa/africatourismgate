'use client';

import { EmployeeForm } from '../employees/employee-form';
import { AdminIntroPage } from './admin-intro-page';

export function NouveauEmployePageContent() {
  return (
    <AdminIntroPage routePath="utilisateurs/employes/nouveau">
      <EmployeeForm mode="create" />
    </AdminIntroPage>
  );
}

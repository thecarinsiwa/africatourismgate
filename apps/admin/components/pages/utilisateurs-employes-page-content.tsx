'use client';

import { EmployeesList } from '../employees/employees-list';
import { AdminIntroPage } from './admin-intro-page';

export function EmployesPageContent() {
  return (
    <AdminIntroPage routePath="utilisateurs/employes">
      <EmployeesList />
    </AdminIntroPage>
  );
}

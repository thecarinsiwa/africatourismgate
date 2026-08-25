'use client';

import { EmployeesList } from '../employees/employees-list';
import { UsersStatCards } from '../users/users-stat-cards';
import { AdminIntroPage } from './admin-intro-page';

export function EmployesPageContent() {
  return (
    <AdminIntroPage routePath="utilisateurs/employes">
      <UsersStatCards className="mb-6" />
      <EmployeesList />
    </AdminIntroPage>
  );
}

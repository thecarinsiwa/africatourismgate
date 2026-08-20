'use client';

import { DepartmentsList } from '../departments/departments-list';
import { DepartmentsStatCards } from '../departments/departments-stat-cards';
import { AdminIntroPage } from './admin-intro-page';

export function DepartementsPageContent() {
  return (
    <AdminIntroPage routePath="utilisateurs/departements">
      <DepartmentsStatCards className="mb-6" />
      <DepartmentsList />
    </AdminIntroPage>
  );
}
